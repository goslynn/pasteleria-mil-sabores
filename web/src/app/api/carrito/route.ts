import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CarritoPostBody = {
    idUsuario: number;
    idProducto: string;
    cantidad: number;
    nombre: string;
    precio: number;
    imagenUrl?: string;
};

type CarritoPostResponse = {
    idCarrito: number;
};

export async function POST(req: NextRequest) {
    let body: CarritoPostBody;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const { idUsuario, idProducto, cantidad, nombre, precio, imagenUrl } = body;
    if (!idUsuario || !idProducto || !cantidad || !nombre || !precio) {
        return NextResponse.json(
            { error: "Faltan campos obligatorios" },
            { status: 400 }
        );
    }

    try {
        // 1. Aseguramos que exista carrito
        const carrito = await prisma.carritoCompras.upsert({
            where: { idUsuarioFk: idUsuario },
            create: { idUsuarioFk: idUsuario },
            update: {},
        });

        // 2. Verificamos si ya existe el producto en el carrito
        const existing = await prisma.carritoDetalle.findFirst({
            where: {
                idCarrito: carrito.idCarrito,
                idProducto,
            },
        });

        let detalle;
        if (existing) {
            // 3a. Si existe, actualizamos la cantidad (sumamos la nueva)
            detalle = await prisma.carritoDetalle.update({
                where: { idCarritoDetalle: existing.idCarritoDetalle },
                data: { cantidad: existing.cantidad + cantidad },
            });
        } else {
            // 3b. Si no existe, creamos el detalle
            detalle = await prisma.carritoDetalle.create({
                data: {
                    idCarrito: carrito.idCarrito,
                    idProducto,
                    cantidad,
                    nombreProducto: nombre,
                    precioUnitario: precio,
                    imagenUrl: imagenUrl ?? null,
                },
            });
        }

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
