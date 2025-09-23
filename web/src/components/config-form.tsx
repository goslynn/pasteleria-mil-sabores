// config-form.tsx
"use client";

import { ConfigPageProps, DireccionForm } from "@/types/direccionDTO";
import { useDirecciones } from "@/app/site/config/useDirecciones";
import { FaTrash } from "react-icons/fa";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function ConfigPage({
                               usuario,
                               direcciones: initialDirecciones,
                               regiones,
                               comunasPorRegion,
                           }: ConfigPageProps) {
    const {
        direcciones,
        handleDireccionChange,
        handleAddDireccion,
        handleSaveDireccion,
        handleDeleteDireccion,
        handleEditUsuario,
        handleUsuarioChange,
        usuario: usuarioState,
        handleUpdateDireccion,
    } = useDirecciones(initialDirecciones, usuario);

    return (
        <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
            {/* Información del usuario */}
            <section className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Configuración de Usuario</h1>
                <div className="space-y-2">
                    <p><span className="font-semibold">Nombre:</span> {usuarioState.nombre}</p>
                    <p><span className="font-semibold">Correo:</span> {usuarioState.email}</p>
                    <p>
                        <span className="font-semibold">Fecha de Nacimiento:</span>{" "}
                        {usuarioState.fechaNacimiento
                            ? new Date(usuarioState.fechaNacimiento).toISOString().split("T")[0]
                            : "-"}
                    </p>
                </div>
            </section>

            {/* Formulario de actualización */}
            <section className="bg-background shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Actualizar Información</h2>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={usuarioState.nombre}
                            onChange={e => handleUsuarioChange("nombre", e.target.value)}
                            className="border rounded p-2 w-full"
                        />
                        <input
                            type="email"
                            value={usuarioState.email}
                            onChange={e => handleUsuarioChange("email", e.target.value)}
                            className="border rounded p-2 w-full"
                        />
                        <PasswordInput
                            placeholder="Nueva contraseña"
                            value={usuarioState.password ?? ""}
                            onChange={e => handleUsuarioChange("password", e.target.value)}
                            className="border rounded p-2 w-full"
                        />
                        <input
                            type="date"
                            value={usuarioState.fechaNacimiento ? new Date(usuarioState.fechaNacimiento).toISOString().split("T")[0] : ""}
                            onChange={e => handleUsuarioChange("fechaNacimiento", e.target.value)}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => handleEditUsuario(usuarioState)}
                        className="bg-primary text-primary-foreground px-3 py-1 rounded"
                    >
                        Guardar
                    </button>
                    {/* Direcciones */}
                    <div className="space-y-4 mt-6">
                        <h3 className="text-lg font-semibold">Direcciones</h3>

                        {direcciones.map((dir, index) => (
                            <div key={dir.idDireccion ?? index} className="border rounded p-4 space-y-2 relative bg-card text-card-foreground">
                                {/* Select Región */}
                                <select
                                    value={dir.region}
                                    onChange={(e) => handleDireccionChange(index, "region", e.target.value)}
                                    className="border rounded p-2 w-full bg-input text-foreground"
                                >
                                    <option value="">Seleccionar Región</option>
                                    {regiones.map((r) => (
                                        <option key={r.idRegion} value={String(r.idRegion)}>{r.nombre}</option>
                                    ))}
                                </select>

                                {/* Select Comuna */}
                                <select
                                    value={dir.comuna}
                                    onChange={(e) => handleDireccionChange(index, "comuna", e.target.value)}
                                    className="border rounded p-2 w-full bg-input text-foreground"
                                    disabled={!dir.region}
                                >
                                    <option value="">Seleccionar Comuna</option>
                                    {dir.region &&
                                        comunasPorRegion[Number(dir.region)]?.map((c) => (
                                            <option key={c.idComuna} value={String(c.idComuna)}>{c.nombre}</option>
                                        ))
                                    }
                                </select>

                                {/* Calle, Número y Departamento */}
                                <input type="text" placeholder="Calle" value={dir.calle} onChange={(e) => handleDireccionChange(index, "calle", e.target.value)} className="border rounded p-2 w-full bg-input text-foreground" />
                                <input type="text" placeholder="Número" value={dir.numero} onChange={(e) => handleDireccionChange(index, "numero", e.target.value)} className="border rounded p-2 w-full bg-input text-foreground" />
                                <input type="text" placeholder="Departamento" value={dir.departamento || ""} onChange={(e) => handleDireccionChange(index, "departamento", e.target.value)} className="border rounded p-2 w-full bg-input text-foreground" />

                                {/* Botón Guardar / Actualizar */}
                                {dir.idDireccion ? (
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateDireccion(dir)}
                                        className="bg-primary text-primary-foreground px-3 py-1 rounded"
                                    >
                                        Actualizar
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleSaveDireccion(dir)}
                                        className="bg-primary text-primary-foreground px-3 py-1 rounded"
                                    >
                                        Guardar
                                    </button>
                                )}
                                {/* Botón eliminar */}
                                {dir.idDireccion && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteDireccion(dir, index)}
                                        className="absolute bottom-5 right-3 text-destructive hover:text-red-800"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Botón agregar nuevo formulario */}
                        <button
                            type="button"
                            onClick={handleAddDireccion}
                            className="bg-secondary text-secondary-foreground px-4 py-2 rounded"
                        >
                            + Agregar Dirección
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
