/*
 * Global HTTP utilities for both Server (SSR/Route Handlers) and Client.
 * - apiFetch: for calling your own Next.js app (self API / route handlers)
 * - cmsFetch: for calling Strapi CMS (requires env vars)
 *
 * Goals
 * 1) Global: works in server and client (derives base URL in SSR).
 * 2) Fully parameterizable per request.
 * 3) Separate functions for Next.js (apiFetch) and Strapi (cmsFetch).
 * 4) Strapi via env at top; throw if missing.
 * 5) Generic typed return; propagate HTTP errors via HttpError.
 * 6) Support Strapi query params abstraction to JSON.
 */

// Check Strapi env vars at module load time
import {StrapiCollection, StrapiObject} from "@/types/strapi/common";
import {StrapiMapper} from "@/lib/strapi-client";

const STRAPI_HOST = process.env.NEXT_PUBLIC_STRAPI_HOST || process.env.STRAPI_HOST;
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || process.env.STRAPI_TOKEN;

if (!STRAPI_HOST || !STRAPI_TOKEN) {
    throw new Error(
        "STRAPI_HOST / STRAPI_TOKEN no están definidos. Configura NEXT_PUBLIC_STRAPI_HOST y NEXT_PUBLIC_STRAPI_TOKEN (o STRAPI_HOST/STRAPI_TOKEN)."
    );
}

/** Minimal shape for Next.js extra options supported by fetch */
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

function encodeOne(v: QueryPrimitive): string {
    if (v === null || v === undefined) return "";
    return encodeURIComponent(String(v));
}

function appendQuery(url: string, query?: Record<string, QueryValue>): string {
    if (!query || Object.keys(query).length === 0) return url;

    const [baseAndPath, hash = ""] = url.split("#", 2);
    const [base, existingSearch = ""] = baseAndPath.split("?", 2);

    const parts: string[] = [];
    if (existingSearch) parts.push(existingSearch);

    const push = (k: string, val: QueryPrimitive): void => {
        // no encodeamos la key (Strapi necesita los []), solo el valor
        parts.push(`${k}=${encodeURIComponent(String(val))}`);
    };

    for (const [k, v] of Object.entries(query)) {
        if (v == null) continue;

        if (Array.isArray(v)) {
            for (const item of v) {
                if (item == null) continue;                 // <- filtra undefined/null
                push(k, item as QueryPrimitive);            // item ya es string|number|boolean
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
        // Dynamic import to avoid client-side errors
        const { headers } = await import('next/headers');
        const hOrPromise = headers();

        // Handle both async and sync headers() returns
        const maybeThen = hOrPromise?.then;
        const isThenable = typeof maybeThen === "function";

        return isThenable ? await hOrPromise : hOrPromise;
    } catch {
        return null;
    }
}

async function getServerBaseUrl(): Promise<string> {
    // Prefer public URL if exists
    const envUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
    if (envUrl) return sanitizeBase(envUrl);

    // Derive from headers in SSR
    const h = await getNextHeaders();
    if (h) {
        try {
            const proto = h.get("x-forwarded-proto") ?? "http";
            const host = h.get("x-forwarded-host") ?? h.get("host");
            if (host) return `${proto}://${host}`;
        } catch {
            // headers() not available
        }
    }

    // Fallback dev
    return "http://localhost:3000";
}

async function parseBody(res: Response, mode: FetchOptions["parse"]): Promise<unknown> {
    if (typeof mode === "function") return mode(res);
    if (mode === "json") return res.json();
    if (mode === "text") return res.text();
    // auto: try JSON, if fails return text
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
        cache: "no-store",
        ...rest,
        headers: rest.headers,
    });

    const data = (await parseBody(res, parse)) as T | string | null;
    if (!res.ok) throw new HttpError<T>(res, data as T | string | null);
    return data as T;
}

/**
 * Fetch against your own Next.js app (routes /api or route handlers).
 * - In SSR automatically derives the host from headers/env.
 * - In client allows relative URL (delegates to browser).
 * - forwardCookies: forward cookies from SSR for same-origin (default true).
 */
export async function apiFetch<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
    const {
        baseUrl,
        query,
        forwardCookies = true,
        headers: hdrs,
        ...rest
    } = opts;

    const base = sanitizeBase(
        baseUrl || (isServer ? await getServerBaseUrl() : "")
    );

    let url = joinUrl(base, path);
    url = appendQuery(url, query);

    let headersFinal: HeadersInit | undefined = hdrs;

    // In SSR, if same-origin and forwardCookies=true, inject Cookie
    if (isServer && forwardCookies) {
        const h = await getNextHeaders();
        if (h) {
            try {
                const proto = h.get("x-forwarded-proto") ?? "http";
                const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
                if (host) {
                    const currentOrigin = `${proto}://${host}`;
                    const targetOrigin = isAbsolute(url) ? new URL(url).origin : currentOrigin;
                    if (targetOrigin === currentOrigin) {
                        const cookie = h.get("cookie");
                        if (cookie) headersFinal = mergeHeaders(headersFinal, { cookie });
                    }
                }
            } catch {
                // ignore
            }
        }
    }

    return coreFetch<T>(url, { ...rest, headers: headersFinal });
}

/**
 * Fetch against Strapi CMS using Bearer token from env.
 * - Uses STRAPI_HOST and STRAPI_TOKEN defined at start (throws error if missing).
 * - Allows baseUrl override if you need to hit another host.
 * - Adds Authorization: Bearer <token> by default (you can overwrite headers).
 * - Supports Strapi-specific query params abstraction.
 */
export async function cmsFetch<T = unknown>(
    path: string,
    opts: FetchOptions = {}
): Promise<T> {
    const {
        baseUrl,
        query,
        headers: hdrs,
        ...rest
    } = opts;

    const base = sanitizeBase(baseUrl || STRAPI_HOST);

    let url = joinUrl(base, path);
    url = appendQuery(url, query);

    const authHeaders: HeadersInit = {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
    };
    const headersFinal = mergeHeaders(authHeaders, hdrs);

    return coreFetch<T>(url, { ...rest, headers: headersFinal });
}

type Fetcher = <T>(path: string, opts?: FetchOptions) => Promise<T>;

export interface Client {
    // HTTP básicos
    get<T>(url: string, opts?: FetchOptions): Promise<T>;

    post<T>(url: string, body?: unknown, opts?: FetchOptions): Promise<T>;

    put<T>(url: string, body?: unknown, opts?: FetchOptions): Promise<T>;

    patch<T>(url: string, body?: unknown, opts?: FetchOptions): Promise<T>;

    delete<T>(url: string, opts?: FetchOptions): Promise<T>;
}

export function clientOf(fetcher: Fetcher) : Client {
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


    return {
        get,
        post,
        put,
        patch,
        delete: del,
    };
}

export function strapiClientOf(fetcher: Fetcher) {
    const client = clientOf(fetcher);
    return {
        ...client,
        mapper: new StrapiMapper(client)
    }

}

export const nextApi = clientOf(apiFetch);
export const strapi = strapiClientOf(cmsFetch);
