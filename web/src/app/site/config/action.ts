"use server";

import { prisma } from "@/lib/db";

export async function getRegiones() {
    return prisma.region.findMany({
        select: { idRegion: true, nombre: true },
    });
}

export async function getComunasByRegion(idRegion: number) {
    return prisma.comuna.findMany({
        where: { idRegionFk: idRegion },
        select: { idComuna: true, nombre: true },
    });
}
export async function addDireccion(data: {
    calle: string;
    numero: string;
    departamento?: string;
    idComunaFk: number;
    usuarioIdUsuario: number;
}) {
    const exists = await prisma.direccion.findFirst({
        where: {
            calle: data.calle,
            numero: data.numero,
            departamento: data.departamento || null,
            idComunaFk: data.idComunaFk,
            usuarioIdUsuario: data.usuarioIdUsuario,
        },
    });

    if (exists) return exists;

    return prisma.direccion.create({
        data: {
            calle: data.calle,
            numero: data.numero,
            departamento: data.departamento || null,
            idComunaFk: data.idComunaFk,
            usuarioIdUsuario: data.usuarioIdUsuario,
        },
    });
}
export async function getDireccionesByUsuario(usuarioId: number | undefined  ) {
    return prisma.direccion.findMany({
        where: { usuarioIdUsuario: usuarioId },
        select: {
            idDireccion: true,
            calle: true,
            numero: true,
            departamento: true,
            idComunaFk: true,
            comuna: { select: { nombre: true, idRegionFk: true } },
        },
    });
}
// actions.ts (server)
export async function deleteDireccion(idDireccion: number) {
    try {
        await prisma.direccion.delete({
            where: { idDireccion },
        });
        return { success: true };
    } catch (err) {
        console.error("Error al eliminar dirección:", err);
        throw new Error("No se pudo eliminar la dirección");
    }
}


