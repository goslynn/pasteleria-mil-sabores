import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/carrito/[id]  → obtener carrito con sus productos
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const carrito = await prisma.carritoCompras.findUnique({
            where: { idCarrito: Number(params.id) },
            include: { carritoDetalle: true },
        });

        if (!carrito) {
            return NextResponse.json(
                { error: "Carrito no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(carrito, { status: 200 });
    } catch (err) {
        console.error("Error GET /carrito/[id]:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

// PUT /api/carrito/[id] → actualizar un producto del carrito
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const body = await req.json();

    if (!body?.idDetalle || !body?.cantidad) {
        return NextResponse.json(
            { error: "Faltan campos obligatorios" },
            { status: 400 }
        );
    }

    try {
        const detalle = await prisma.carritoDetalle.update({
            where: { idCarritoDetalle: body.idDetalle },
            data: { cantidad: body.cantidad },
        });

        return NextResponse.json(detalle, { status: 200 });
    } catch (err) {
        console.error("Error PUT /carrito/[id]:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

// DELETE /api/carrito/[id] → eliminar carrito completo
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.carritoDetalle.deleteMany({
            where: { idCarrito: Number(params.id) },
        });

        await prisma.carritoCompras.delete({
            where: { idCarrito: Number(params.id) },
        });

        return NextResponse.json({ message: "Carrito eliminado" }, { status: 200 });
    } catch (err) {
        console.error("Error DELETE /carrito/[id]:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }

}
