import {UsuarioDTO} from "@/types/user";

import {Discount, Money, ProductData} from "@/types/product";
import {apiFetch, cmsFetch} from "@/lib/fetching";

// Devuelve el usuario de la sesión actual o null si no hay sesión
export async function getCurrentUser(): Promise<UsuarioDTO | null> {
    const { userId } = await apiFetch<{ userId?: number }>("/api/session", {
        cache: "no-store",
        next: { revalidate: 0 },
    });
    console.log("Fetched session id, userId:", userId);
    if (!userId) return null;
    return fetchUserById(userId);
}

// Devuelve un usuario por id (lanza si el endpoint falla)
export async function fetchUserById(id: number): Promise<UsuarioDTO> {
    const { data } = await apiFetch<{ data: UsuarioDTO }>(`/api/user/${id}`);
    return data;
}


export async function fetchProducts(): Promise<ProductData[]> {
    type StrapiImg = { data: { attributes: { url: string; alternativeText?: string | null } } | null };
    type StrapiEntity<T> = { id: number; attributes: T };
    type Producto = {
        nombre?: string;
        name?: string;
        descripcion?: string | null;
        description?: string | null;
        slug?: string;
        precio?: number | string;
        price?: number | string;
        moneda?: string | null;
        currency?: string | null;
        cover?: StrapiImg;
        imagen?: StrapiImg;
        categoria?: { data: StrapiEntity<{ nombre?: string; name?: string }> } | null;
        category?: { data: StrapiEntity<{ nombre?: string; name?: string }> } | null;
        // Campos opcionales de descuento si existen en tu Strapi:
        descuento_porcentaje?: number;
        discount_percentage?: number;
        descuento_monto?: number;
        discount_amount?: number;
    };

    // Utilidad: Strapi suele entregar URLs relativas para media.
    const base = process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/+$/, "") ?? "";
    const abs = (u?: string | null) => (!u ? "" : u.startsWith("http") ? u : `${base}${u}`);

    const res = await cmsFetch<{ data: Array<StrapiEntity<Producto>> }>("/products", {
            query: {
                // Campos del producto
                "fields[0]": "code",
                "fields[1]": "name",
                "fields[2]": "price",
                "fields[3]": "description",

                // IMÁGENES: solo url (original) + formats
                "populate[images][fields][0]": "url",
                "populate[images][fields][1]": "formats",

                "pagination[pageSize]": 100,
                publicationState: "live",
            },
        });


    const toMoney = (p?: number | string | null, currency?: string | null): Money => ({
        amount: typeof p === "string" ? Number(p) : Number(p ?? 0),
        currency: currency ?? "CLP",
        locale: "es-CL",
        priceInCents: false, // CLP no usa centavos; cambia a true si guardas centavos
    });

    const toDiscount = (a: Producto): Discount | undefined => {
        const pct = a.descuento_porcentaje ?? a.discount_percentage;
        const amt = a.descuento_monto ?? a.discount_amount;
        if (typeof pct === "number" && pct > 0) return { type: "percentage", value: pct };
        if (typeof amt === "number" && amt > 0) return { type: "amount", value: amt };
        return undefined;
    };

    return res.data.map(({ id, attributes: a }): ProductData => {
        const name = a.nombre ?? a.name ?? `Producto ${id}`;
        const description = a.descripcion ?? a.description ?? "";
        const category =
            a.categoria?.data?.attributes?.nombre ??
            a.category?.data?.attributes?.name ??
            "Sin categoría";
        const imageUrl =
            abs(a.cover?.data?.attributes?.url) ||
            abs(a.imagen?.data?.attributes?.url) ||
            "";

        const price = toMoney(a.precio ?? a.price, a.moneda ?? a.currency);
        const discount = toDiscount(a);

        return { id, name, description, category, imageUrl, price, discount };
    });
}