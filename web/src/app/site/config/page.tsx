import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/datamapping";
import { UsuarioDTO } from "@/types/user";
import { PasswInput } from "@/components/ui/passw-input";
import { FaTrash } from "react-icons/fa"; // 🗑️ ícono de basura
//import { validarDireccionGoogle } from "@/lib/google";
import {getComunasByRegion, getDireccionesByUsuario, getRegiones} from "./action";
import { ConfigPage } from "@/components/config-form";

export default async function RegisterPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/");

    const direcciones = await getDireccionesByUsuario(user.idUsuario);

    const regiones = await getRegiones();
    const comunasPorRegion: Record<number, { idComuna: number; nombre: string }[]> = {};
    for (const region of regiones) {
        const comunas = await getComunasByRegion(region.idRegion);
        comunasPorRegion[region.idRegion] = comunas;
    }

    return (
        <main className="flex items-center justify-center min-h-screen p-4">
            <ConfigPage usuario={user}
                        direcciones={direcciones}
                        regiones={regiones}
                        comunasPorRegion={comunasPorRegion}
            />
        </main>
    );
}
