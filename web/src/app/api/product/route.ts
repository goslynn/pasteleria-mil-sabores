import {NextRequest, NextResponse} from "next/server";
import {strapi} from "@/lib/fetching";
import {ProductQueryResponse} from "@/app/api/product/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
    const { searchParams } = new URL(_req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("cat")

    //overridea demas query params.
    if (category) {
        let products: ProductQueryResponse;
        try {
            products = await getAllOfCategory(category);
        } catch (e) {
            return NextResponse.json(
                { error: `Error consultando productos de la categoria=${category} : ${String(e)}` },
                { status: 500 }
            );
        }
        if (products.data?.length === 0) {
            return NextResponse.json({error: `No se encontraron productos de la categoria=${category}`}, { status: 404 });
        }
        return NextResponse.json({data: products}, { status: 200 });
    } else {
        //TODO : IMPLEMENTAR BUSQUEDA GENERAL
        return NextResponse.json({error: `No se implementó búsqueda general (q=${query})`}, { status: 501 });
    }
}

function emptyResponse(): ProductQueryResponse {
    return {
        data: [],
        meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } },
    };
}

async function getAllOfCategory(category: string): Promise<ProductQueryResponse> {
    if (!category?.trim()) return emptyResponse();

    try {
        return await strapi.get<ProductQueryResponse>("/api/products", {
            query: {
                "filters[category][slug][$eq]": category,
                "fields[0]": "code",
                "fields[1]": "name",
                "fields[2]": "price",
                "fields[3]": "description",
                "fields[4]": "documentId",
                "populate[category][fields][0]": "name",
                "populate[category][fields][1]": "slug",
                "populate[keyImage][populate]": "*",
                "pagination[pageSize]": "20",
                "publicationState": "live",
            },
        });
    } catch (e) {
        console.error("error fetching products", e);
        return emptyResponse();
    }
}