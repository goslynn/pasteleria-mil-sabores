import {UsuarioDTO} from "@/types/user";

import {ProductCardDTO, ProductDTO} from "@/types/product";
import {apiFetch, cmsFetch, HttpError, QueryValue} from "@/lib/fetching";
import {StrapiList} from "@/types/strapi/common";

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

export async function fetchProducts(): Promise<ProductCardDTO[]> {
    const q: Record<string, QueryValue> = {
        "fields[0]": "code",
        "fields[1]": "name",
        "fields[2]": "price",
        "fields[3]": "description",
        "populate[images][fields][0]": "url",
        "populate[images][fields][1]": "formats",
        "pagination[pageSize]": "100",
        "publicationState": "live",
    };

    let data: { data: StrapiList<ProductDTO> };
    try {
        data = await cmsFetch<{ data: StrapiList<ProductDTO> }>('/api/products', {
            query: q
        })
    } catch (e) {
        console.log("error fetching products: ", e);
        return [];
    }

    console.log("raw data products: ", data);

    //TODO: Fix desde aqui en adelante...

    const toCard = (p: ProductDTO): ProductCardDTO => {
        const { documentId, code, name, price, images, category } = p ?? {};
        return { documentId, code, name, price, images, category };
    };

    const toCardList = (list?: StrapiList<ProductDTO>): ProductCardDTO[] =>
        (list?.data ?? []).map(toCard);

    return data ?? { data: [] }.data ? toCardList(data.data) : [];
}