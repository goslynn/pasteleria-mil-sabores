import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ error: "id inválido" }, { status: 400 });
    }

    const user = await prisma.usuario.findUnique({
        where: { idUsuario: id },
        select: {
            idUsuario: true, nombre: true, email: true,
            fechaNacimiento: true, createdAt: true,
        },
    });

    return user
        ? NextResponse.json({ data: user })
        : NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
}
