"use client";

import { useEffect, useState } from "react";
import { getRegiones, getComunasByRegion, addDireccion, getDireccionesByUsuario, deleteDireccion } from "./action";
import { getCurrentUser } from "@/lib/datamapping";
import { UsuarioDTO } from "@/types/user";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FaTrash } from "react-icons/fa"; // 🗑️ ícono de basura
//import { validarDireccionGoogle } from "@/lib/google";

export default function ConfigPage() {
    const [usuario, setUsuario] = useState<UsuarioDTO | null>(null);
    const [direcciones, setDirecciones] = useState<
        { idDireccion?: number; calle: string; numero: string; departamento?: string; region: string; comuna: string }[]
    >([]);
    const [regiones, setRegiones] = useState<{ idRegion: number; nombre: string }[]>([]);
    const [comunas, setComunas] = useState<Record<number, { idComuna: number; nombre: string }[]>>({});

    useEffect(() => {
        const loadData = async () => {
            const user = await getCurrentUser();
            if (!user) return;
            setUsuario(user);

            const regionesData = await getRegiones();
            setRegiones(regionesData);

            const dirs = await getDireccionesByUsuario(user.idUsuario);

            if (dirs.length > 0) {
                const formatted = dirs.map(d => ({
                    idDireccion: d.idDireccion,
                    calle: d.calle,
                    numero: d.numero,
                    departamento: d.departamento || "",
                    region: String(d.comuna.idRegionFk),
                    comuna: String(d.idComunaFk)
                }));

                setDirecciones(formatted);

                const newComunas: Record<number, { idComuna: number; nombre: string }[]> = {};
                for (const d of formatted) {
                    const regionId = Number(d.region);
                    if (!newComunas[regionId]) {
                        const data = await getComunasByRegion(regionId);
                        newComunas[regionId] = data;
                    }
                }
                setComunas(newComunas);
            } else {
                setDirecciones([{ calle: "", numero: "", departamento: "", region: "", comuna: "" }]);
            }
        };
        loadData();
    }, []);

    const handleAddDireccion = () => {
        setDirecciones([
            ...direcciones,
            { calle: "", numero: "", departamento: "", region: "", comuna: "" },
        ]);
    };

    const handleDireccionChange = async (index: number, field: string, value: string) => {
        const nuevas = [...direcciones];
        nuevas[index] = { ...nuevas[index], [field]: value };
        setDirecciones(nuevas);

        if (field === "region" && value) {
            const regionId = Number(value);
            const data = await getComunasByRegion(regionId);
            setComunas((prev) => ({ ...prev, [regionId]: data }));
            nuevas[index].comuna = "";
            setDirecciones(nuevas);
        }
    };

    const handleSubmit = async () => {
        if (!usuario) return;

        for (const dir of direcciones) {
            if (!("idDireccion" in dir) && dir.region && dir.comuna && dir.calle && dir.numero) {
              /*
                const valid = await validarDireccionGoogle(dir.calle, dir.numero, dir.comuna, dir.region);

                if (!valid) {
                    alert(`La dirección ${dir.calle} ${dir.numero}, ${dir.comuna} no es válida.`);
                    continue; // salta esta dirección
                }
*/
                await addDireccion({
                    calle: dir.calle,
                    numero: dir.numero,
                    departamento: dir.departamento,
                    idComunaFk: Number(dir.comuna),
                    usuarioIdUsuario: usuario.idUsuario,
                });
            }
        }

        alert("Direcciones guardadas con éxito 🚀");
    };

    const handleDeleteDireccion = async (idDireccion: number) => {
        const confirm = window.confirm("¿Estás seguro de eliminar esta dirección?");
        if (!confirm) return;

        try {
            await deleteDireccion(idDireccion);
            setDirecciones(prev => prev.filter(d => d.idDireccion !== idDireccion));
            alert("Dirección eliminada ✅");
        } catch (err) {
            console.error(err);
            alert("No se pudo eliminar la dirección");
        }
    };

    if (!usuario) return <p className="p-4">Cargando usuario...</p>;

    return (
        <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
            {/* Encabezado */}
            <section className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Configuración de Usuario</h1>
                <div className="space-y-2">
                    <p><span className="font-semibold">Nombre:</span> {usuario.nombre}</p>
                    <p><span className="font-semibold">Correo:</span> {usuario.email}</p>
                    <p><span className="font-semibold">Fecha de Nacimiento:</span> {usuario.fechaNacimiento?.toString().substring(0, 10)}</p>
                </div>
            </section>

            {/* Formulario */}
            <section className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Actualizar Información</h2>
                <form className="space-y-4">
                    {/* Datos básicos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" defaultValue={usuario.nombre} className="border rounded p-2 w-full" />
                        <input type="email" defaultValue={usuario.email} className="border rounded p-2 w-full" />
                        <PasswordInput defaultValue={""} className="border rounded p-2 w-full" />
                        <input type="date" defaultValue={usuario.fechaNacimiento?.toString().split("T")[0]} className="border rounded p-2 w-full" />
                    </div>

                    {/* Botón de guardar info personal */}
                    <div>
                        <button type="button" className="bg-green-600 text-white px-6 py-2 rounded" onClick={() => alert("Aquí se guardaría la info personal")}>
                            Guardar Información Personal
                        </button>
                    </div>

                    {/* Direcciones */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Direcciones</h3>
                        {direcciones.map((dir, index) => (
                            <div key={index} className="border rounded p-4 space-y-2 relative">
                                {/* Botón eliminar */}
                                {dir.idDireccion && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteDireccion(dir.idDireccion!)}
                                        className="absolute top-2 right-0 text-red-600 hover:text-red-800"
                                        title="Eliminar dirección"
                                    >
                                        <FaTrash />
                                    </button>
                                )}

                                <select value={dir.region} onChange={(e) => handleDireccionChange(index, "region", e.target.value)} className="border rounded p-2 w-full">
                                    <option value="">Seleccionar Región</option>
                                    {regiones.map((r) => <option key={r.idRegion} value={r.idRegion}>{r.nombre}</option>)}
                                </select>

                                <select value={dir.comuna} onChange={(e) => handleDireccionChange(index, "comuna", e.target.value)} className="border rounded p-2 w-full" disabled={!dir.region}>
                                    <option value="">Seleccionar Comuna</option>
                                    {dir.region && comunas[Number(dir.region)]?.map((c) => <option key={c.idComuna} value={c.idComuna}>{c.nombre}</option>)}
                                </select>

                                <input type="text" placeholder="Calle" value={dir.calle} onChange={(e) => handleDireccionChange(index, "calle", e.target.value)} className="border rounded p-2 w-full" />
                                <input type="text" placeholder="Número" value={dir.numero} onChange={(e) => handleDireccionChange(index, "numero", e.target.value)} className="border rounded p-2 w-full" />
                                <input type="text" placeholder="Departamento" value={dir.departamento || ""} onChange={(e) => handleDireccionChange(index, "departamento", e.target.value)} className="border rounded p-2 w-full" />
                            </div>
                        ))}

                        <button type="button" onClick={handleAddDireccion} className="bg-blue-500 text-white px-4 py-2 rounded">+ Agregar Dirección</button>

                        <div>
                            <button type="button" onClick={handleSubmit} className="bg-green-600 text-white px-6 py-2 rounded">Guardar Direcciones</button>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}
