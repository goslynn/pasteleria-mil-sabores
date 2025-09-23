"use server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { DireccionForm } from "@/types/direccion";
import {UsuarioDTO} from "@/types/user";

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

export async function getDireccionesByUsuario(usuarioId: number): Promise<DireccionForm[]> {
    const result = await prisma.direccion.findMany({
        where: { usuarioIdUsuario: usuarioId },
        select: {
            idDireccion: true,
            calle: true,
            numero: true,
            departamento: true,
            comuna: {
                select: {
                    idComuna: true,
                    nombre: true,
                    region: { select: { idRegion: true, nombre: true } },
                },
            },
        },
    });

    return result.map((d) => ({
        idDireccion: d.idDireccion,
        calle: d.calle,
        numero: d.numero,
        departamento: d.departamento ?? "",
        region: d.comuna.region.idRegion,
        comuna: d.comuna.idComuna,
    }));
}

export async function addDireccion(data: {
    calle: string;
    numero: string;
    departamento?: string;
    idComunaFk: number;
    usuarioIdUsuario: number;
}) {
    return prisma.direccion.create({ data });
}
export async function updateDireccion(direccion: DireccionForm) {
    const dirNueva: Prisma.DireccionUpdateInput = {
        calle: direccion.calle,
        numero: direccion.numero,
        departamento: direccion.departamento,
        comuna: {
            connect: { idComuna: direccion.comuna }
        }
    };

    await prisma.direccion.update({
        where: { idDireccion: direccion.idDireccion },
        data: dirNueva
    });
}

export async function direccionExiste(us: UsuarioDTO ,dir : DireccionForm) {
    const existing = await prisma.direccion.findFirst({
        where: {
            usuarioIdUsuario: us.idUsuario,
            calle: dir.calle,
            numero : dir.numero,
            departamento: dir.departamento,
            idComunaFk: dir.comuna,
        }
    });
    return !!existing;
}

export async function deleteDireccion(idDireccion: number) {
    return prisma.direccion.delete({ where: { idDireccion } });
}

export async function updateUsuario(us: UsuarioDTO) {
    const updateData: Prisma.UsuarioUpdateInput = {
        nombre: us.nombre,
        email: us.email,
        fechaNacimiento: new Date(us.fechaNacimiento),
    };

    if (us.password?.trim()) {
        updateData.password = await hashPassword(us.password);
    }

    return await prisma.usuario.update({
        where: { idUsuario: us.idUsuario },
        data: updateData,
    });
}
