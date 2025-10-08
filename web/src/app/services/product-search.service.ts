// app/(services)/product-search.ts
'use server';
import 'server-only';

import { strapi, QueryValue } from '@/lib/fetching';
import { ProductQueryResponse, FindProductsParams } from '@/types/server';
import { ValidationError, NotFoundError } from '@/lib/exceptions';



const DEFAULT_PAGE_SIZE = 20 as const;

const EMPTY_RESPONSE: ProductQueryResponse = {
    data: [],
    meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } },
};


/**
 * Busca productos por categoría (slug) con paginación.
 * Mantiene el mismo shape que Strapi (ProductQueryResponse).
 * Lanza ValidationError / NotFoundError según corresponda.
 */
export async function searchProductsByCategory(params: FindProductsParams): Promise<ProductQueryResponse> {
    const category = params.category?.trim();
    const page = ensurePage(params.page);
    const pageSize = ensurePageSize(params.pageSize);

    if (!category) {
        throw new ValidationError("Falta 'category' (slug) para la búsqueda.");
    }

    const q: Record<string, QueryValue> = {
        'filters[category][slug][$eq]': category,
        'fields[0]': 'code',
        'fields[1]': 'name',
        'fields[2]': 'price',
        'fields[3]': 'description',
        'fields[4]': 'documentId',
        'populate[category][fields][0]': 'name',
        'populate[category][fields][1]': 'slug',
        'populate[keyImage][populate]': '*',
        'pagination[page]': String(page),
        'pagination[pageSize]': String(pageSize),
        publicationState: 'live',
    };

    const resp = await queryProducts(q);
    return validatePagination(
        resp,
        page,
        `No se encontraron productos de la categoria='${category}'.`,
    );
}

/**
 * Busca productos por término (name/code/category.*) con paginación.
 * Mantiene el mismo shape que Strapi (ProductQueryResponse).
 * Lanza ValidationError / NotFoundError según corresponda.
 */
export async function searchProductsByTerm(params: FindProductsParams): Promise<ProductQueryResponse> {
    const page = ensurePage(params.page);
    const pageSize = ensurePageSize(params.pageSize);
    const term = (params.q ?? '').toString();

    const q: Record<string, QueryValue> = {
        'filters[$or][0][name][$containsi]': term,
        'filters[$or][1][code][$containsi]': term,
        'filters[$or][2][category][name][$containsi]': term,
        'filters[$or][3][category][slug][$containsi]': term,
        'fields[0]': 'code',
        'fields[1]': 'name',
        'fields[2]': 'price',
        'fields[3]': 'description',
        'fields[4]': 'documentId',
        'populate[category][fields][0]': 'name',
        'populate[category][fields][1]': 'slug',
        'populate[keyImage][populate]': '*',
        'pagination[page]': String(page),
        'pagination[pageSize]': String(pageSize),
        publicationState: 'live',
    };

    const resp = await queryProducts(q);
    return validatePagination(
        resp,
        page,
        `No se encontraron productos relacionados al término='${term}'.`,
    );
}

/**
 * Punto único equivalente a tu antigua route:
 * - Si viene 'category', ignora el resto de filtros (tal como antes).
 * - Si no, busca por 'q'.
 */
export async function findProducts(params: FindProductsParams): Promise<ProductQueryResponse> {
    const page = ensurePage(params.page);
    const pageSize = ensurePageSize(params.pageSize);

    if (params.category?.trim()) {
        return searchProductsByCategory({ category: params.category.trim(), page, pageSize });
    }
    return searchProductsByTerm({ q: params.q ?? '', page, pageSize });
}

/** ─────────────────────────────────────────────────────────────
 *  Helpers (misma lógica, pero sin contexto HTTP)
 *  ────────────────────────────────────────────────────────────*/
function ensurePage(page: number): number {
    if (!Number.isFinite(page) || page <= 0) {
        throw new ValidationError("Falta query param válido: 'page' (> 0).");
    }
    return Math.trunc(page);
}

function ensurePageSize(pageSize?: number): number {
    if (pageSize == null) return DEFAULT_PAGE_SIZE;
    if (!Number.isFinite(pageSize) || pageSize <= 0) {
        throw new ValidationError("'pageSize' debe ser > 0.");
    }
    return Math.trunc(pageSize);
}

async function queryProducts(q: Record<string, QueryValue>): Promise<ProductQueryResponse> {
    try {
        // mismo endpoint y shape
        return await strapi.get<ProductQueryResponse>('/api/products', { query: q });
    } catch (e) {
        // Mantengo el "fallback" que ya tenías en tu helper original.
        // Si Strapi cae, devolvemos vacío y luego validación decide qué hacer.
        console.error('error fetching products', e);
        return EMPTY_RESPONSE;
    }
}

function validatePagination(
    resp: ProductQueryResponse | null,
    pageNum: number,
    onNoData: string,
): ProductQueryResponse {
    if (!resp) throw new NotFoundError(onNoData);

    const total = resp.data?.length ?? 0;
    const pg = resp.meta?.pagination;

    if (total === 0) {
        if (pg && pg.pageCount && pageNum > pg.pageCount) {
            throw new NotFoundError(`Página ${pageNum} fuera de rango. pageCount=${pg.pageCount}`);
        }
        throw new NotFoundError(onNoData);
    }
    return resp;
}
