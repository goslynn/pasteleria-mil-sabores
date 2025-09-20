import {NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/user/[id]">) {
    const { id } = await ctx.params;

    let idNum : number;
    try {
        idNum = Number(id);
    } catch {
        return NextResponse.json({ error: "id inválido, debe ser numerico" }, { status: 400 });
    }


    if (!Number.isInteger(idNum) || idNum <= 0) {
        return NextResponse.json({ error: "id inválido" }, { status: 400 });
    }

    const user = await prisma.usuario.findUnique({
        where: { idUsuario: idNum },
        select: {
            idUsuario: true, nombre: true, email: true,
            fechaNacimiento: true, createdAt: true,
        },
    });

    return user
        ? NextResponse.json({ data: user })
        : NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
}
