import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CarritoPostBody } from "@/types/carrito";
import {isPositiveNumber} from "@/lib/utils";

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

    const { idUsuario, idProducto, cantidad, nombre, precio, imagenUrl } = body ?? {};

    if (
        !idUsuario ||
        !idProducto ||
        !isPositiveNumber(cantidad) ||
        !nombre ||
        !isPositiveNumber(precio)
    ) {
        return NextResponse.json(
            { error: "Faltan campos obligatorios o son inválidos" },
            { status: 400 }
        );
    }

    try {

        const carrito = await prisma.carritoCompras.upsert({
            where: { idUsuarioFk: idUsuario },
            create: { idUsuarioFk: idUsuario },
            update: {},
        });

        const existing = await prisma.carritoDetalle.findFirst({
            where: {
                idCarrito: carrito.idCarrito,
                idProducto: idProducto,
            },
            select: { idCarritoDetalle: true, cantidad: true }
        });

        const detalle = existing
            ? await prisma.carritoDetalle.update({
                where: { idCarritoDetalle: existing.idCarritoDetalle }, // requiere PK idCarritoDetalle en tu modelo
                data: { cantidad: existing.cantidad + cantidad },
            })
            : await prisma.carritoDetalle.create({
                data: {
                    idCarrito: carrito.idCarrito,
                    idProducto: idProducto,
                    cantidad: cantidad,
                    nombreProducto: nombre,
                    precioUnitario: precio,
                    imagenUrl: imagenUrl ?? null,
                },
            });

        const response: CarritoPostResponse = { idCarrito: detalle.idCarrito };
        return NextResponse.json(response, { status: 201 });
    } catch (err) {
        console.error("Error en POST /carrito:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
