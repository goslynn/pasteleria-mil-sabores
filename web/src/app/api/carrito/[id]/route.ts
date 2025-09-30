import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const idUsuario = Number(id);

    const carrito = await prisma.carritoCompras.findUnique({
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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const idCarrito = Number(id);

    try {
        await prisma.carritoDetalle.deleteMany({ where: { idCarrito } });
        await prisma.carritoCompras.delete({ where: { idCarrito } });

        return NextResponse.json({ message: "Carrito eliminado" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
