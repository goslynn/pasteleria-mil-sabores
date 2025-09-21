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
 */

import { headers as nextHeaders } from "next/headers";
import {ReadonlyHeaders} from "next/dist/server/web/spec-extension/adapters/headers";

const STRAPI_HOST = process.env.NEXT_PUBLIC_STRAPI_HOST || process.env.STRAPI_HOST;
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || process.env.STRAPI_TOKEN;

if (!STRAPI_HOST || !STRAPI_TOKEN) {
    throw new Error(
        "STRAPI_HOST / STRAPI_TOKEN no están definidos. Configura NEXT_PUBLIC_STRAPI_URL y NEXT_PUBLIC_STRAPI_TOKEN (o STRAPI_URL/STRAPI_TOKEN)."
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
    const qs: string[] = [];
    for (const [k, v] of Object.entries(query)) {
        if (Array.isArray(v)) {
            for (const item of v) qs.push(`${encodeURIComponent(k)}=${encodeOne(item)}`);
        } else {
            qs.push(`${encodeURIComponent(k)}=${encodeOne(v)}`);
        }
    }
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${qs.length ? sep + qs.join("&") : ""}`;
}

function joinUrl(base: string, path: string): string {
    if (isAbsolute(path)) return path;
    if (!base) return path; // allow relative on client
    return `${sanitizeBase(base)}/${path.replace(/^\//, "")}`;
}

/**
 * Some Next.js versions return headers() as a Promise; others return it sync.
 * This helper normalizes both cases WITHOUT using `any`.
 */
async function getReadonlyHeaders(): Promise<ReadonlyHeaders> {
    const hOrPromise = nextHeaders();
    const maybeThen = (hOrPromise as unknown as { then?: unknown }).then;
    const isThenable = typeof maybeThen === "function";
    return isThenable
        ? await (hOrPromise as unknown as Promise<ReadonlyHeaders>)
        : (hOrPromise as unknown as ReadonlyHeaders);
}

async function getServerBaseUrl(): Promise<string> {
    // Prefer URL pública si existe
    const envUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
    if (envUrl) return sanitizeBase(envUrl);

    // Derivar de headers en SSR — using normalized headers()
    try {
        const h = await getReadonlyHeaders();
        const proto = h.get("x-forwarded-proto") ?? "http";
        const host = h.get("x-forwarded-host") ?? h.get("host");
        if (host) return `${proto}://${host}`;
    } catch {
        // headers() no disponible
    }

    // Fallback dev
    return "http://localhost:3000";
}

async function parseBody(res: Response, mode: FetchOptions["parse"]): Promise<unknown> {
    if (typeof mode === "function") return mode(res);
    if (mode === "json") return res.json();
    if (mode === "text") return res.text();
    // auto: intenta JSON, si falla, retorna texto
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

/** =========================
 *  Public API
 *  ========================= */

/**
 * Fetch contra tu propia app Next.js (rutas /api o route handlers).
 * - En SSR deriva automáticamente el host a partir de headers/env.
 * - En cliente permite URL relativa (delega en el navegador).
 * - forwardCookies: reenviar cookies desde SSR para same-origin (por defecto true).
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

    // En SSR, si es same-origin y forwardCookies=true, inyectar Cookie (aunque la URL sea absoluta)
    if (isServer && forwardCookies) {
        try {
            const h = await getReadonlyHeaders();
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

    return coreFetch<T>(url, { ...rest, headers: headersFinal });
}

/**
 * Fetch contra Strapi CMS usando token Bearer de env.
 * - Usa STRAPI_URL y STRAPI_TOKEN definidos al inicio (lanza error si faltan).
 * - Permite override de baseUrl por si necesitas pegarle a otro host.
 * - Agrega Authorization: Bearer <token> por defecto (puedes sobre-escribir headers).
 */
export async function cmsFetch<T = unknown>(
    path: string,
    opts: FetchOptions = {}
): Promise<T> {
    const { baseUrl, query, headers: hdrs, ...rest } = opts;
    const base = sanitizeBase(baseUrl || STRAPI_HOST!);
    let url = joinUrl(base, path);
    url = appendQuery(url, query);

    const authHeaders: HeadersInit = {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
    };
    const headersFinal = mergeHeaders(authHeaders, hdrs);

    return coreFetch<T>(url, { ...rest, headers: headersFinal });
}

/**
 * Helpers de conveniencia (opcionales)
 */
export const http = {
    get: async <T>(url: string, opts?: FetchOptions) => apiFetch<T>(url, { ...opts, method: "GET" }),
    post: async <T>(url: string, body?: unknown, opts?: FetchOptions) =>
        apiFetch<T>(url, {
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
            headers: mergeHeaders({ "Content-Type": "application/json" }, opts?.headers),
            ...opts,
        }),
};

