import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { Prisma } from "@/generated/prisma"
import type { ProductData, Money, Discount } from "@/types/product"

// Tipo EXACTO que esperamos del findMany (incluyendo relaciones)
type ProductoWithJoins = Prisma.ProductoGetPayload<{
    include: {
        productoCategoria: { include: { categoria: true } }
        precio: true // aunque a veces filtremos por priceList, sigue siendo Precio[]
    }
}>

// Mapea Prisma -> ProductData sin any
function mapProductoToProductData(p: ProductoWithJoins): ProductData {
    const firstPrecio = p.precio?.[0]
    const firstCategoria = p.productoCategoria?.[0]?.categoria

    let discount: Discount | undefined

    if (firstPrecio?.precioProducto) {
        discount = {
            type: "percentage",
            value: firstPrecio.precioProducto
        };
    }

    const money: Money = {
        amount: firstPrecio?.precioProducto ?? 0,
        currency: "CLP",
        priceInCents: false,
    }

    return {
        id: p.idProducto,
        name: p.nombre,
        description: p.descripcion,
        category: firstCategoria?.nombre ?? "Sin categoría",
        imageUrl: p.imgURL ?? "",
        price: money,
        discount,
    }
}

export async function GET(req: Request) {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const category = url.searchParams.get("category")
    const priceList = url.searchParams.get("priceList")

    try {
        const productos = await prisma.producto.findMany({
            where: {
                ...(id ? {idProducto: Number(id)} : {}),
                ...(category
                    ? {
                        productoCategoria: {
                            some: {categoria: {nombre: category}}
                        }
                    }
                    : {}),
            },
            include: {
                productoCategoria: {
                    include: {
                        categoria: true
                    }
                },
                precio: priceList
                    ? {
                        where: {
                            lista: {
                                nombreLista: priceList
                            }
                        }
                    }
                    : true,
            },
        });

        // Tipamos el array resultante con el payload definido arriba
        const productosTyped = productos as unknown as ProductoWithJoins[]


        return NextResponse.json(productosTyped.map(mapProductoToProductData))
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Error consultando productos" },
            { status: 500 },
        )
    }
}
