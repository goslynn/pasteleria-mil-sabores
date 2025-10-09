import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {CarritoItem, CarritoPostBody, CarritoResponse} from "@/types/carrito";
import {isPositiveNumber} from "@/lib/utils";
import {getSessionUserId} from "@/lib/auth";
import {BasicHttpError} from "@/types/server";
import {getProductByCode} from "@/app/services/product.service";

2

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    let body: CarritoPostBody;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }
    let idUsuario = await getSessionUserId();
    if (!idUsuario) idUsuario = 1;

    const {code, cantidad } = body ?? {};

    if (!idUsuario || !code || !isPositiveNumber(cantidad)) {
        return NextResponse.json(
            { error: "Faltan campos obligatorios o son inválidos" },
            { status: 400 }
        );
    }

    try {
        const product = await getProductByCode(code);

        if (!product?.code || !product.name || !product.price) {
            return NextResponse.json({ error: "Producto inválido" }, { status: 404 });
        }
        const carrito = await prisma.carritoCompras.upsert({
            where: { idUsuarioFk: idUsuario },
            create: { idUsuarioFk: idUsuario },
            update: {},
        });

        const existing = await prisma.carritoDetalle.findFirst({
            where: {
                idCarrito: carrito.idCarrito,
                idProducto: product.code,
            },
            select: { idCarritoDetalle: true, cantidad: true }
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
                    cantidad: cantidad,
                    nombreProducto: product.name,
                    precioUnitario: product.price,
                },
            });

        return NextResponse.json({ idCarrito: detalle.idCarrito }, { status: 201 });
    } catch (err) {
        console.error("Error en POST /carrito:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function GET(_req: NextRequest) {
    let idUsuario = await getSessionUserId();
    if (!idUsuario) idUsuario = 1;

    try {
        const carrito = await prisma.carritoCompras.findUnique({
            where: { idUsuarioFk: idUsuario },
            include: { carritoDetalle: true },
        });

        // Si no hay carrito aún, responde vacío con forma estable
        if (!carrito) {
            const empty: CarritoResponse = {
                idCarrito: 0,
                idUsuarioFk: idUsuario,
                carritoDetalle: [],
            };
            return NextResponse.json({data: empty}, { status: 200 });
        }

        // Enriquecer cada ítem consultando el endpoint de productos
        let items : CarritoItem[];
        try {
            items = await Promise.all(
                carrito.carritoDetalle.map(async (d) => {
                    try {
                        const p = await getProductByCode(d.idProducto);

                        // Chequeo básico del producto recibido
                        if (!p?.code || !p.name || typeof p.price !== "number") {
                            throw new BasicHttpError(404, "Producto inválido");
                            // return NextResponse.json({error: "Producto inválido"}, {status: 404});
                        }

                        const item: CarritoItem = {
                            ...p,
                            idCarrito: carrito.idCarrito,
                            idDetalle: d.idCarritoDetalle,
                            quantity: d.cantidad
                        };
                        return item;
                    } catch {
                        // Fallback a lo persistido en DB si el endpoint falla
                        const item: CarritoItem = {
                            idCarrito: d.idCarrito,
                            idDetalle: d.idCarritoDetalle,
                            code: d.idProducto,
                            name: d.nombreProducto ?? d.idProducto,
                            price: d.precioUnitario ?? 0,
                            keyImage: null,
                            quantity: d.cantidad
                        };
                        return item;
                    }
                })
            );
        } catch (err) {
            const httperr = err as BasicHttpError;
            return NextResponse.json(
                { error: `Error consultando productos del carrito: ${httperr.toString()}` },
                { status: httperr.status ?? 500 }
            );
        }


        const response: CarritoResponse = {
            idCarrito: carrito.idCarrito,
            idUsuarioFk: carrito.idUsuarioFk,
            carritoDetalle: items,
        };

        return NextResponse.json({data : response}, { status: 200 });
    } catch (err) {
        console.error("Error en GET /carrito:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
