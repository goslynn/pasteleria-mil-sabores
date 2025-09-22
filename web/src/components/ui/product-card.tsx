import * as React from 'react'
import { Plus } from 'lucide-react'
import {ProductData} from "@/types/product";

function toNumber(p: ProductData['price']) {
    return p.priceInCents ? Math.round(p.amount) / 100 : p.amount
}

function applyDiscount(base: number, d?: ProductData['discount']) {
    if (!d) return base
    return d.type === 'percentage' ? Math.max(0, base * (1 - d.value / 100)) : Math.max(0, base - d.value)
}

function fmt(p: ProductData['price'], x?: number) {
    const n = x ?? toNumber(p)
    const currency = p.currency ?? 'USD'
    const locale = p.locale ?? (currency === 'CLP' ? 'es-CL' : 'en-US')
    return new Intl.NumberFormat(locale, {
        style: 'currency', currency,
        minimumFractionDigits: currency === 'CLP' ? 0 : 2,
        maximumFractionDigits: currency === 'CLP' ? 0 : 2,
    }).format(n)
}

export function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
}

//TODO : No usar ProductData, usar props interno.
export function ProductCard({ product, className }: { product: ProductData; className?: string }) {
    const base = toNumber(product.price)
    const finalPrice = applyDiscount(base, product.discount)
    const hasDiscount = finalPrice !== base


    return (
        <div className={cx('group relative w-80 rounded-2xl border bg-card p-4 text-card-foreground shadow-sm ring-1 ring-border', className)}>
            {/* Imagen */}
            <div className="mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                />
            </div>


            {/* Título + Precio */}
            <div className="mb-1 flex items-start gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-medium leading-tight">{product.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right">
                    {hasDiscount ? (
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-muted-foreground line-through">{fmt(product.price, base)}</span>
                            <span className="-mt-0.5 text-lg font-semibold">{fmt(product.price, finalPrice)}</span>
                        </div>
                    ) : (
                        <span className="text-lg font-semibold">{fmt(product.price, base)}</span>
                    )}
                </div>
            </div>


            {/* Acciones */}
            <div className="mt-4">
                {/*<form className="flex-1" action={addToCart}>*/}
                <form className="flex-1">
                    <input type="hidden" name="id" value={String(product.id)} />
                    <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-medium ring-1 ring-border transition hover:brightness-95 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Añadir al carrito</span>
                    </button>
                </form>
            </div>


            {/* Badge de descuento */}
            {hasDiscount && (
                <div className="absolute left-4 top-4 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow">
                    {product.discount?.type === 'percentage'
                        ? `-${product.discount?.value}%`
                        : `-${fmt(product.price, product.discount?.value ?? 0)}`}
                </div>
            )}
        </div>
    )
}
