import { NextRequest, NextResponse } from "next/server";
import { ProductDTO } from "@/types/product";
import { strapi } from "@/lib/fetching";
import {ProductDetailResponse, ProductResponse, ProductKey, BasicHttpError} from "@/types/server";
import { prisma } from "@/lib/db";
import { StrapiCollection } from "@/types/strapi/common";

// Forzar runtime Node
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Busca en Strapi el par (documentId, code) por code.
 * Lanza 404 si no existe, o 422 si faltan campos.
 */
async function fetchStrapiKeyByCode(code: string): Promise<{ documentId: string; code: string }> {
    const query: Record<string, string> = {
        "filters[code][$eq]": code,
        "fields[0]": "documentId",
        "fields[1]": "code",
        "publicationState": "live",
        "pagination[pageSize]": "1",
    };

    const res = await strapi.get<StrapiCollection<ProductKey>>("/api/products", { query });
    const list = res?.data ?? [];
    if (list.length === 0) {
        throw new BasicHttpError(404, `Producto code='${code}' no encontrado en Strapi.`);
    }

    const prod = list[0];
    if (!prod.code) throw new BasicHttpError(422, "El producto de Strapi no tiene code válido.");
    if (!prod.documentId) throw new BasicHttpError(422, "El producto de Strapi no tiene documentId válido.");

    return { documentId: prod.documentId, code: prod.code };
}

/**
 * Idempotente: asegura el registro local en Prisma a partir de code.
 * - Consulta Strapi por code → obtiene documentId
 * - Upsert en Prisma anclado a unique(prodDocumentId)
 * Retorna { idProducto, prodDocumentId } de Prisma.
 */
async function fetchAndUpsertProductByCode(code: string) {
    if (!code) throw new BasicHttpError(400, "Falta el code del producto en el path.");

    const key = await fetchStrapiKeyByCode(code);

    return prisma.producto.upsert({
        where: { prodDocumentId: key.documentId },
        create: {
            idProducto: key.code,       // tu "code" local
            prodDocumentId: key.documentId,
        },
        update: {
            idProducto: key.code,       // por si cambió el code en Strapi (raro, pero seguro)
        },
        select: { idProducto: true, prodDocumentId: true },
    });
}

async function getRelatedProducts(
    categorySlug: string,
    excludeProductCode: string,
    max: number
): Promise<ProductDTO[]> {
    const rel = await strapi.mapper.fetchCollection<ProductDTO>("/api/products", {
        "filters[category][slug][$eq]": categorySlug,
        "filters[code][$ne]": excludeProductCode,
        "fields[0]": "code",
        "fields[1]": "name",
        "fields[2]": "price",
        "fields[3]": "description",
        "fields[4]": "documentId",
        "populate[category][fields][0]": "name",
        "populate[category][fields][1]": "slug",
        "populate[keyImage][populate]": "*",
        "pagination[pageSize]": "100",
        "publicationState": "live",
    });

    return rel?.slice(0, max) ?? [];
}

// GET /api/product/[code]  (SIEMPRE code)
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/product/[id]">) {
    const code = (await ctx.params)?.id?.trim();
    if (!code) return NextResponse.json({ error: "code inválido" }, { status: 400 });

    // 1) Prisma por code
    let local = await prisma.producto.findFirst({
        where: { idProducto: code },
        select: { idProducto: true, prodDocumentId: true },
    });

    // 2) Si no existe local, traemos desde Strapi por code y upsert en Prisma
    if (!local) {
        try {
            local = await fetchAndUpsertProductByCode(code);
        } catch (err) {
            const e = err as BasicHttpError;
            return NextResponse.json(
                { error: "No se pudo obtener/guardar el producto", detail: e.message },
                { status: e.status ?? 500 }
            );
        }
    }

    // 3) Con documentId seguro, pedimos el detalle completo a Strapi
    const documentId = local.prodDocumentId;
    const { searchParams } = new URL(_req.url);
    const relatedParam = searchParams.get("related");
    const relatedLimit = relatedParam ? parseInt(relatedParam, 10) : 0;
    const wantRelated = Number.isFinite(relatedLimit) && relatedLimit > 0;

    const prod = await strapi.mapper.fetchObject<ProductDTO>(`/api/products/${documentId}`, {
        populate: "*",
    });

    if (!prod) {
        return NextResponse.json({ error: "Producto no encontrado en Strapi (por documentId)" }, { status: 404 });
    }

    if (!wantRelated) {
        const payload: ProductResponse = { data: { product: prod } };
        return NextResponse.json(payload);
    }

    let related: ProductDTO[] = [];
    if (prod?.category?.slug && prod?.code) {
        related = await getRelatedProducts(prod.category.slug, prod.code, relatedLimit);
    }

    const payload: ProductDetailResponse = {
        data: {
            product: prod,
            related,
        },
    };
    return NextResponse.json(payload);
}

// POST /api/product/[code] -> asegura existencia en Prisma a partir de code
export async function POST(_req: NextRequest, ctx: RouteContext<"/api/product/[id]">) {
    const code = (await ctx.params)?.id?.trim();
    if (!code) return NextResponse.json({ error: "code inválido" }, { status: 400 });

    try {
        const created = await fetchAndUpsertProductByCode(code);
        if (!created) return NextResponse.json({ error: "Imposible crear producto" }, { status: 500 });
        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err) {
        const e = err as BasicHttpError;
        return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
    }
}
