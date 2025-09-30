import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/carrito/[id]/detalle/[idDetalle]
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string; idDetalle: string } }
) {
    const idCarrito = Number(params.id);
    const idDetalle = Number(params.idDetalle);

    if (!idCarrito || !idDetalle) {
        return NextResponse.json(
            { error: "Parámetros inválidos" },
            { status: 400 }
        );
    }

    try {
        // Verificar que el detalle existe en el carrito
        const detalle = await prisma.carritoDetalle.findFirst({
            where: { idCarrito, idCarritoDetalle: idDetalle },
        });

        if (!detalle) {
            return NextResponse.json(
                { error: "Producto no encontrado en el carrito" },
                { status: 404 }
            );
        }

        // Borrar el detalle
        await prisma.carritoDetalle.delete({
            where: { idCarritoDetalle: idDetalle },
        });

        // Opcional: verificar si quedó vacío el carrito y borrarlo
        const restantes = await prisma.carritoDetalle.count({
            where: { idCarrito },
        });
        if (restantes === 0) {
            await prisma.carritoCompras.delete({ where: { idCarrito } });
        }

        return NextResponse.json(
            { message: "Producto eliminado del carrito" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error DELETE /carrito/[id]/detalle/[idDetalle]:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
