import {UsuarioDTO} from "@/types/user";

import {ProductCardDTO, ProductDTO} from "@/types/product";
import {apiFetch, cmsFetch, HttpError, QueryValue, strapi} from "@/lib/fetching";
import {StrapiCollection, StrapiObject} from "@/types/strapi/common";
import {FooterDTO} from "@/types/page-types";

// Devuelve el usuario de la sesión actual o null si no hay sesión
export async function getCurrentUser(): Promise<UsuarioDTO | null> {
    const { userId } = await apiFetch<{ userId?: number }>("/api/session", {
        cache: "no-store",
        next: { revalidate: 0 },
    });
    console.log("Fetched session id, userId:", userId);
    if (!userId) return null;

    try {
        return await getUserById(userId);
    } catch (e) {
        const isHttpError = e instanceof HttpError || (
            typeof e === "object" && e !== null &&
            "status" in e && "response" in e
        );

        if (isHttpError && e?.status === 404) {
            try {
                console.log("User not found, logging out...", e);
                const res = await apiFetch('/api/session', {method: 'DELETE'})
                console.log("response logout: ",res)
            } catch (e) {
                console.error("Error cerrando sesion : ",e)
            }
        } else {
            console.error("Error fetching /api/session:", e);
        }
        return null;
    }
}

// Devuelve un usuario por id (lanza si el endpoint falla)
export async function getUserById(id: number): Promise<UsuarioDTO> {
    const { data } = await apiFetch<{ data: UsuarioDTO }>(`/api/user/${id}`);
    return data;
}

export async function fetchProducts<T>(q : Record<string, QueryValue>, mapper : (e : ProductDTO) => T) : Promise<T[]> {
    let resp: StrapiCollection<ProductDTO>;
    try {
        resp = await strapi.get<StrapiCollection<ProductDTO>>("/api/products", { query: q });
    } catch (e) {
        console.error("error fetching products: ", e);
        return [];
    }

    return resp.data.map(mapper);
}

export async function fetchFooter<T>(
    mapper: (dto: FooterDTO) => T
): Promise<T | null> {
    const q: Record<string, string> = {
        "fields[0]": "id",
        "fields[1]": "documentId",
        "populate[socials][fields][0]": "kind",
        "populate[socials][fields][1]": "link",
        "populate[footer_sections][fields][0]": "title",
        "populate[footer_sections][populate][links][fields][0]": "label",
        "populate[footer_sections][populate][links][fields][1]": "link",
        "populate[footer_sections][populate][links][fields][2]": "external",
    }

    try {
        const resp = await strapi.get<StrapiObject<FooterDTO>>("/api/footer", { query: q })
        console.log("footer fetch", resp)
        if (!resp?.data) return null
        return mapper(resp.data)
    } catch (e) {
        console.error("error fetching footer:", e)
        return null
    }
}