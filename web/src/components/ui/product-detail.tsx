'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import StrapiImage, { StrapiImageSource } from '@/components/ui/strapi-image';
import StrapiBlocks from '@/components/ui/strapi-blocks.client';
import { BlocksContent } from '@strapi/blocks-react-renderer';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Discount } from '@/types/product';
import { Button } from '@/components/ui/button';

export interface ProductDetail {
    code: string;
    name: string;
    description: BlocksContent | string | null | undefined;
    price: number;
    images?: StrapiImageSource[];
    discount?: Discount;
    category: {
        name: string;
        slug: string;
    } | null;
    keyImage?: StrapiImageSource;
}

export interface ProductDetailProps {
    product: ProductDetail;
    className?: string;
    debug?: boolean;
    onAddToCart?: (p: { code: string; name: string; price: number }) => void;
    onShopNow?: (p: { code: string; name: string; price: number }) => void;
}

const clp = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
});

export default function ProductDetailCard({
                                              product,
                                              className,
                                              debug,
                                              onAddToCart,
                                              onShopNow,
                                          }: ProductDetailProps) {
    // --- Galería (slider) ---
    const gallery: StrapiImageSource[] = React.useMemo(() => {
        const list: StrapiImageSource[] = [];
        if (product.keyImage) list.push(product.keyImage);
        if (Array.isArray(product.images)) list.push(...product.images);
        return list;
    }, [product]);

    const [idx, setIdx] = React.useState(0);
    const hasGallery = gallery.length > 0;

    function prev() {
        setIdx((p) => (p === 0 ? Math.max(gallery.length - 1, 0) : p - 1));
    }
    function next() {
        setIdx((p) => (p === gallery.length - 1 ? 0 : p + 1));
    }

    function handleAdd() {
        onAddToCart?.({
            code: product.code,
            name: product.name,
            price: product.price,
        });
    }
    function handleShop() {
        onShopNow?.({
            code: product.code,
            name: product.name,
            price: product.price,
        });
    }

    // --- Precio con descuento ---
    const discountedPrice = React.useMemo(() => {
        const d = product.discount;
        if (!d) return null;
        if (d.type === 'percentage') return Math.max(0, Math.round(product.price * (1 - d.value / 100)));
        return Math.max(0, Math.round(product.price - d.value));
    }, [product.price, product.discount]);

    const discountBadge = React.useMemo(() => {
        if (!product.discount) return null;
        return product.discount.type === 'percentage'
            ? `-${product.discount.value}%`
            : `-${clp.format(product.discount.value)}`;
    }, [product.discount]);

    return (
        <article className={cn('mx-auto max-w-6xl', className)}>
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Inicio</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    {product.category ? (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={`/categoria/${product.category.slug}`}>{product.category.name}</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </>
                    ) : null}

                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{product.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Layout principal */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Galería / Slider */}
                <section>
                    <div className="relative aspect-square overflow-hidden rounded-xl border bg-background">
                        {hasGallery ? (
                            <>
                                <StrapiImage
                                    key={idx}
                                    src={gallery[idx]}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    title={product.name}
                                    alt={product.name}
                                />

                                {gallery.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={prev}
                                            aria-label="Imagen anterior"
                                            className={cn(
                                                'absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 px-3 py-2',
                                                'backdrop-blur hover:bg-background'
                                            )}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            onClick={next}
                                            aria-label="Imagen siguiente"
                                            className={cn(
                                                'absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 px-3 py-2',
                                                'backdrop-blur hover:bg-background'
                                            )}
                                        >
                                            ›
                                        </button>

                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                                            {gallery.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setIdx(i)}
                                                    aria-label={`Ir a la imagen ${i + 1}`}
                                                    className={cn('h-2 w-2 rounded-full border', i === idx ? 'bg-foreground' : 'bg-background/70')}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="grid h-full place-content-center text-muted-foreground">Sin imagen</div>
                        )}
                    </div>
                </section>

                {/* Info */}
                <section className="flex min-h-full flex-col gap-4">
                    <header>
                        <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
                        {product.category ? <i className="mt-1 text-sm text-muted-foreground">{product.category.name}</i> : null}
                    </header>

                    {/* Precio (con o sin descuento) */}
                    {discountedPrice !== null && discountedPrice < product.price ? (
                        <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold line-through text-muted-foreground/70">
                {clp.format(product.price)}
              </span>
                            <span className="text-4xl font-extrabold">{clp.format(discountedPrice)}</span>
                            {discountBadge && <span className="rounded-full border px-2 py-0.5 text-xs font-medium">{discountBadge}</span>}
                        </div>
                    ) : (
                        <div className="text-3xl font-bold">{clp.format(product.price)}</div>
                    )}

                    {/* Descripción */}
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        <StrapiBlocks content={product.description} />
                    </div>

                    {/* Acciones */}
                    <div className="mt-auto pt-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-12"
                                onClick={handleAdd}
                                aria-label="Agregar al carrito"
                                title="Agregar al carrito"
                                type="button"
                            >
                                Agregar al carrito
                            </Button>

                            <Button
                                variant="default"
                                size="lg"
                                className="h-12 active:scale-[0.98]"
                                onClick={handleShop}
                                aria-label="Comprar ahora"
                                title="Comprar ahora"
                                type="button"
                            >
                                Comprar ahora
                            </Button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Meta (solo con debug=true) */}
            {debug && (
                <section className="mt-10 border-t pt-6 text-xs text-muted-foreground" aria-labelledby="product-meta">
                    <h2 id="product-meta" className="sr-only">
                        Metadatos del producto
                    </h2>
                    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                        <div>
                            <dt className="font-medium">Código</dt>
                            <dd className="truncate">{product.code}</dd>
                        </div>
                        <div>
                            <dt className="font-medium">Creado</dt>
                            <dd>{new Date().toLocaleDateString('es-CL')}</dd>
                        </div>
                        <div>
                            <dt className="font-medium">Precio</dt>
                            <dd>{clp.format(product.price)}</dd>
                        </div>
                    </dl>
                </section>
            )}
        </article>
    );
}
