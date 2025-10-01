import {ProductDTO} from "@/types/product";

export type CarritoDetalleResponse = {
    idCarritoDetalle: number;
    idCarrito: number;
    idProducto: string;
    cantidad: number;
    nombreProducto: string;
    precioUnitario: number;
    imagenUrl: string | null;
};

export type CarritoPostBody = {
    code: string;
    cantidad: number;
};

export type CarritoResponse = {
    idCarrito?: number;
    idUsuarioFk?: number;
    carritoDetalle?: CarritoDetalleResponse[];
};

export type CarritoItem = ProductDTO &  {
    idCarrito: number;
    idDetalle: number;
    quantity: number;
};

