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
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

export interface ProductDetailProps {
    product: {
        id: number;
        documentId: string;
        code: string;
        name: string;
        description: BlocksContent | string | null;
        price: number;
        images: any; // puede venir null o arreglo de imágenes de Strapi
        category: {
            id: number;
            documentId: string;
            name: string;
            slug: string;
            description: string | null;
        } | null;
        keyImage?: StrapiImageSource;
    };
    className?: string;
    debug?: boolean; // <- muestra la sección inferior con metadatos y código
    onAddToCart?: (p: { id: number; code: string; name: string; price: number }) => void;
    onShopNow?: (p: { id: number; code: string; name: string; price: number }) => void;
}

const clp = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
});

export default function ProductDetail({
                                          product,
                                          className,
                                          debug = false,
                                          onAddToCart,
                                          onShopNow,
                                      }: ProductDetailProps) {
    // --- Galería (slider) ---
    const gallery: StrapiImageSource[] = React.useMemo(() => {
        const list: StrapiImageSource[] = [];
        if (product.keyImage) list.push(product.keyImage);
        // Si product.images viene de Strapi como media[] ó null
        const imgs = (product as any)?.images;
        if (Array.isArray(imgs)) {
            for (const it of imgs) list.push(it);
        }
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
            id: product.id,
            code: product.code,
            name: product.name,
            price: product.price,
        });
    }
    function handleShop() {
        onShopNow?.({
            id: product.id,
            code: product.code,
            name: product.name,
            price: product.price,
        });
    }

    return (
        <article className={cn('mx-auto max-w-6xl ', className)}>
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
                                    <Link href={`/categoria/${product.category.slug}`}>
                                        {product.category.name}
                                    </Link>
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

                                {/* Controles */}
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

                                        {/* Dots */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                                            {gallery.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setIdx(i)}
                                                    aria-label={`Ir a la imagen ${i + 1}`}
                                                    className={cn(
                                                        'h-2 w-2 rounded-full border',
                                                        i === idx ? 'bg-foreground' : 'bg-background/70'
                                                    )}
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
                    {/* NOTA: el código se movió abajo (solo visible con debug) */}
                </section>

                {/* Info */}
                <section className="flex min-h-full flex-col gap-4">
                    <header>
                        <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
                        {product.category ? (
                            <i className="mt-1 text-sm text-muted-foreground">{product.category.name}</i>
                        ) : null}
                    </header>

                    <div className="text-3xl font-bold">{clp.format(product.price)}</div>

                    {/* Descripción (Blocks o string) */}
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        {Array.isArray(product.description) ? (
                            <StrapiBlocks content={product.description} />
                        ) : product.description ? (
                            <p>{product.description}</p>
                        ) : (
                            <p className="text-muted-foreground">Sin descripción.</p>
                        )}
                    </div>

                    {/* Acciones al fondo de la columna derecha */}
                    <div className="mt-auto pt-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Poco llamativo */}
                            <button
                                type="button"
                                onClick={handleAdd}
                                className={cn(
                                    'inline-flex h-12 items-center justify-center rounded-lg border px-5',
                                    'bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
                                    'transition'
                                )}
                                aria-label="Agregar al carrito"
                                title="Agregar al carrito"
                            >
                                Agregar al carrito
                            </button>

                            {/* Llamativo */}
                            <button
                                type="button"
                                onClick={handleShop}
                                className={cn(
                                    'inline-flex h-12 items-center justify-center rounded-lg px-5',
                                    'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]',
                                    'transition'
                                )}
                                aria-label="Comprar ahora"
                                title="Comprar ahora"
                            >
                                Comprar ahora
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Meta (oculta salvo debug=true) */}
            {debug && (
                <section className="mt-10 border-t pt-6 text-xs text-muted-foreground" aria-labelledby="product-meta">
                    <h2 id="product-meta" className="sr-only">Metadatos del producto</h2>
                    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                        <div>
                            <dt className="font-medium">Código</dt>
                            <dd className="truncate">{product.code}</dd>
                        </div>
                        <div>
                            <dt className="font-medium">ID</dt>
                            <dd className="truncate">{product.documentId}</dd>
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
