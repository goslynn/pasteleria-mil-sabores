import {UsuarioDTO} from "@/types/user";
import {nextFetch} from "@/lib/fetching";

export async function fetchUserById(id: number): Promise<UsuarioDTO> {
    const { data } = await nextFetch<{ data: UsuarioDTO }>(`/api/user/${id}`);
    return data as UsuarioDTO;
}