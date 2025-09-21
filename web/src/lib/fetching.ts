import "server-only";

const {STRAPI_HOST, STRAPI_TOKEN} = process.env;
if (!STRAPI_HOST) throw new Error("Falta variable de entorno STRAPI_HOST");
if (!STRAPI_TOKEN) throw new Error("Falta variable de entorno STRAPI_TOKEN");


export type FetchOpts = Omit<RequestInit, "cache"> & {
    /** Base absoluta (ej. https://mi-sitio.com). Si no se pasa, usamos ruta relativa. */
    baseUrl?: string;
    /** Reponemos 'cache' porque Omit<RequestInit,"cache"> lo quitó arriba */
    cache?: RequestCache;
    /** Extensiones de Next.js para ISR y tagging */
    next?: {
        revalidate?: number; // segundos para ISR
        tags?: string[];     // etiquetas para revalidateTag()
    };
};

/** Opciones extra SOLO para Strapi (no rompe nextFetch) */
export type StrapiFetchOpts = FetchOpts & {
    /** Parámetros de consulta (populate, filters, etc.) */
    query?: Record<string, string | number | boolean | string[]>;
    /** Timeout opcional en ms */
    timeoutMs?: number;
};

function joinUrl(base: string | undefined, path: string): string {
    if (/^https?:\/\//i.test(path)) return path; // ya es absoluta
    if (!base) return path.startsWith("/") ? path : `/${path}`; // relativa
    return new URL(path.replace(/^\/+/, ""), base.replace(/\/+$/, "/")).toString();
}

async function parseJsonOrText(res: Response): Promise<unknown> {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) return res.json();
    return res.text();
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

function extractErrorMessage(body: unknown): string | undefined {
    if (!isRecord(body)) return undefined;

    const errField = body["error"];
    if (typeof errField === "string") return errField;

    if (isRecord(errField)) {
        const msg = errField["message"];
        if (typeof msg === "string") return msg;
    }

    return undefined;
}

function toSearchParams(q?: StrapiFetchOpts["query"]) {
    if (!q) return "";
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(q)) {
        if (Array.isArray(v)) v.forEach(x => usp.append(k, String(x)));
        else usp.set(k, String(v));
    }
    return usp.toString();
}

/**
 * Fetch contra nextjs, usable en cliente/servidor
 * @param path path que consultamos
 * @param opts inyeccion de headers / body a la peticion
 */
export async function nextFetch<T = unknown>(
    path: string,
    opts: FetchOpts = {}
): Promise<T> {
    const base =
        (opts.baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    const url = joinUrl(base, path);
    const res = await fetch(url, { cache: "no-store", ...opts });

    const body = await parseJsonOrText(res);
    if (!res.ok) {
        throw new Error(extractErrorMessage(body) ?? `HTTP ${res.status}`);
    }
    return body as T;
}

/**
 * Fetch a Strapi. ¡Solo server-side! Usa STRAPI_TOKEN del servidor.
 * @param path path que consultamos
 * @param opts inyeccion de headers / body a la peticion
 */
export async function strapiFetch<T = unknown>(
    path: string,
    opts: StrapiFetchOpts = {}
): Promise<T> {
    if (typeof window !== "undefined") {
        throw new Error("strapiFetch solo debe usarse en el servidor.");
    }

    const base = (opts.baseUrl ?? STRAPI_HOST as string).replace(/\/$/, "");
    const apiPath = `/api/${path.replace(/^\/+/, "")}`;
    const qs = toSearchParams(opts.query);
    const url = joinUrl(base, qs ? `${apiPath}?${qs}` : apiPath);

    // Timeout opcional
    const controller = new AbortController();
    const timeout =
        opts.timeoutMs && opts.timeoutMs > 0
            ? setTimeout(() => controller.abort(), opts.timeoutMs)
            : undefined;

    try {
        const res = await fetch(url, {
            cache: opts.cache ?? "no-store",
            next: opts.next,
            ...opts,
            signal: opts.signal ?? controller.signal,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${STRAPI_TOKEN}`,
                ...(opts.headers ?? {}),
            },
        });

        const body = await parseJsonOrText(res);
        if (!res.ok) {
            throw new Error(
                extractErrorMessage(body) ?? `HTTP ${res.status} ${res.statusText} @ ${url}`
            );
        }
        return body as T;
    } finally {
        if (timeout) clearTimeout(timeout);
    }
}
