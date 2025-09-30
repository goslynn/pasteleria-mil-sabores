import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CarritoPostBody = {
    idUsuario: number;
    idProducto: string; // referencia de Strapi
    cantidad: number;
    nombre: string;
    precio: number;
    imagenUrl?: string;
};

// POST /api/carrito
export async function POST(req: NextRequest) {
    const body: CarritoPostBody = await req.json();

    if (!body?.idUsuario || !body?.idProducto || !body?.cantidad || !body?.nombre || !body?.precio) {
        return NextResponse.json(
            { error: "Faltan campos obligatorios" },
            { status: 400 }
        );
    }

    try {
        // 1. Asegurar que el usuario tiene carrito (si no existe, crearlo)
        const carrito = await prisma.carritoCompras.upsert({
            where: { idUsuarioFk: body.idUsuario },
            create: { idUsuarioFk: body.idUsuario },
            update: {},
        });

        // 2. Insertar detalle con snapshot del producto
        const detalle = await prisma.carritoDetalle.create({
            data: {
                idCarrito: carrito.idCarrito,
                idProducto: body.idProducto,
                cantidad: body.cantidad,
                nombreProducto: body.nombre,
                precioUnitario: body.precio,
                imagenUrl: body.imagenUrl ?? null,
            },
            select: {
                idCarritoDetalle: true,
                idCarrito: true,
            },
        });

        return NextResponse.json({ idCarrito: detalle.idCarrito }, { status: 201 });
    } catch (err) {
        console.error("Error en POST /carrito:", err);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
