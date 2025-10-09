"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { StrapiImage } from "@/components/ui/strapi-image";
import { ImageFormat } from "@/types/strapi/common";
import { cn } from "@/lib/utils";
import { CarritoItem } from "@/types/carrito";
import nextApi from "@/lib/fetching";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

async function updateCantidad(id: number, idDetalle: number, cantidad: number): Promise<void> {
    await nextApi.put(`/api/carrito/${id}/detalle/${idDetalle}`, { cantidad });
}

async function removeItem(id: number, idDetalle: number): Promise<void> {
    await nextApi.delete(`/api/carrito/${id}/detalle/${idDetalle}`);
}

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

type Props = { items: CarritoItem[]; className?: string };

export default function CarritoPage({ items, className }: Props) {
    const [carrito, setCarrito] = React.useState<CarritoItem[]>(items);
    const [busyIds, setBusyIds] = React.useState<Set<number>>(new Set());

    const setBusy = (idDetalle: number, v: boolean) => {
        setBusyIds(prev => {
            const next = new Set(prev);
            if (v) next.add(idDetalle);
            else next.delete(idDetalle);
            return next;
        });
    };

    const handleQuantityChange = async (idCarrito: number, idDetalle: number, value: number) => {
        if (value < 1) return handleRemove(idCarrito, idDetalle);

        const snapshot = [...carrito];
        setCarrito(curr => curr.map(i => (i.idDetalle === idDetalle ? { ...i, quantity: value } : i)));
        setBusy(idDetalle, true);

        try {
            await updateCantidad(idCarrito, idDetalle, value);
            window.dispatchEvent(new CustomEvent("cart:changed"));
        } catch (err) {
            console.error("[Carrito] Error actualizando cantidad:", err);
            setCarrito(snapshot);
            alert("No se pudo actualizar la cantidad.");
        } finally {
            setBusy(idDetalle, false);
        }
    };

    const handleRemove = async (idCarrito: number, idDetalle: number) => {
        const snapshot = [...carrito];
        setCarrito(curr => curr.filter(i => i.idDetalle !== idDetalle));
        setBusy(idDetalle, true);

        try {
            await removeItem(idCarrito, idDetalle);
            window.dispatchEvent(new CustomEvent("cart:changed"));
        } catch (err) {
            console.error("[Carrito] Error eliminando producto:", err);
            setCarrito(snapshot);
            alert("No se pudo eliminar el producto.");
        } finally {
            setBusy(idDetalle, false);
        }
    };

    const subtotal = carrito.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const envio = subtotal > 0 ? 4000 : 0;
    const total = subtotal + envio;

    return (
        <div className={cn("min-h-screen bg-background text-foreground px-4 py-6", className)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Carrito de Compras</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {carrito.length === 0 && (
                                <p className="text-muted-foreground text-center mt-4">Tu carrito está vacío.</p>
                            )}

                            {carrito.map(p => (
                                <Card key={p.idDetalle} className="flex flex-col sm:flex-row gap-6 p-4">
                                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                                        {p.keyImage ? (
                                            <StrapiImage
                                                src={p.keyImage}
                                                className="w-full h-full object-cover"
                                                format={ImageFormat.Small}
                                            />
                                        ) : (
                                            <span className="text-xs">Sin imagen</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-between flex-1">
                                        <div>
                                            <CardTitle>{p.name}</CardTitle>
                                            <p className="text-muted-foreground text-lg mt-1">{clp.format(p.price)}</p>
                                        </div>

                                        <div className="mt-4">
                                            <QuantityStepper
                                                value={p.quantity}
                                                onChange={(val) => handleQuantityChange(p.idCarrito, p.idDetalle, val)}
                                                min={1}
                                                max={99}
                                                size="sm"
                                                disabled={busyIds.has(p.idDetalle)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-end justify-between">
                                        <p className="font-semibold text-lg">{clp.format(p.price * p.quantity)}</p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemove(p.idCarrito, p.idDetalle)}
                                            disabled={busyIds.has(p.idDetalle)}
                                        >
                                            <Trash2 className="w-5 h-5 text-destructive" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Información adicional</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Promociones, recomendaciones o políticas de envío.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="h-fit">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Resumen del pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between"><span>Subtotal</span><span>{clp.format(subtotal)}</span></div>
                            <div className="flex justify-between"><span>Envío</span><span>{clp.format(envio)}</span></div>
                            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{clp.format(total)}</span></div>
                            <Button className="w-full mt-4" disabled={carrito.length === 0}>Proceder al pago</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}