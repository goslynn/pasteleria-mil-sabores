// src/app/services/cart.service.ts
import { prisma } from "@/lib/db";
import { isPositiveNumber } from "@/lib/utils";
import { getSessionUserId } from "@/lib/auth";
import { getProductByCode } from "@/app/services/product.service";

import type { CarritoItem, CarritoPostBody, CarritoResponse } from "@/types/carrito";

/** Estructura mínima de producto requerida por el carrito */
type MinimalProduct = {
    code: string;
    name: string;
    price: number;
    keyImage?: string | null;
};

/** Type guard: valida shape mínimo del producto */
function isValidProduct(p: unknown): p is MinimalProduct {
    if (!p || typeof p !== "object") return false;
    const obj = p as Record<string, unknown>;
    return (
        typeof obj.code === "string" &&
        typeof obj.name === "string" &&
        typeof obj.price === "number"
    );
}

/** Obtiene el producto y valida; si no cumple shape, retorna null (no lanza). */
async function fetchValidProductOrNull(code: string): Promise<MinimalProduct | null> {
    try {
        const prod = await getProductByCode(code);
        return isValidProduct(prod) ? prod : null;
    } catch {
        return null; // endpoint/servicio falló → que el caller decida fallback
    }
}

/** Obtiene el producto y valida; si no cumple, lanza Error (para flujos “duros”). */
async function fetchValidProductOrThrow(code: string): Promise<MinimalProduct> {
    const prod = await getProductByCode(code);
    if (!isValidProduct(prod)) {
        throw new Error("Producto inválido");
    }
    return prod;
}

/** Cart item desde producto válido (enriquecido) */
function toCartItemFromProduct(
    p: MinimalProduct,
    detalle: { idCarritoDetalle: number; cantidad: number },
    idCarrito: number
): CarritoItem {
    return {
        ...p,
        idCarrito,
        idDetalle: detalle.idCarritoDetalle,
        quantity: detalle.cantidad,
    };
}

/** Cart item desde lo persistido (fallback) */
function toCartItemFromPersisted(d: {
    idCarrito: number;
    idCarritoDetalle: number;
    idProducto: string;
    nombreProducto: string | null;
    precioUnitario: number | null;
    cantidad: number;
}): CarritoItem {
    return {
        idCarrito: d.idCarrito,
        idDetalle: d.idCarritoDetalle,
        code: d.idProducto,
        name: d.nombreProducto ?? d.idProducto,
        price: d.precioUnitario ?? 0,
        keyImage: null,
        quantity: d.cantidad,
    };
}


async function getEffectiveUserId(explicitUserId?: number | null): Promise<number> {
    let idUsuario = explicitUserId ?? (await getSessionUserId());
    if (!idUsuario) idUsuario = 1;
    return idUsuario;
}



export async function addItemToCart(
    body: CarritoPostBody,
    opts?: { userId?: number }
): Promise<{ idCarrito: number }> {
    const { code, cantidad } = body ?? ({} as CarritoPostBody);
    const idUsuario = await getEffectiveUserId(opts?.userId ?? null);

    if (!idUsuario || !code || !isPositiveNumber(cantidad)) {
        throw new Error("Faltan campos obligatorios o son inválidos");
    }

    try {
        // flujo “duro”: si el producto es inválido, se lanza (mismo comportamiento original)
        const product = await fetchValidProductOrThrow(code);

        const carrito = await prisma.carritoCompras.upsert({
            where: { idUsuarioFk: idUsuario },
            create: { idUsuarioFk: idUsuario },
            update: {},
        });

        const existing = await prisma.carritoDetalle.findFirst({
            where: { idCarrito: carrito.idCarrito, idProducto: product.code },
            select: { idCarritoDetalle: true, cantidad: true },
        });

        const detalle = existing
            ? await prisma.carritoDetalle.update({
                where: { idCarritoDetalle: existing.idCarritoDetalle },
                data: { cantidad: existing.cantidad + cantidad },
            })
            : await prisma.carritoDetalle.create({
                data: {
                    idCarrito: carrito.idCarrito,
                    idProducto: product.code,
                    cantidad,
                    nombreProducto: product.name,
                    precioUnitario: product.price,
                },
            });

        return { idCarrito: detalle.idCarrito };
    } catch (err) {
        console.error("Error en addItemToCart:", err);
        throw new Error("Error interno del servidor");
    }
}

export async function getCart(opts?: { userId?: number }): Promise<CarritoResponse> {
    const idUsuario = await getEffectiveUserId(opts?.userId ?? null);

    try {
        const carrito = await prisma.carritoCompras.findUnique({
            where: { idUsuarioFk: idUsuario },
            include: { carritoDetalle: true },
        });

        if (!carrito) {
            return { idCarrito: 0, idUsuarioFk: idUsuario, carritoDetalle: [] };
        }

        const items: CarritoItem[] = await Promise.all(
            carrito.carritoDetalle.map(async (d) => {
                // NO usamos throw+catch local → evitamos el warning.
                const p = await fetchValidProductOrNull(d.idProducto);
                return p
                    ? toCartItemFromProduct(p, { idCarritoDetalle: d.idCarritoDetalle, cantidad: d.cantidad }, carrito.idCarrito)
                    : toCartItemFromPersisted({
                        idCarrito: d.idCarrito,
                        idCarritoDetalle: d.idCarritoDetalle,
                        idProducto: d.idProducto,
                        nombreProducto: d.nombreProducto,
                        precioUnitario: d.precioUnitario,
                        cantidad: d.cantidad,
                    });
            })
        );

        return {
            idCarrito: carrito.idCarrito,
            idUsuarioFk: carrito.idUsuarioFk,
            carritoDetalle: items,
        };
    } catch (err) {
        console.error("Error en getCart:", err);
        throw new Error("Error interno del servidor");
    }
}
