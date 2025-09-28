import {NextRequest, NextResponse} from "next/server";
import {strapi} from "@/lib/fetching";
import {StrapiCollection} from "@/types/strapi/common";
import {ProductDTO} from "@/types/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/product/[id]">) {
    const { id } = await ctx.params;

    if (!id || id.trim() === "") {
        return NextResponse.json({ error: "id inválido" }, { status: 400 });
    }

    const resp = await strapi.get<StrapiCollection<ProductDTO>>(`/api/products/${id}`, {
        query: {
            "populate": "*"
        }
    })

    console.log("Product detail", resp);

    return resp.data ?
        NextResponse.json({ data: resp.data }) :
        NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
}