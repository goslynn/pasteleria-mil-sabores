import {RichTextNode, StrapiBase, MediaImage} from "@/types/strapi/common";

export type Price = {
    amount: number; // base price in minor units or decimal (see `priceInCents`)
    currency?: string; // ISO 4217 e.g. "USD", "CLP"
    locale?: string; // e.g. "en-US", "es-CL"
    /**
     * If true, treat `amount` as cents. If false (default), treat as a decimal.
     * Useful for CLP where there are no cents – set `priceInCents` to false.
     */
    priceInCents?: boolean;
};

export type Discount =
    | { type: "percentage"; value: number }
    | { type: "amount"; value: number };

export interface ProductDTO extends StrapiBase {
    code: string;
    name: string;
    description?: RichTextNode[];
    price?: number;
    images?: MediaImage[];
    category?: CategoryDTO;
}

export interface CategoryDTO extends StrapiBase {
    name?: string;
    slug?: string;
    description?: RichTextNode[];
}

export type ProductCardDTO = Pick<
    ProductDTO,
    'documentId' | 'code' | 'name' | 'price' | 'images' | 'category'
>;