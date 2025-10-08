'use server';
import 'server-only';

import { prisma } from '@/lib/db';
import { strapi } from '@/lib/fetching';
import { ProductDTO } from '@/types/product';
import { ProductKey } from '@/types/server';
import { StrapiCollection } from '@/types/strapi/common';
import {NotFoundError, ValidationError} from "@/lib/exceptions";

/** Errores “normales” (sin semántica HTTP) */


/** ─────────────────────────────────────────────────────────────
 *  Helpers (misma lógica de antes, sin contexto HTTP)
 *  ────────────────────────────────────────────────────────────*/
async function fetchStrapiKeyByCode(code: string): Promise<{ documentId: string; code: string }> {
    const _code = code?.trim();
    if (!_code) throw new ValidationError('Falta el code del producto.');

    const query: Record<string, string> = {
        'filters[code][$eq]': _code,
        'fields[0]': 'documentId',
        'fields[1]': 'code',
        publicationState: 'live',
        'pagination[pageSize]': '1',
    };

    const res = await strapi.get<StrapiCollection<ProductKey>>('/api/products', { query });
    const list = res?.data ?? [];
    if (list.length === 0) {
        throw new NotFoundError(`Producto code='${_code}' no encontrado en Strapi.`);
    }

    const prod = list[0];
    if (!prod.code) throw new ValidationError('El producto de Strapi no tiene code válido.');
    if (!prod.documentId) throw new ValidationError('El producto de Strapi no tiene documentId válido.');

    return { documentId: prod.documentId, code: prod.code };
}

/** Garantiza el registro local en Prisma anclado a prodDocumentId */
async function fetchAndUpsertProductByCode(code: string) {
    const key = await fetchStrapiKeyByCode(code);

    return prisma.producto.upsert({
        where: { prodDocumentId: key.documentId },
        create: {
            idProducto: key.code,
            prodDocumentId: key.documentId,
        },
        update: {
            idProducto: key.code,
        },
        select: { idProducto: true, prodDocumentId: true },
    });
}

/** Pide relacionados a Strapi y hace slice(max) igual que antes */
async function getRelatedProducts(
    categorySlug: string,
    excludeProductCode: string,
    max: number,
): Promise<ProductDTO[]> {
    const rel = await strapi.mapper.fetchCollection<ProductDTO>('/api/products', {
        'filters[category][slug][$eq]': categorySlug,
        'filters[code][$ne]': excludeProductCode,
        'fields[0]': 'code',
        'fields[1]': 'name',
        'fields[2]': 'price',
        'fields[3]': 'description',
        'fields[4]': 'documentId',
        'populate[category][fields][0]': 'name',
        'populate[category][fields][1]': 'slug',
        'populate[keyImage][populate]': '*',
        'pagination[pageSize]': '100',
        publicationState: 'live',
    });

    return rel?.slice(0, max) ?? [];
}

/** Asegura existencia local (si no hay, crea) y retorna el ProductDTO desde Strapi (documentId) */
async function ensureAndFetchProductDTO(code: string): Promise<ProductDTO> {
    const _code = code?.trim();
    if (!_code) throw new ValidationError('code inválido');

    // 1) Buscar local por code
    let local = await prisma.producto.findFirst({
        where: { idProducto: _code },
        select: { idProducto: true, prodDocumentId: true },
    });

    // 2) Si no existe local, traer de Strapi y upsert
    if (!local) {
        local = await fetchAndUpsertProductByCode(_code);
    }

    // 3) Con el documentId seguro, pedir detalle a Strapi
    const prod = await strapi.mapper.fetchObject<ProductDTO>(`/api/products/${local.prodDocumentId}`, {
        populate: '*',
    });

    if (!prod) {
        throw new NotFoundError('Producto no encontrado en Strapi (por documentId).');
    }

    return prod;
}

/** ─────────────────────────────────────────────────────────────
 *  API del servicio (sin uniones, retornos claros)
 *  ────────────────────────────────────────────────────────────*/

/**
 * Obtiene un producto por code (sin relacionados).
 * Mismas validaciones y flujo que antes, pero retorna directamente el ProductDTO.
 */
export async function getProductByCode(code: string): Promise<ProductDTO> {
    return ensureAndFetchProductDTO(code);
}

/**
 * Obtiene un producto y N relacionados.
 * Retorna un objeto con { product, related } (sin unión de tipos).
 */
export async function getProductWithRelated(
    code: string,
    relatedMax: number,
): Promise<{ product: ProductDTO; related: ProductDTO[] }> {
    const product = await ensureAndFetchProductDTO(code);

    let related: ProductDTO[] = [];
    if (relatedMax > 0 && product?.category?.slug && product?.code) {
        related = await getRelatedProducts(product.category.slug, product.code, relatedMax);
    }

    return { product, related };
}

/**
 * Asegura existencia local en Prisma a partir de code.
 * Igual que el antiguo POST, pero sin semántica HTTP.
 */
export async function ensureProductExistsByCode(code: string): Promise<{ ok: true }> {
    const _code = code?.trim();
    if (!_code) throw new ValidationError('code inválido');

    const created = await fetchAndUpsertProductByCode(_code);
    if (!created) throw new Error('Imposible crear producto');
    return { ok: true };
}
