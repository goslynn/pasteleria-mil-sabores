export type Money = {
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

export interface ProductData {
    id: number;
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    price: Money; // base price
    discount?: Discount; // optional discount
}