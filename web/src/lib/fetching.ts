/*
 * Global HTTP utilities for both Server (SSR/Route Handlers) and Client.
 * - apiFetch: for calling your own Next.js app (self API / route handlers)
 * - cmsFetch: for calling Strapi CMS (requires env vars)
 */

import { StrapiMapper } from "@/lib/strapi-client";

const STRAPI_INTERNAL_URL =
    process.env.STRAPI_INTERNAL_URL ||
    process.env.STRAPI_HOST || // compat antiguo
    undefined;

const STRAPI_PUBLIC_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_HOST || // compat antiguo
    process.env.STRAPI_PUBLIC_URL || // opcional
    STRAPI_INTERNAL_URL; // último recurso

const STRAPI_SERVER_TOKEN = process.env.STRAPI_TOKEN || undefined;
const STRAPI_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || undefined;

export type NextExtras = {
    next?: {
        revalidate?: number | false;
        tags?: string[];
    };
};

export type QueryPrimitive = string | number | boolean | null | undefined;
export type QueryValue = QueryPrimitive | QueryPrimitive[];

export type FetchOptions = RequestInit &
    NextExtras & {
    /** Base URL override (e.g., http://localhost:3000). If omitted, resolved contextually. */
    baseUrl?: string;
    /** Query params appended to the URL */
    query?: Record<string, QueryValue>;
    /**
     * How to parse the response.
     * - 'auto': try JSON, else text (default)
     * - 'json': always parse JSON
     * - 'text': always parse text
     * - custom: a function to parse Response
     */
    parse?: "auto" | "json" | "text" | ((res: Response) => Promise<unknown>);
    /** Forward request cookies from SSR to same-origin requests (default true) */
    forwardCookies?: boolean;
    /**
     * Force using server base resolution even in contexts donde window está definido.
     * Útil para edge/SSR raros. Por defecto false.
     */
    useServer?: boolean;
};

/** Error type thrown on non-2xx HTTP responses */
export class HttpError<T = unknown> extends Error {
    status: number;
    statusText: string;
    url: string;
    data: T | string | null;
    headers: Headers;

    constructor(res: Response, data: T | string | null) {
        super(`HTTP ${res.status} ${res.statusText}`);
        this.name = "HttpError";
        this.status = res.status;
        this.statusText = res.statusText;
        this.url = res.url;
        this.data = data;
        this.headers = res.headers;
    }

    toString(): string {
        return `HttpError: ${this.status} ${this.statusText} - ${this.url} - Data: ${JSON.stringify(this.data)}`;
    }
}

/** =========================
 *  Internal helpers
 *  ========================= */
const isServer = typeof window === "undefined";

function sanitizeBase(base?: string): string {
    return (base || "").replace(/\/$/, "");
}

function isAbsolute(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

function appendQuery(url: string, query?: Record<string, QueryValue>): string {
    if (!query || Object.keys(query).length === 0) return url;

    const [baseAndPath, hash = ""] = url.split("#", 2);
    const [base, existingSearch = ""] = baseAndPath.split("?", 2);

    const parts: string[] = [];
    if (existingSearch) parts.push(existingSearch);

    const push = (k: string, val: QueryPrimitive): void => {
        parts.push(`${k}=${encodeURIComponent(String(val))}`);
    };

    for (const [k, v] of Object.entries(query)) {
        if (v == null) continue;
        if (Array.isArray(v)) {
            for (const item of v) {
                if (item == null) continue;
                push(k, item as QueryPrimitive);
            }
        } else {
            push(k, v as QueryPrimitive);
        }
    }

    const qs = parts.filter(Boolean).join("&");
    return `${base}${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
}

function joinUrl(base: string, path: string): string {
    if (isAbsolute(path)) return path;
    if (!base) return path; // allow relative on client
    return `${sanitizeBase(base)}/${path.replace(/^\//, "")}`;
}

/**
 * Lazy load Next.js headers only when needed (server-side)
 */
async function getNextHeaders(): Promise<Headers | null> {
    if (!isServer) return null;
    try {
        const { headers } = await import("next/headers");
        const hOrPromise = headers();

        const maybeThen = hOrPromise?.then;
        const isThenable = typeof maybeThen === "function";

        return isThenable ? await hOrPromise : hOrPromise;
    } catch {
        return null;
    }
}

async function getOriginFromHeaders(): Promise<string | null> {
    const h = await getNextHeaders();
    if (!h) return null;
    try {
        const proto = h.get("x-forwarded-proto") ?? "http";
        const host = h.get("x-forwarded-host") ?? h.get("host");
        if (host) return `${proto}://${host}`;
    } catch {
        // ignore
    }
    return null;
}

async function getServerBaseUrl(): Promise<string> {
    // 1) Mejor fuente: headers en SSR (respeta proxy/rewrite/ingress)
    const fromHdr = await getOriginFromHeaders();
    if (fromHdr) return sanitizeBase(fromHdr);

    // 2) Envs habituales (prod)
    const envUrlRaw =
        process.env.SITE_URL || // recomendado
        process.env.NEXT_PUBLIC_SITE_URL || // compat
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
        process.env.RENDER_EXTERNAL_URL || // Render.com
        "";

    if (envUrlRaw) return sanitizeBase(envUrlRaw);

    // 3) Fallback dev
    return "http://localhost:3000";
}

async function parseBody(res: Response, mode: FetchOptions["parse"]): Promise<unknown> {
    if (typeof mode === "function") return mode(res);
    if (mode === "json") return res.json();
    if (mode === "text") return res.text();
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
}

function mergeHeaders(a?: HeadersInit, b?: HeadersInit): HeadersInit | undefined {
    if (!a && !b) return undefined;
    const h = new Headers(a || {});
    const hb = new Headers(b || {});
    hb.forEach((v, k) => h.set(k, v));
    return h as unknown as HeadersInit;
}

/** Core fetch used by both apiFetch and cmsFetch */
async function coreFetch<T>(fullUrl: string, opts: FetchOptions): Promise<T> {
    const { parse = "auto", ...rest } = opts;

    const res = await fetch(fullUrl, {
        ...rest,
        headers: rest.headers,
    });

    const data = (await parseBody(res, parse)) as T | string | null;

    if (!res.ok) {
        throw new HttpError<T>(res, data as T | string | null);
    }
    return data as T;
}

/** =========================
 *  apiFetch (self API)
 *  ========================= */
export async function apiFetch<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
    const {
        baseUrl,
        query,
        forwardCookies = true,
        headers: hdrs,
        useServer = false,
        ...rest
    } = opts;

    // Si estamos en server o el caller fuerza server, resolvemos origin de server.
    const shouldUseServerBase = isServer || useServer;

    const base = sanitizeBase(
        baseUrl || (shouldUseServerBase ? await getServerBaseUrl() : "")
    );

    let url = joinUrl(base, path);
    url = appendQuery(url, query);

    let headersFinal: HeadersInit | undefined = hdrs;

    // En SSR, si same-origin y forwardCookies=true, inyecta Cookie
    if (shouldUseServerBase && forwardCookies) {
        const h = await getNextHeaders();
        if (h) {
            try {
                const origin = await getOriginFromHeaders();
                const targetOrigin = isAbsolute(url) ? new URL(url).origin : origin;
                if (origin && targetOrigin === origin) {
                    const cookie = h.get("cookie");
                    if (cookie) headersFinal = mergeHeaders(headersFinal, { cookie });
                }
            } catch {
                // ignore
            }
        }
    }

    return coreFetch<T>(
        url,
        {
            ...rest,
            headers: headersFinal,
            cache: "no-store", // el caller puede overridear con opts.cache
        });
}

/** =========================
 *  cmsFetch (Strapi)
 *  ========================= */
export async function cmsFetch<T = unknown>(
    path: string,
    opts: FetchOptions = {}
): Promise<T> {
    const { baseUrl, query, headers: hdrs, ...rest } = opts;

    // Elegimos base según contexto
    const baseResolved = sanitizeBase(
        baseUrl ||
        (isServer ? STRAPI_INTERNAL_URL : STRAPI_PUBLIC_URL) ||
        "" // dejamos que falle abajo con mensaje claro
    );

    if (!baseResolved) {
        throw new Error(
            isServer
                ? "Falta STRAPI_INTERNAL_URL (o STRAPI_HOST). Define la URL interna del CMS para SSR."
                : "Falta NEXT_PUBLIC_STRAPI_URL (o NEXT_PUBLIC_STRAPI_HOST). Define la URL pública del CMS para el navegador."
        );
    }

    let url = joinUrl(baseResolved, path);
    url = appendQuery(url, query);

    // Token según contexto (opcional si tu endpoint es público)
    const token = isServer ? STRAPI_SERVER_TOKEN : STRAPI_PUBLIC_TOKEN;

    const authHeaders: HeadersInit =
        token ? { Authorization: `Bearer ${token}` } : {};

    const headersFinal = mergeHeaders(authHeaders, hdrs);

    return coreFetch<T>(url, { ...rest, headers: headersFinal });
}

/** =========================
 *  Clientes
 *  ========================= */
type Fetcher = <T>(path: string, opts?: FetchOptions) => Promise<T>;

export interface Client {
    get<T>(url: string, opts?: FetchOptions): Promise<T>;
    post<T>(url: string, body?: unknown, opts?: FetchOptions): Promise<T>;
    put<T>(url: string, body?: unknown, opts?: FetchOptions): Promise<T>;
    patch<T>(url: string, body?: unknown, opts?: FetchOptions): Promise<T>;
    delete<T>(url: string, opts?: FetchOptions): Promise<T>;
}

export function clientOf(fetcher: Fetcher): Client {
    async function get<T>(url: string, opts?: FetchOptions) {
        return fetcher<T>(url, { ...opts, method: "GET" });
    }

    async function post<T>(url: string, body?: unknown, opts?: FetchOptions) {
        return fetcher<T>(url, {
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
            headers: mergeHeaders(
                body instanceof FormData ? {} : { "Content-Type": "application/json" },
                opts?.headers
            ),
            ...opts,
        });
    }

    async function put<T>(url: string, body?: unknown, opts?: FetchOptions) {
        return fetcher<T>(url, {
            method: "PUT",
            body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
            headers: mergeHeaders(
                body instanceof FormData ? {} : { "Content-Type": "application/json" },
                opts?.headers
            ),
            ...opts,
        });
    }

    async function patch<T>(url: string, body?: unknown, opts?: FetchOptions) {
        return fetcher<T>(url, {
            method: "PATCH",
            body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
            headers: mergeHeaders(
                body instanceof FormData ? {} : { "Content-Type": "application/json" },
                opts?.headers
            ),
            ...opts,
        });
    }

    async function del<T>(url: string, opts?: FetchOptions) {
        return fetcher<T>(url, { ...opts, method: "DELETE" });
    }

    return { get, post, put, patch, delete: del };
}

export function strapiClientOf(fetcher: Fetcher) {
    const client = clientOf(fetcher);
    return {
        ...client,
        mapper: new StrapiMapper(client),
    };
}

const nextApi = clientOf(apiFetch);
export default nextApi
export const strapi = strapiClientOf(cmsFetch);
