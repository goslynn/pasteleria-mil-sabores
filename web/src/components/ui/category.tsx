import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import StrapiImage, { type StrapiImageSource } from "@/components/ui/strapi-image";
import { ImageFormat } from "@/types/strapi/common";
import {ChevronRight} from "lucide-react";

export type CategoryRowCardProps = {
    title: string;
    href: string;
    image?: StrapiImageSource;
    description?: string | null;
    className?: string;
};

export type CategorySquareTileProps = {
    title: string;
    href: string;
    image?: StrapiImageSource;
    className?: string;
};

export type CategoryItem = {
    title: string;
    href: string;
    image?: CategoryRowCardProps["image"];
    description?: CategoryRowCardProps["description"];
};

export function CategoryRowCard({
                                    title,
                                    href,
                                    image,
                                    description,
                                    className,
                                }: CategoryRowCardProps) {
    return (
        <Link
            href={href}
            aria-label={`Ver productos de ${title}`}
            title={`Ver productos de ${title}`}
            className={cn(
                // contenedor clickeable
                "group relative isolate block w-full rounded-2xl border bg-card/50 p-3 md:p-4",
                "flex items-center gap-4 md:gap-6 transition-shadow hover:shadow-lg cursor-pointer",
                // accesibilidad en foco
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                className
            )}
        >
            {/* Imagen izquierda */}
            <div className="relative shrink-0 w-36 h-36 md:w-48 md:h-36 overflow-hidden rounded-xl">
                <StrapiImage
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(min-width:768px) 192px, 144px"
                    format={ImageFormat.Medium}
                />
            </div>

            {/* Texto centro */}
            <div className="min-w-0 flex-1">
                <header className="mb-2">
                    <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                </header>

                {!!description && (
                    <p className="hidden md:block text-muted-foreground text-sm md:text-base leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            {/* CTA derecha: ícono que crece con hover de toda la tarjeta */}
            <span
                aria-hidden="true"
                className={cn(
                    "shrink-0 grid place-items-center rounded-full",
                    "transition-transform duration-200 group-hover:scale-125"
                )}
            >
        {/* Usa el color de acento (definido en globals.css / Tailwind theme) */}
                <ChevronRight className="size-8 md:size-12 " />
      </span>
        </Link>
    );
}


export function CategorySquareTile({ title, href, image, className }: CategorySquareTileProps) {
    return (
        <Link
            href={href}
            className={cn("relative aspect-square overflow-hidden rounded-2xl group block", className)}
            aria-label={title}
            title={title}
        >
            <StrapiImage src={image} alt={title} fill className="object-cover" sizes="50vw" />
            <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                <span className="text-white text-lg font-semibold drop-shadow">{title}</span>
            </div>
        </Link>
    );
}

export default function CategorySection({ items, className }: { items: CategoryItem[]; className?: string }) {
    return (
        <>
            {/* Mobile: tiles 2 por fila */}
            <div className={cn("md:hidden grid grid-cols-2 gap-3", className)}>
                {items.map((it) => (
                    <CategorySquareTile key={it.href} title={it.title} href={it.href} image={it.image} />
                ))}
            </div>

            {/* Desktop: listado 1 columna con rich text */}
            <div className={cn("hidden md:flex md:flex-col gap-4", className)}>
                {items.map((it) => (
                    <CategoryRowCard
                        key={it.href}
                        title={it.title}
                        href={it.href}
                        image={it.image}
                        description={it.description}
                    />
                ))}
            </div>
        </>
    );
}
