import { NextRequest, NextResponse } from "next/server";
import {QueryValue, strapi} from "@/lib/fetching";
import {BasicHttpError, ProductQueryResponse} from "@/types/server";
import { parsePositiveInt } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
    const { searchParams } = new URL(_req.url);

    const page = searchParams.get("page");
    const pageNum = page ? parsePositiveInt(page) : null;

    if (!pageNum) {
        return NextResponse.json(
            { error: "falta query param: 'page?=n'" },
            { status: 400 }
        );
    }

    const term = searchParams.get("q") || "";
    const category = searchParams.get("cat");

    // overridea demas query params cuando hay categoria
    if (category) {
        let res: ProductQueryResponse;
        try {
            res = await getAllOfCategory(category, pageNum);
        } catch (e) {
            return NextResponse.json(
                { error: `Error consultando productos de la categoria=${category} : ${String(e)}` },
                { status: 500 }
            );
        }


        try {
            const products = await validatePagination(
                res,
                pageNum,
                `No se encontraron productos de la categoria=${category}`);
            return NextResponse.json({ data: products }, { status: 200 });
        } catch (e) {
            const err = e as BasicHttpError;
            return NextResponse.json({error: err.message}, {status: err.status})
        }

    } else {
        const strapiQuery : Record<string, QueryValue> = {
            "filters[$or][0][name][$containsi]": term,
            "filters[$or][1][code][$containsi]": term,
            "filters[$or][2][category][name][$containsi]": term,
            "filters[$or][3][category][slug][$containsi]": term,
            "fields[0]": "code",
            "fields[1]": "name",
            "fields[2]": "price",
            "fields[3]": "description",
            "fields[4]": "documentId",
            "populate[category][fields][0]": "name",
            "populate[category][fields][1]": "slug",
            "populate[keyImage][populate]": "*",
            "pagination[page]": String(page),
            "pagination[pageSize]": "20",
            "publicationState": "live",
        }

        let res2: ProductQueryResponse;
        try {
            res2 = await queryProducts(strapiQuery);
        } catch (e) {
            return NextResponse.json(
                {error: `Error consultando productos relacionados con el termindo=${term} : ${String(e)}`},
                { status: 500 }
            )
        }
        console.log("query result", res2);
        try {
            const products2 = await validatePagination(
                res2,
                pageNum,
                `No se encontraron productos relacionados al termino=${term}`);
            return NextResponse.json({ data: products2 }, { status: 200 });
        } catch (e) {
            const err = e as BasicHttpError;
            return NextResponse.json({error: err.message}, {status: err.status})
        }
    }
}

const EMPTY_RESPONSE: ProductQueryResponse = {
    data: [],
    meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } },
};

async function getAllOfCategory(category: string, page: number): Promise<ProductQueryResponse> {
    if (!category?.trim()) return EMPTY_RESPONSE;

    return queryProducts({
        "filters[category][slug][$eq]": category,
        "fields[0]": "code",
        "fields[1]": "name",
        "fields[2]": "price",
        "fields[3]": "description",
        "fields[4]": "documentId",
        "populate[category][fields][0]": "name",
        "populate[category][fields][1]": "slug",
        "populate[keyImage][populate]": "*",
        "pagination[page]": String(page),
        "pagination[pageSize]": "20",
        "publicationState": "live",
    });
}

async function queryProducts(q: Record<string, QueryValue>) {
    try {
        console.log("query: ", q);
        return await strapi.get<ProductQueryResponse>("/api/products", { query: q });
    } catch (e) {
        console.error("error fetching products", e);
        return EMPTY_RESPONSE;
    }
}

async function validatePagination(resp : ProductQueryResponse | null,
                                  pageNum : number,
                                  onNoData : string = "No se encontraron resultados") {
    if (!resp) {
        throw new BasicHttpError(404, onNoData);
    }
    const pg = resp.meta?.pagination;
    if ((resp.data?.length ?? 0) === 0) {
        if (pg && pg.pageCount && pageNum > pg.pageCount) {
            throw new BasicHttpError(404, `Página ${pageNum} fuera de rango. pageCount=${pg.pageCount}`)
        }
        // No hay productos para la categoría en general
        throw new BasicHttpError(404, onNoData);
    }
    return resp;
}

// async function standardResponse(fetcher: (q: Record<string, QueryValue>) => Promise<ProductQueryResponse>,
//                                 q: Record<string, QueryValue>) {
//
//     let res: ProductQueryResponse;
//     try {
//         res = await fetcher(q);
//     } catch (e) {
//         return NextResponse.json(
//             {error: `Error consultando productos de la categoria=${category} : ${String(e)}`},
//             {status: 500}
//         );
//     }
//
//
//     try {
//         const products = validatePagination(
//             res,
//             pageNum,
//             `No se encontraron productos de la categoria=${category}`);
//         return NextResponse.json({data: products}, {status: 200});
//     } catch (e) {
//         const err = e as BasicHttpError;
//         return NextResponse.json({error: err.message}, {status: err.status})
//     }
//
// }
