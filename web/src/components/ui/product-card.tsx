'use client'

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Plus, Heart } from "lucide-react"
import {StrapiImage, StrapiImageSource} from "@/components/ui/strapi-image";
import {ImageFormat} from "@/types/strapi/common";

export interface Discount {
    type: "percentage" | "fixed"
    value: number
}

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
    onToggleFavorite?: () => void
    onAddToCart?: () => void
}

export function ProductCard({
                                name,
                                price,
                                category,
                                imageSrc,
                                discount,
                                href,
                                className,
                                aspect = "4/3",
                                onToggleFavorite,
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

    return (
        <Card
            className={cn(
                // asegura tokens del tema
                "group flex h-full flex-col overflow-hidden rounded-xl bg-card text-card-foreground border border-border",
                "shadow-sm transition-transform duration-150 hover:scale-[1.015] hover:shadow-md",
                "cursor-pointer",
                className
            )}
        >
            {/* Clic a la ficha: imagen + texto */}
            <Link href={href} className="flex flex-col flex-1">
                <CardHeader className="p-4 pb-2">
                    {/* Marco con ratio fijo y ring del tema */}
                    <div
                        className={cn(
                            "relative w-full overflow-hidden rounded-lg border border-border bg-card",
                            aspectClass
                        )}
                    >
                        {/* etiqueta de descuento si es porcentaje */}
                        {discount?.type === "percentage" && (
                            <Badge variant="destructive" className="absolute left-2 top-2 z-10">
                                -{discount.value}%
                            </Badge>
                        )}

                        {/* Imagen contenida (no se deforma) */}
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
                    {/* Título 1 línea + precio a la derecha */}
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

                    {/* Categoría */}
                    {category && (
                        <Badge variant="secondary" className="w-fit">
                            {category}
                        </Badge>
                    )}
                </CardContent>
            </Link>

            {/* Acciones (no navegan) */}
            <CardFooter className="flex items-center gap-3 px-4 pb-4 pt-0">
                {onToggleFavorite && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                            e.preventDefault()
                            onToggleFavorite?.()
                        }}
                        aria-label="Agregar a favoritos"
                    >
                        <Heart className="size-4" />
                    </Button>
                )}

                <Button
                    type="button"
                    className="flex-1"
                    onClick={(e) => {
                        e.preventDefault()
                        onAddToCart?.()
                    }}
                >
                    <Plus className="mr-2 size-4" />
                    Agregar al carrito
                </Button>
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
