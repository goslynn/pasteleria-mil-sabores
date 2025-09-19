export type FetchOpts = Omit<RequestInit, "cache"> & {
    /** Base absoluta (ej. https://mi-sitio.com). Si no se pasa, usamos ruta relativa. */
    baseUrl?: string;

    /** Reponemos 'cache' porque Omit<RequestInit,"cache"> lo quitó arriba */
    cache?: RequestCache;

    /** Extensiones de Next.js para ISR y tagging */
    next?: {
        revalidate?: number;    // segundos para ISR
        tags?: string[];        // etiquetas para revalidateTag()
    };
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
    console.log("fetch response: " + res);

    const body = await parseJsonOrText(res);
    if (!res.ok) {
        throw new Error(extractErrorMessage(body) ?? `HTTP ${res.status}`);
    }
    console.log("fetch body: " +body);
    return body as T;
}

/**
 * Fetch a Strapi. ¡Solo server-side! Usa STRAPI_TOKEN del servidor.
 * @param path path que consultamos
 * @param opts inyeccion de headers / body a la peticion
 */
export async function strapiFetch<T = unknown>(
    path: string,
    opts: FetchOpts = {}
): Promise<T> {
    if (typeof window !== "undefined") {
        throw new Error("strapiFetch solo debe usarse en el servidor.");
    }

    const base = (opts.baseUrl ?? process.env.STRAPI_HOST ?? "http://localhost:1337").replace(/\/$/, "");
    const url = joinUrl(base, `/api/${path.replace(/^\/+/, "")}`);

    const res = await fetch(url, {
        cache: "no-store",
        ...opts,
        headers: {
            ...(opts.headers ?? {}),
            Authorization: `Bearer ${process.env.STRAPI_TOKEN ?? ""}`,
        },
    });
    console.log("fetch response: " + res);

    const body = await parseJsonOrText(res);
    if (!res.ok) {
        throw new Error(extractErrorMessage(body) ?? `HTTP ${res.status}`);
    }
    console.log("fetch body: " +body);
    return body as T;
}
