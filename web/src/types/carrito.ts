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
    idUsuario: number;
    idProducto: string;
    cantidad: number;
    nombre: string;
    precio: number;
    imagenUrl?: string;
};

export type CarritoResponse = {
    idCarrito?: number;
    idUsuarioFk?: number;
    carritoDetalle?: CarritoDetalleResponse[];
};

export type CarritoItem = {
    idCarrito: number;
    idDetalle: number;
    code: string;
    name: string;
    price: number;
    quantity: number;
    keyImage: string;
    category?: string;
};

