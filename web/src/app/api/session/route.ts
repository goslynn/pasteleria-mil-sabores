import { NextResponse } from "next/server";
import {destroySession, getSessionUserId} from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    const sessionId = await getSessionUserId();

    if (sessionId) {
        const user = await prisma.usuario.findUnique({
            where: { idUsuario: sessionId },
            select: {
                idUsuario: true
            },
        });
        if (!user || user.idUsuario !== sessionId) {
            await destroySession();
            return NextResponse.json({ userId: null , message: `Usuario no encontrado; sesión destruida (${sessionId})`});
        }
    }

    return NextResponse.json({ userId: sessionId ?? null});
}

export async function DELETE() {
    await destroySession();
    return NextResponse.json({ message: "Sesión destruida" });
}
