import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string; idDetalle: string } }
) {
    const idCarrito = Number(params.id);        // <-- aquí cambia
    const idDetalle = Number(params.idDetalle);

    if (!idCarrito || !idDetalle) {
        return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    try {
        const detalle = await prisma.carritoDetalle.findFirst({
            where: { idCarrito, idCarritoDetalle: idDetalle },
        });

        if (!detalle) {
            return NextResponse.json({ error: "Producto no encontrado en el carrito" }, { status: 404 });
        }

        await prisma.carritoDetalle.delete({
            where: { idCarritoDetalle: idDetalle },
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
    { params }: { params: { id: string; idDetalle: string } } 
) {
    const idCarrito = Number(params.id);
    const idDetalle = Number(params.idDetalle);
    const { cantidad } = await req.json();

    if (!idCarrito || !idDetalle || !cantidad) {
        return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    try {
        const detalle = await prisma.carritoDetalle.findFirst({
            where: { idCarrito, idCarritoDetalle: idDetalle },
        });

        if (!detalle) {
            return NextResponse.json({ error: "Producto no encontrado en el carrito" }, { status: 404 });
        }

        const actualizado = await prisma.carritoDetalle.update({
            where: { idCarritoDetalle: idDetalle },
            data: { cantidad },
        });

        return NextResponse.json(actualizado, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

