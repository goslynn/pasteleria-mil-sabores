import * as React from "react";
import { cn } from "@/lib/utils";
import { ArticleSection } from "@/types/page-types";
import StrapiImage from "@/components/ui/strapi-image";
import type { StrapiMedia } from "@/types/strapi/common";
import StrapiBlocks from "@/components/ui/strapi-blocks.client";

export type ArticleSectionVariant = "centered" | "imageLeft" | "imageRight";

export type ImageBehavior =
    | {
    fit: "fixed";
    width: number;
    height: number;
    priority?: boolean;
    wrapText?: boolean;
}
    | {
    fit: "responsive";
    priority?: boolean;
    wrapText?: boolean;
}
    | {
    fit: "intrinsic";
    priority?: boolean;
    wrapText?: boolean;
};

export interface ArticleImage {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
}

export interface ArticleRendererProps {
    /** nivel de titulo (h1, h2...) */
    headingLevel: 1 | 2 | 3 | 4 | 5 | 6;

    /** Imagen “externa” si quieres forzar en variant centered */
    centeredFallbackImage?: ArticleImage;

    /** Opcionales */
    className?: string;
    id?: string;

    /** Comportamiento de la imagen */
    imageBehavior?: ImageBehavior;

    /** JSON-LD para SEO */
    enableJsonLd?: boolean;
    descriptionForSeo?: string;
    publishedTimeISO?: string;
    modifiedTimeISO?: string;
}

type StrapiImageInput = StrapiMedia | string;

export function ArticleRenderer({
                                    content,
                                    headingLevel = 2,
                                    centeredFallbackImage,
                                    className,
                                    id,
                                    imageBehavior = { fit: "responsive", wrapText: false },
                                    enableJsonLd = true,
                                    descriptionForSeo,
                                    publishedTimeISO,
                                    modifiedTimeISO,
                                }: { content?: ArticleSection | null } & ArticleRendererProps) {
    if (!content) {
        return <p>No hay nada aquí :/</p>;
    }

    const { title, paragraph, variant, image } = content;

    const imgToUse: StrapiImageInput | ArticleImage | undefined =
        variant === "centered" ? centeredFallbackImage ?? image : image;

    const figure =
        imgToUse &&
        renderFigure(imgToUse, imageBehavior, variant, /* defaultAlt */ title);

    const withSideImage =
        (variant === "imageLeft" || variant === "imageRight") &&
        !!imgToUse &&
        !imageBehavior.wrapText;

    const jsonLd = enableJsonLd
        ? {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: descriptionForSeo,
            image:
                typeof imgToUse === "object" && "url" in imgToUse
                    ? imgToUse.url
                    : undefined,
            datePublished: publishedTimeISO,
            dateModified: modifiedTimeISO ?? publishedTimeISO,
        }
        : null;

    return (
        <section
            id={id}
            className={cn("mx-auto w-full max-w-5xl px-4 md:px-6", className)}
            itemScope
            itemType="https://schema.org/Article"
        >
            <header className={cn(variant === "centered" ? "text-center" : "text-left")}>
                {solveHeader(headingLevel, title)}
            </header>

            {variant === "centered" && imgToUse && !imageBehavior.wrapText && (
                <div className="mt-6 flex justify-center">{figure}</div>
            )}

            {withSideImage ? (
                <div
                    className={cn(
                        "mt-6 grid gap-6 md:gap-8",
                        variant === "imageRight"
                            ? "md:grid-cols-[1fr_minmax(280px,420px)]"
                            : "md:grid-cols-[minmax(280px,420px)_1fr]"
                    )}
                >
                    {variant === "imageLeft" && figure}
                    <StrapiBlocks content={paragraph} />
                    {variant === "imageRight" && figure}
                </div>
            ) : (
                <div className="mt-6">
                    {imgToUse && imageBehavior.wrapText && (
                        <div
                            className={cn(
                                "mb-4 md:mb-2",
                                variant === "imageRight"
                                    ? "md:float-right md:ml-6 md:mb-2"
                                    : "md:float-left md:mr-6 md:mb-2"
                            )}
                        >
                            {figure}
                        </div>
                    )}

                    <StrapiBlocks content={paragraph} />

                    {imgToUse && imageBehavior.wrapText && <div className="clear-both" />}
                </div>
            )}

            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
        </section>
    );
}

function solveHeader(level: number, children: React.ReactNode) {
    switch (level) {
        case 1:
            return (
                <h1
                    itemProp="headline"
                    className="scroll-m-20 text-3xl md:text-4xl font-bold tracking-tight"
                >
                    {children}
                </h1>
            );
        case 2:
            return (
                <h2
                    itemProp="headline"
                    className="scroll-m-20 text-2xl md:text-3xl font-bold tracking-tight"
                >
                    {children}
                </h2>
            );
        case 3:
            return (
                <h3
                    itemProp="headline"
                    className="scroll-m-20 text-xl md:text-2xl font-bold tracking-tight"
                >
                    {children}
                </h3>
            );
        case 4:
            return (
                <h4
                    itemProp="headline"
                    className="scroll-m-20 text-lg md:text-xl font-bold tracking-tight"
                >
                    {children}
                </h4>
            );
        case 5:
            return (
                <h5
                    itemProp="headline"
                    className="scroll-m-20 text-base md:text-lg font-bold tracking-tight"
                >
                    {children}
                </h5>
            );
        case 6:
            return (
                <h6
                    itemProp="headline"
                    className="scroll-m-20 text-sm md:text-base font-bold tracking-tight"
                >
                    {children}
                </h6>
            );
        default:
            return (
                <h2
                    itemProp="headline"
                    className="scroll-m-20 text-2xl md:text-3xl font-bold tracking-tight"
                >
                    {children}
                </h2>
            );
    }
}

function renderFigure(
    img: StrapiImageInput | ArticleImage,
    behavior: ImageBehavior,
    variant: ArticleSectionVariant,
    defaultAlt: string
) {
    const isFallback = typeof img === "object" && "url" in img && !("id" in img);
    const src: StrapiMedia | string = isFallback
        ? (img as ArticleImage).url
        : (img as StrapiImageInput);
    const alt = (isFallback ? (img as ArticleImage).alt : undefined) ?? defaultAlt;

    const fallbackWH = isFallback
        ? { width: (img as ArticleImage).width, height: (img as ArticleImage).height }
        : {};

    const commonClass =
        "overflow-hidden rounded-xl border border-border/60 bg-background/40 shadow-sm";

    if (behavior.fit === "fixed") {
        const { width, height, priority } = behavior;
        return (
            <figure className={cn(commonClass, "max-w-full")}>
                <StrapiImage
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    priority={priority}
                    className="h-auto w-auto"
                    sizes="(min-width: 768px) 420px, 100vw"
                />
                {alt && (
                    <figcaption className="px-3 pb-3 pt-1 text-xs text-muted-foreground">
                        {alt}
                    </figcaption>
                )}
            </figure>
        );
    }

    if (behavior.fit === "intrinsic") {
        return (
            <figure className={cn(commonClass, "inline-block")}>
                <StrapiImage
                    src={src}
                    alt={alt}
                    width={fallbackWH.width}
                    height={fallbackWH.height}
                    className="h-auto w-auto"
                    sizes="(min-width: 768px) 420px, 100vw"
                    priority={behavior.priority}
                />
                {alt && (
                    <figcaption className="px-3 pb-3 pt-1 text-xs text-muted-foreground">
                        {alt}
                    </figcaption>
                )}
            </figure>
        );
    }

    // responsive
    return (
        <figure
            className={cn(
                commonClass,
                variant === "centered" ? "mx-auto max-w-3xl" : "w-full"
            )}
        >
            <StrapiImage
                src={src}
                alt={alt}
                width={fallbackWH.width}
                height={fallbackWH.height}
                className="h-auto w-full"
                sizes={
                    variant === "centered"
                        ? "(min-width: 1024px) 768px, 100vw"
                        : "(min-width: 768px) 420px, 100vw"
                }
                priority={behavior.priority}
            />
            {alt && (
                <figcaption className="px-3 pb-3 pt-1 text-xs text-muted-foreground">
                    {alt}
                </figcaption>
            )}
        </figure>
    );
}
