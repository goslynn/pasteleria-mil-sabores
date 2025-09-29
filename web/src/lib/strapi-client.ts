import {Client, QueryValue} from "@/lib/fetching";
import {StrapiCollection, StrapiObject} from "@/types/strapi/common";

export class StrapiMapper {

    strapi: Client;

    constructor(strapi : Client) {
        this.strapi = strapi;
    }

    async fetchObject<DTO>(
        endpoint: string,
        q: Record<string, QueryValue>
    ): Promise<DTO | null>;
    async fetchObject<DTO, OUT>(
        endpoint: string,
        q: Record<string, QueryValue>,
        mapper: (dto: DTO) => OUT
    ): Promise<OUT | null>;
    async fetchObject<DTO, OUT>(
        endpoint: string,
        q: Record<string, QueryValue>,
        mapper?: (dto: DTO) => OUT
    ): Promise<DTO | OUT | null> {
        try {
            const resp = await this.strapi.get<StrapiObject<DTO>>(endpoint, { query: q });
            if (!resp?.data) return null;
            return mapper ? mapper(resp.data) : resp.data;
        } catch (e) {
            console.error(`error fetching ${endpoint}:`, e);
            return null;
        }
    }


    async fetchCollection<DTO>(
        endpoint: string,
        q: Record<string, QueryValue>
    ): Promise<DTO[]>;
    async fetchCollection<DTO, OUT>(
        endpoint: string,
        q: Record<string, QueryValue>,
        mapper: (e: DTO) => OUT
    ): Promise<OUT[]>;
    async fetchCollection<DTO, OUT>(
        endpoint: string,
        q: Record<string, QueryValue>,
        mapper?: (e: DTO) => OUT
    ): Promise<(DTO | OUT)[]> {
        try {
            const resp = await this.strapi.get<StrapiCollection<DTO>>(endpoint, { query: q });
            return mapper ? resp.data.map(mapper) : resp.data;
        } catch (e) {
            console.error(`error fetching ${endpoint}:`, e);
            return [];
        }
    }
}

