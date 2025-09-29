"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { ProductDTO } from "@/types/product"
import { StrapiImage } from "@/components/ui/strapi-image"
import {ImageFormat} from "@/types/strapi/common";
import {cn} from "@/lib/utils";

export type CarritoItem = ProductDTO & {
    quantity: number
}

export type CarritoProps = {
    items: CarritoItem[],
    className?: string,
}

// TODO: parametrizar accion de pago.
export default function CarritoPage({
                                        ...props
                                    } : CarritoProps) {
    const [carrito, setCarrito] = React.useState<CarritoItem[]>(props.items)

    const handleQuantityChange = (id: string, value: number) => {
        setCarrito((prev) =>
            prev.map((item) =>
                item.code === id ? { ...item, quantity: value } : item
            )
        )
    }

    const handleIncrement = (id: string) => {
        setCarrito((prev) =>
            prev.map((item) =>
                item.code === id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        )
    }

    const handleDecrement = (id: string) => {
        setCarrito((prev) =>
            prev.map((item) =>
                item.code === id
                    ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                    : item
            )
        )
    }

    const handleRemove = (id: string) => {
        setCarrito((prev) => prev.filter((item) => item.code !== id))
    }

    const subtotal = carrito.reduce((acc, p) => acc + p.price * p.quantity, 0)
    const envio = subtotal > 0 ? 4000 : 0
    const total = subtotal + envio

    return (
        <div className={cn("min-h-screen bg-background text-foreground px-4 py-6", props.className)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda */}
                <div className="col-span-2 space-y-6">
                    {/* Carrito */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Carrito de Compras</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {carrito.length === 0 && (
                                <p className="text-muted-foreground text-center mt-4">
                                    Tu carrito está vacío.
                                </p>
                            )}
                            {carrito.map((p) => (
                                <Card
                                    key={p.code}
                                    className="flex flex-col sm:flex-row gap-6 p-4"
                                >
                                    {/* Imagen */}
                                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                                        <StrapiImage
                                            src={p.keyImage}
                                            className="w-full h-full object-cover"
                                            format={ImageFormat.Small}
                                        />
                                    </div>

                                    {/* Info y cantidad */}
                                    <div className="flex flex-col justify-between flex-1">
                                        <div>
                                            <CardTitle>{p.name}</CardTitle>
                                            <p className="text-muted-foreground text-lg mt-1">
                                                ${p.price.toLocaleString("es-CL")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDecrement(p.code)}
                                            >
                                                -
                                            </Button>
                                            <Input
                                                type="number"
                                                value={p.quantity}
                                                min={1}
                                                onChange={(e) =>
                                                    handleQuantityChange(
                                                        p.code,
                                                        Math.max(1, parseInt(e.target.value, 10) || 1)
                                                    )
                                                }
                                                className="w-16 text-center"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleIncrement(p.code)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Precio total + eliminar */}
                                    <div className="flex flex-row sm:flex-col items-end justify-between">
                                        <p className="font-semibold text-lg">
                                            ${(p.price * p.quantity).toLocaleString("es-CL")}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemove(p.code)}
                                        >
                                            <Trash2 className="w-5 h-5 text-destructive" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Info extra */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información adicional</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Aquí puedes mostrar promociones, recomendaciones o políticas de
                                envío.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Columna derecha */}
                <div className="h-fit">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Resumen del pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toLocaleString("es-CL")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Envío</span>
                                <span>${envio.toLocaleString("es-CL")}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toLocaleString("es-CL")}</span>
                            </div>
                            <Button
                                className="w-full mt-4"
                                disabled={carrito.length === 0}
                            >
                                Proceder al pago
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
