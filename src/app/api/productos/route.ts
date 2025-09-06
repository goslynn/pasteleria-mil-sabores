// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ProductData, Money, Discount } from "@/types/product";

// Función para mapear Prisma -> ProductData
function mapProductoToProductData(producto: any, precio?: any, categoria?: any): ProductData {
    let discount: Discount | undefined;

    // ejemplo simple: si hay descuento
    if (precio?.descuento) {
        discount = {
            type: "percentage",
            value: precio.descuento.porcentaje,
        };
    }

    const money: Money = {
        amount: precio?.precioUnitario || 0,
        currency: "CLP",
        priceInCents: false,
    };

    return {
        id: producto.idProducto,
        name: producto.nombre,
        description: producto.descripcion,
        category: categoria?.nombre || "Sin categoría",
        imageUrl: producto.imgURL || "",
        price: money,
        discount,
    };
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // filtrar por idProducto
    const category = url.searchParams.get("category"); // filtrar por categoría
    const priceList = url.searchParams.get("priceList"); // filtrar por lista de precios

    try {
        const productos = await prisma.producto.findMany({
            where: {
                ...(id ? { idProducto: Number(id) } : {}),
                ...(category
                    ? {
                        productoCategoria: {
                            some: { categoria: { nombre: category } },
                        },
                    }
                    : {}),
            },
            include: {
                productoCategoria: {
                    include: {
                        categoria: true,
                    },
                },
                precio: priceList
                    ? {
                        where: { lista: { nombreLista: priceList } },
                    }
                    : true,
            },
        });

        // Mapear a ProductData
        const result: ProductData[] = productos.map((p) => {
            const firstPrecio = Array.isArray(p.precio) ? p.precio[0] : undefined;
            const firstCategoria = Array.isArray(p.productoCategoria)
                ? p.productoCategoria[0]?.categoria
                : undefined;
            return mapProductoToProductData(p, firstPrecio, firstCategoria);
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
    }
}
