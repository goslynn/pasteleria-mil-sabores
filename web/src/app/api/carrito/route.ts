import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CarritoPostBody } from "@/types/carrito";
import {isPositiveNumber} from "@/lib/utils";
import {nextApi} from "@/lib/fetching";
import {ProductDTO} from "@/types/product";
import {getSessionUserId} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CarritoPostResponse = { idCarrito: number };

export async function POST(req: NextRequest) {
    let body: CarritoPostBody;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }
    let idUsuario = await getSessionUserId();
    if (!idUsuario) idUsuario = 1;

    const {code, cantidad } = body ?? {};

    if (!idUsuario || !code || !isPositiveNumber(cantidad)) {
        return NextResponse.json(
            { error: "Faltan campos obligatorios o son inválidos" },
            { status: 400 }
        );
    }

    try {
        const res = await nextApi.get<{ data: { product: ProductDTO } }>(`/api/product/${code}`);
        const product = res?.data?.product;

        if (!product?.code || !product.name || !product.price) {
            return NextResponse.json({ error: "Producto inválido" }, { status: 404 });
        }
        const carrito = await prisma.carritoCompras.upsert({
            where: { idUsuarioFk: idUsuario },
            create: { idUsuarioFk: idUsuario },
            update: {},
        });

        const existing = await prisma.carritoDetalle.findFirst({
            where: {
                idCarrito: carrito.idCarrito,
                idProducto: product.code,
            },
            select: { idCarritoDetalle: true, cantidad: true }
        });

        const detalle = existing
            ? await prisma.carritoDetalle.update({
                where: { idCarritoDetalle: existing.idCarritoDetalle },
                data: { cantidad: existing.cantidad + cantidad },
            })
            : await prisma.carritoDetalle.create({
                data: {
                    idCarrito: carrito.idCarrito,
                    idProducto: product.code,
                    cantidad: cantidad,
                    nombreProducto: product.name,
                    precioUnitario: product.price,
                },
            });

        return NextResponse.json({ idCarrito: detalle.idCarrito }, { status: 201 });
    } catch (err) {
        console.error("Error en POST /carrito:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
export async function GET(req: NextRequest) {

    let idUsuario = await getSessionUserId();
    if (!idUsuario) idUsuario = 1;


    let carrito = await prisma.carritoCompras.findUnique({
        where: { idUsuarioFk: idUsuario },
        include: { carritoDetalle: true },
    });

    if (!carrito)
        return NextResponse.json({
            idCarrito: 0,
            idUsuarioFk: idUsuario,
            carritoDetalle: [],
        });


    return NextResponse.json(carrito);
}