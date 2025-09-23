// useDirecciones.ts
"use client";

import { useState, useTransition } from "react";
import { DireccionForm } from "@/types/direccionDTO";
import {addDireccion, deleteDireccion, direccionExiste, updateDireccion, updateUsuario} from "@/app/site/config/action";
import { UsuarioDTO } from "@/types/user";

export function useDirecciones(initial: DireccionForm[], initialUsuario: UsuarioDTO) {
    const [usuario, setUsuario] = useState<UsuarioDTO>(initialUsuario);
    const [direcciones, setDirecciones] = useState<DireccionForm[]>(initial);
    const [isPending, startTransition] = useTransition();

    // Cambiar valores de inputs
    const handleDireccionChange = (index: number, field: keyof DireccionForm, value: string) => {
        setDirecciones(prev =>
            prev.map((dir, i) =>
                i === index
                    ? {
                        ...dir,
                        [field]: field === "region" || field === "comuna" ? Number(value) : value,
                        ...(field === "region" ? { comuna: 0 } : {}), // resetear comuna si cambia región
                    }
                    : dir
            )
        );
    };



    const handleAddDireccion = () => {
        setDirecciones(prev => [
            ...prev,
            { calle: "", numero: "", departamento: "", region: 0, comuna: 0 },
        ]);
    };


    // Guardar una dirección individual en la base de datos
    const handleSaveDireccion = (dir: DireccionForm) => {
        startTransition(async () => {
            const existe = await direccionExiste(usuario, dir);
            if (existe) {
                alert("Esta dirección ya existe");
                return;
            }

            const newDir = await addDireccion({
                calle: dir.calle,
                numero: dir.numero,
                departamento: dir.departamento ?? "",
                idComunaFk: (dir.comuna),
                usuarioIdUsuario: usuario.idUsuario,
            });

            setDirecciones(prev =>
                prev.map(d =>
                    d === dir
                        ? { ...d, idDireccion: newDir.idDireccion }
                        : d
                )
            );
            alert("Direccion se guardo con exito");
        });
    };
// Actualizar una dirección existente
    const handleUpdateDireccion = (dir: DireccionForm) => {
        if (!dir.idDireccion) {
            alert("Esta dirección aún no está guardada. Usa 'Guardar' para crearla primero.");
            return;
        }

        startTransition(async () => {
            try {
                await updateDireccion(dir);

                // Actualizamos el estado local para reflejar cualquier cambio
                setDirecciones(prev =>
                    prev.map(d => (d.idDireccion === dir.idDireccion ? { ...dir } : d))
                );

                alert("Dirección actualizada correctamente");
            } catch (error) {
                console.error("Error actualizando dirección:", error);
                alert("No se pudo actualizar la dirección");
            }
        });
    };


    // Eliminar dirección del backend y del state
    const handleDeleteDireccion = (dir: DireccionForm, index: number) => {
        if (!confirm("¿Eliminar esta dirección?")) return;

        startTransition(async () => {
            if (dir.idDireccion) {
                await deleteDireccion(dir.idDireccion);
            }
            setDirecciones(prev => prev.filter((_, i) => i !== index));
        });
    };
    const handleEditUsuario = (usuario: UsuarioDTO) => {
        startTransition(async () => {
            if (usuario.idUsuario) {
                await updateUsuario(usuario);
                alert("Usuario actualizado correctamente ");
            }

        })
    }
    const handleUsuarioChange = (field: keyof UsuarioDTO, value: string) => {
        setUsuario(prev => ({
            ...prev,
            [field]: field === "fechaNacimiento" ? new Date(value) : value,
        }));
    };


    return {
        direcciones,
        handleDireccionChange,
        handleAddDireccion,
        handleSaveDireccion,
        handleDeleteDireccion,
        handleEditUsuario,
        handleUsuarioChange,
        usuario,
        handleUpdateDireccion,
    };
}
