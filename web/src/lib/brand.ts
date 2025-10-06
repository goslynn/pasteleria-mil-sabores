import {BrandDTO} from "@/types/page-types";
import {strapi} from "@/lib/fetching";

export const brand = async (): Promise<BrandDTO | null> => {
    try {
        const resp = await strapi.get<{ data: BrandDTO | null }>("/api/brand?populate=*", {next:{revalidate: 300}});

        // resp.data puede venir null si Strapi no devuelve nada
        return resp?.data ?? null;
    } catch (e) {
        console.error("Error fetching brand:", e);
        return null;
    }
};
