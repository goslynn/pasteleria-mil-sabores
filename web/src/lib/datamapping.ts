import {UsuarioDTO} from "@/types/user";

import {strapi, apiFetch, HttpError, QueryValue} from "@/lib/fetching";
import {StrapiCollection, StrapiObject} from "@/types/strapi/common";
import {FooterDTO} from "@/types/page-types";
import {ProductDTO} from "@/types/product";
import {ProductCardProps} from "@/components/ui/product-card";
import {ProductDetail} from "@/components/ui/product-detail";

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

export const toProductCard = (dto: ProductDTO): ProductCardProps => {
    return {
        category: dto?.category?.name,
        id: dto.code,
        imageSrc: dto.keyImage,
        name: dto.name,
        price: dto.price,
        href: `/site/product/${dto.code}`,
    }
}

export const toProductDetail = (dto: ProductDTO) : ProductDetail => {
    const cat = dto.category
        ? { name: dto.category.name, slug: dto.category.slug }
        : null;

    return {
        category: cat,
        code: dto.code,
        description: dto.description,
        images: dto.images,
        keyImage: dto.keyImage,
        name: dto.name,
        price: dto.price,
    };
}


export async function fetchCollection<DTO>(
    endpoint: string,
    q: Record<string, QueryValue>
): Promise<DTO[]>;

export async function fetchCollection<DTO, OUT>(
    endpoint: string,
    q: Record<string, QueryValue>,
    mapper: (e: DTO) => OUT
): Promise<OUT[]>;

export async function fetchCollection<DTO, OUT>(
    endpoint: string,
    q: Record<string, QueryValue>,
    mapper?: (e: DTO) => OUT
): Promise<(DTO | OUT)[]> {
    try {
        const resp = await strapi.get<StrapiCollection<DTO>>(endpoint, { query: q });
        return mapper ? resp.data.map(mapper) : resp.data;
    } catch (e) {
        console.error(`error fetching ${endpoint}:`, e);
        return [];
    }
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
        if (!resp?.data) return null
        return mapper(resp.data)
    } catch (e) {
        console.error("error fetching footer:", e)
        return null
    }
}


export async function fetchObject<DTO, OUT>(
    endpoint: string,
    q: Record<string, QueryValue>,
    mapper: (dto: DTO) => OUT
): Promise<OUT | null> ;


export async function fetchObject<DTO>(
    endpoint: string,
    q: Record<string, QueryValue>
): Promise<DTO | null>;

export async function fetchObject<DTO, OUT>(
    endpoint: string,
    q: Record<string, QueryValue>,
    mapper?: (dto: DTO) => OUT
): Promise<DTO | OUT | null> {
    try {
        const resp = await strapi.get<StrapiObject<DTO>>(endpoint, { query: q });
        if (!resp?.data) return null;
        return mapper ? mapper(resp.data) : resp.data;
    } catch (e) {
        console.error(`error fetching ${endpoint}:`, e);
        return null;
    }
}

