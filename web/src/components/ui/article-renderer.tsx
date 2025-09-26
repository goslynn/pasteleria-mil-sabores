import * as React from "react";
import { cn } from "@/lib/utils";
import { ArticleSection } from "@/types/page-types";
import StrapiImage, { StrapiImageSource } from "@/components/ui/strapi-image";
import StrapiBlocks from "@/components/ui/strapi-blocks.client";

export enum ArticleVariant {
    Centered = "centered",
    ImageLeft = "imageLeft",
    ImageRight = "imageRight",
}

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


/** type guard para el enum */
function isArticleVariant(x: unknown): x is ArticleVariant {
    return (
        x === ArticleVariant.Centered ||
        x === ArticleVariant.ImageLeft ||
        x === ArticleVariant.ImageRight
    );
}

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

    const { title, paragraph, variant: rawVariant, image } = content;

    // Normalizar variant a enum
    const variant: ArticleVariant = isArticleVariant(rawVariant)
        ? rawVariant
        : ArticleVariant.Centered;

    // Elegir imagen a usar (puede venir de Strapi o fallback manual)
    const imgToUse: ArticleImage | StrapiImageSource | undefined =
        variant === ArticleVariant.Centered ? centeredFallbackImage ?? image : image;

    const figure =
        imgToUse != null
            ? renderFigure(imgToUse, imageBehavior, variant, /* defaultAlt */ title)
            : null;

    const withSideImage =
        (variant === ArticleVariant.ImageLeft || variant === ArticleVariant.ImageRight) &&
        imgToUse != null &&
        !Boolean(imageBehavior.wrapText);

    const isCentered = variant === ArticleVariant.Centered;
    const sectionPad = isCentered ? "md:px-24" : "";

    const jsonLd = enableJsonLd
        ? {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: descriptionForSeo,
            image:
                imgToUse && typeof imgToUse === "object" && "url" in imgToUse
                    ? (imgToUse as ArticleImage).url
                    : undefined,
            datePublished: publishedTimeISO,
            dateModified: modifiedTimeISO ?? publishedTimeISO,
        }
        : null;

    // ⬇️ Header listo para reusar (lo colocaremos arriba o dentro de la columna de texto)
    const headerEl = (
        <header className={cn(isCentered ? "text-center" : "text-left", "mb-8")}>
            {solveHeader(headingLevel, title)}
        </header>
    );

    console.log("article: ", title, " isCentered: ", isCentered)

    return (
        <section
            id={id}
            className={cn("mx-auto w-full max-w-5xl px-4 md:px-6", className, sectionPad)}
            itemScope
            itemType="https://schema.org/Article"
        >
            {/* En variantes laterales, movemos el header a la columna de texto para alinear con la imagen */}
            {!withSideImage && headerEl}

            {isCentered && imgToUse != null && !imageBehavior.wrapText && (
                <div className="mt-6 flex justify-center">{figure}</div>
            )}

            {withSideImage ? (
                <div
                    className={cn(
                        "mt-6 grid gap-6 md:gap-8",
                        variant === ArticleVariant.ImageRight
                            ? "md:grid-cols-[1fr_minmax(280px,420px)]"
                            : "md:grid-cols-[minmax(280px,420px)_1fr]"
                    )}
                >
                    {variant === ArticleVariant.ImageLeft && figure}

                    {/* ⬇️ Aquí va el header junto con el párrafo para alinear tope con la imagen */}
                    <div>
                        {headerEl}
                        <StrapiBlocks content={paragraph}/>
                    </div>

                    {variant === ArticleVariant.ImageRight && figure}
                </div>
            ) : (
                <div className="mt-6">
                    {imgToUse != null && imageBehavior.wrapText && (
                        <div
                            className={cn(
                                "mb-4 md:mb-2",
                                variant === ArticleVariant.ImageRight
                                    ? "md:float-right md:ml-6 md:mb-2"
                                    : "md:float-left md:mr-6 md:mb-2"
                            )}
                        >
                            {figure}
                        </div>
                    )}

                    <StrapiBlocks content={paragraph}/>

                    {imgToUse != null && imageBehavior.wrapText && <div className="clear-both" />}
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
                <h1 itemProp="headline" className="scroll-m-20 text-3xl md:text-4xl font-bold tracking-tight">
                    {children}
                </h1>
            );
        case 2:
            return (
                <h2 itemProp="headline" className="scroll-m-20 text-2xl md:text-3xl font-bold tracking-tight">
                    {children}
                </h2>
            );
        case 3:
            return (
                <h3 itemProp="headline" className="scroll-m-20 text-xl md:text-2xl font-bold tracking-tight">
                    {children}
                </h3>
            );
        case 4:
            return (
                <h4 itemProp="headline" className="scroll-m-20 text-lg md:text-xl font-bold tracking-tight">
                    {children}
                </h4>
            );
        case 5:
            return (
                <h5 itemProp="headline" className="scroll-m-20 text-base md:text-lg font-bold tracking-tight">
                    {children}
                </h5>
            );
        case 6:
            return (
                <h6 itemProp="headline" className="scroll-m-20 text-sm md:text-base font-bold tracking-tight">
                    {children}
                </h6>
            );
        default:
            return (
                <h2 itemProp="headline" className="scroll-m-20 text-2xl md:text-3xl font-bold tracking-tight">
                    {children}
                </h2>
            );
    }
}

function renderFigure(
    img: StrapiImageSource | ArticleImage | null | undefined,
    behavior: ImageBehavior,
    variant: ArticleVariant,
    defaultAlt: string
) {
    if (img == null) return null;

    const isFallback =
        typeof img === "object" && true && "url" in img &&
        !("id" in (img as unknown as Record<string, unknown>));

    const src: StrapiImageSource | string = isFallback ? img.url : (img as StrapiImageSource);
    const alt = (isFallback ? (img as ArticleImage).alt : undefined) ?? defaultAlt;
    const fallbackWH = isFallback ? { width: img.width, height: img.height } : {};

    // Pega la figura al tope del grid/columna
    const commonClass =
        "self-start overflow-hidden rounded-xl border border-border/60 bg-background/40 shadow-sm";

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
            </figure>
        );
    }

    if (behavior.fit === "intrinsic") {
        return (
            <figure className={cn(commonClass, "inline-block max-w-full")}>
                <StrapiImage
                    src={src}
                    alt={alt}
                    width={(fallbackWH as { width?: number }).width}
                    height={(fallbackWH as { height?: number }).height}
                    className="h-auto w-auto max-w-md md:max-w-lg" // evita que quede gigante junto a poco texto
                    sizes="(min-width: 768px) 420px, 100vw"
                    priority={behavior.priority}
                />
            </figure>
        );
    }

    // responsive (recomendado para imágenes más grandes que el texto)
    return (
        <figure
            className={cn(
                commonClass,
                variant === ArticleVariant.Centered ? "mx-auto max-w-3xl" : "w-full",
                "max-h-96" // limite visual para no dominar la columna
            )}
        >
            <StrapiImage
                src={src}
                alt={alt}
                width={(fallbackWH as { width?: number }).width}
                height={(fallbackWH as { height?: number }).height}
                className="h-auto w-full object-cover" // recorte elegante si la imagen es muy alta
                sizes={
                    variant === ArticleVariant.Centered
                        ? "(min-width: 1024px) 768px, 100vw"
                        : "(min-width: 768px) 420px, 100vw"
                }
                priority={behavior.priority}
            />
        </figure>
    );
}