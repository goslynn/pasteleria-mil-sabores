'use client'

import * as React from "react"
import Link from "next/link"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StrapiImage, StrapiImageSource } from "@/components/ui/strapi-image"
import { ImageFormat } from "@/types/strapi/common"
import { Discount } from "@/types/product"
import { AddToCartButton } from "@/components/add-to-cart"

export interface ProductCardProps {
    id: string | number
    name: string
    price: number
    category?: string
    imageSrc: StrapiImageSource
    discount?: Discount
    href: string
    className?: string
    aspect?: "4/3" | "1/1" | "16/9"
    onAddToCart?: () => void
}

export function ProductCard({
                                id,
                                name,
                                price,
                                category,
                                imageSrc,
                                discount,
                                href,
                                className,
                                aspect = "4/3",
                                onAddToCart,
                            }: ProductCardProps) {
    const finalPrice = discount
        ? discount.type === "percentage"
            ? Math.max(0, Math.round(price * (1 - discount.value / 100)))
            : Math.max(0, price - discount.value)
        : price

    const aspectClass =
        aspect === "1/1" ? "aspect-square"
            : aspect === "16/9" ? "aspect-video"
                : "aspect-[4/3]"

    // ⬇️ Normalizamos para AddToCartButton (code, name, price final)
    const productoForCart = React.useMemo(() => ({
        code: String(id),
        name,
        price: finalPrice,
    }), [id, name, finalPrice])

    return (
        <Card
            className={cn(
                "group flex h-full flex-col overflow-hidden rounded-xl bg-card text-card-foreground border border-border",
                "shadow-sm transition-transform duration-150 hover:scale-[1.015] hover:shadow-md",
                "cursor-pointer",
                className
            )}
        >
            {/* Clic a la ficha: imagen + texto */}
            <Link href={href} className="flex flex-col flex-1">
                <CardHeader className="p-4 pb-2">
                    <div className={cn("relative w-full overflow-hidden rounded-lg border border-border bg-card", aspectClass)}>
                        {discount?.type === "percentage" && (
                            <Badge variant="destructive" className="absolute left-2 top-2 z-10">
                                -{discount.value}%
                            </Badge>
                        )}
                        <StrapiImage
                            src={imageSrc}
                            alt={name}
                            fill
                            className="object-cover pointer-events-none"
                            sizes="(max-width: 768px) 100vw, 400px"
                            format={ImageFormat.Medium}
                            priority={false}
                        />
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 px-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="truncate text-base font-semibold leading-tight">{name}</h3>

                        {discount ? (
                            <div className="text-right leading-none">
                                <div className="text-xs text-muted-foreground line-through">{monetize(price)}</div>
                                <div className="text-lg font-bold text-primary">{monetize(finalPrice)}</div>
                            </div>
                        ) : (
                            <div className="text-right leading-none">
                                <div className="text-lg font-bold text-primary">{monetize(price)}</div>
                            </div>
                        )}
                    </div>

                    {category && (
                        <Badge variant="secondary" className="w-fit">
                            {category}
                        </Badge>
                    )}
                </CardContent>
            </Link>

            {/* Acciones */}
            <CardFooter className="flex items-center gap-3 px-4 pb-4 pt-0">
                <AddToCartButton
                    className="flex-1"
                    label="Agregar al carrito"
                    producto={productoForCart}
                    onAdded={() => onAddToCart?.()}
                />
            </CardFooter>
        </Card>
    )
}

function monetize(price: number): string {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(price)
}
