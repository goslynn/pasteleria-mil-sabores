import {UsuarioDTO} from "@/types/user";

import nextApi, {strapi, HttpError} from "@/lib/fetching";
import StrapiObject from "@/types/strapi/common";
import {FooterDTO} from "@/types/page-types";
import {CategoryDTO, ProductDTO} from "@/types/product";
import {ProductCardProps} from "@/components/ui/product-card";
import {ProductDetail} from "@/components/ui/product-detail";
import {CategoryItem} from "@/components/ui/category";

// Devuelve el usuario de la sesión actual o null si no hay sesión
export async function getCurrentUser(): Promise<UsuarioDTO | null> {
    const { userId } = await nextApi.get<{ userId?: number }>("/api/session", {
        cache: "no-store",
        next: { revalidate: 0 },
        credentials: "include"
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
                const res = await nextApi.delete('/api/session')
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
    const { data } = await nextApi.get<{ data: UsuarioDTO }>(`/api/user/${id}`, {
        cache: "no-store",
        next: { revalidate: 0 },
    });
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

export const toCategoryItem = (dto : CategoryDTO) : CategoryItem => {
    return {
        title: dto.name,
        description: dto.description,
        image: dto.image,
        href: `/site/product?cat=${dto.slug}&page=1`
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
        const resp = await strapi.get<StrapiObject<FooterDTO>>("/api/footer", { query: q ,
        next:{revalidate: 300}})

        if (!resp?.data) return null
        return mapper(resp.data)
    } catch (e) {
        console.error("error fetching footer:", e)
        return null
    }
}

