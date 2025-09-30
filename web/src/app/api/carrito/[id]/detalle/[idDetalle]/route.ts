import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; idDetalle: string }> } // <-- cambio aquí
) {
    const { id, idDetalle } = await params; // <-- await params
    const idCarrito = Number(id);
    const idDetalleNum = Number(idDetalle);

    if (!idCarrito || !idDetalleNum) {
        return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    try {
        const detalle = await prisma.carritoDetalle.findFirst({
            where: { idCarrito, idCarritoDetalle: idDetalleNum },
        });

        if (!detalle) {
            return NextResponse.json({ error: "Producto no encontrado en el carrito" }, { status: 404 });
        }

        await prisma.carritoDetalle.delete({
            where: { idCarritoDetalle: idDetalleNum },
        });

        const restantes = await prisma.carritoDetalle.count({ where: { idCarrito } });
        if (restantes === 0) {
            await prisma.carritoCompras.delete({ where: { idCarrito } });
        }

        return NextResponse.json({ message: "Producto eliminado del carrito" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; idDetalle: string }> } // <-- cambio aquí
) {
    const { id, idDetalle } = await params; // <-- await params
    const idCarrito = Number(id);
    const idDetalleNum = Number(idDetalle);
    const { cantidad } = await req.json();

    if (!idCarrito || !idDetalleNum || !cantidad) {
        return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    try {
        const detalle = await prisma.carritoDetalle.findFirst({
            where: { idCarrito, idCarritoDetalle: idDetalleNum },
        });

        if (!detalle) {
            return NextResponse.json({ error: "Producto no encontrado en el carrito" }, { status: 404 });
        }

        const actualizado = await prisma.carritoDetalle.update({
            where: { idCarritoDetalle: idDetalleNum },
            data: { cantidad },
        });

        return NextResponse.json(actualizado, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
