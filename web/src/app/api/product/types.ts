import {ProductDTO} from "@/types/product";
import {StrapiCollection} from "@/types/strapi/common";

export interface ProductResponse {
    data?: {
        product: ProductDTO;
    };
}

export interface ProductDetailResponse extends ProductResponse {
    data?: ProductResponse["data"] & {
        related?: ProductDTO[];
    };
}

export interface ProductKey {
    code: string;
    documentId: string;
}

export type ProductQueryResponse = StrapiCollection<ProductDTO>

export class BasicHttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
