import {ProductDTO} from "@/types/product";

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