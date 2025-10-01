import {ProductDTO} from "@/types/product";

export type CarritoPostBody = {
    code: string;
    cantidad: number;
};

export type CarritoResponse = {
    idCarrito?: number;
    idUsuarioFk?: number;
    carritoDetalle?: CarritoItem[];
};

export type CarritoItem = ProductDTO &  {
    idCarrito: number;
    idDetalle: number;
    quantity: number;
};

