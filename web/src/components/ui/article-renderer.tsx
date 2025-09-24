// app/components/article-section.tsx
import Image from "next/image";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";
import { cn } from "@/lib/utils";
import {ArticleSection} from "@/types/page-types";


export type ArticleSectionVariant = "centered" | "imageLeft" | "imageRight";

/**
 * Comportamiento de la imagen:
 * - fit: "fixed" es decir fija, requiere width/height (explicitos en px)
 * - fit: "responsive" se adapta al contenedor manteniendo ratio
 * - fit: "intrinsic" usa tamaño natural de la imagen (si viene en metadata)
 * - wrapText (opcional) : si true, permite que el texto “rodee” la imagen (float)
 * - priority (opcional) : si true, marca la imagen como prioritaria para Next.js (opcional)
 */
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

/**
 * Seccion de articulo, tipo extraido de Strapi.
 */
export interface ArticleSectionProps extends ArticleSection {
    /** nivel de titulo (h1, h2...) */
    headingLevel: 1 | 2 | 3 | 4 | 5 | 6;


    /**
     * En variant="centered" puedes inyectar una imagen “externa” si quieres mostrarla igual.
     * Si no se pasa, no se renderiza imagen en centered.
     */
    centeredFallbackImage?: ArticleImage;

    /** Opcionales */
    className?: string;
    id?: string;

    /** Cambia el wrapper por <div> en vez de <p> para los párrafos */
    useDivForParagraph?: boolean;

    /**
     * Comportamiento de la imagen (tamaño/flujo).
     * - fixed: requiere width/height
     * - responsive/intrinsic: toma el tamaño natural o se adapta al contenedor
     * - wrapText: si true, permite que el texto “rodee” la imagen (float)
     */
    imageBehavior?: ImageBehavior;

    /** JSON-LD para SEO (si quieres sobreescribir/añadir props) */
    enableJsonLd?: boolean;
    descriptionForSeo?: string;
    publishedTimeISO?: string; // ej: "2025-09-23T12:00:00.000Z"
    modifiedTimeISO?: string;
}

export function ArticleRenderer({
                                    title,
                                    paragraph,
                                    variant,
                                    image,
                                    centeredFallbackImage,
                                    className,
                                    headingLevel = 2,
                                    id,
                                    useDivForParagraph,
                                    imageBehavior = {fit: "responsive", wrapText: false},
                                    enableJsonLd = true,
                                    descriptionForSeo,
                                    publishedTimeISO,
                                    modifiedTimeISO,
                                }: ArticleSectionProps) {

    const imgToUse: ArticleImage | undefined =
        variant === "centered" ? centeredFallbackImage ?? image : image;

    const figure =
        imgToUse &&
        renderFigure(imgToUse, imageBehavior, variant, /* defaultAlt */ title);

    // layout principal
    const withSideImage =
        (variant === "imageLeft" || variant === "imageRight") && !!imgToUse && !imageBehavior.wrapText;

    // JSON-LD básico de Article
    const jsonLd =
        enableJsonLd
            ? {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: title,
                description: descriptionForSeo,
                image: imgToUse?.url,
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


            {/* centered con posible imagen arriba */}
            {variant === "centered" && imgToUse && !imageBehavior.wrapText && (
                <div className="mt-6 flex justify-center">{figure}</div>
            )}

            {/* layout side-by-side si no es wrapping */}
            {withSideImage ? (
                <div
                    className={cn(
                        "mt-6 grid gap-6 md:gap-8",
                        variant === "imageRight" ? "md:grid-cols-[1fr_minmax(280px,420px)]" : "md:grid-cols-[minmax(280px,420px)_1fr]"
                    )}
                >
                    {variant === "imageLeft" && figure}
                    <ArticleBody content={paragraph} useDiv={useDivForParagraph}/>
                    {variant === "imageRight" && figure}
                </div>
            ) : (
                // wrapping o sin imagen lateral
                <div className="mt-6">
                    {/* si wrapText true, la figura flota y el texto la rodea */}
                    {imgToUse && imageBehavior.wrapText && (
                        <div
                            className={cn(
                                "mb-4 md:mb-2",
                                variant === "imageRight" ? "md:float-right md:ml-6 md:mb-2" : "md:float-left md:mr-6 md:mb-2"
                            )}
                        >
                            {figure}
                        </div>
                    )}
                    <ArticleBody content={paragraph} useDiv={useDivForParagraph}/>
                    {/* limpiar floats si se usaron */}
                    {imgToUse && imageBehavior.wrapText && <div className="clear-both"/>}
                </div>
            )}

            {/* JSON-LD para SEO */}
            {jsonLd && (
                <script
                    type="application/ld+json"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: server-rendered, contenido controlado
                    dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
                />
            )}
        </section>
    );
}

function solveHeader(level: number, children: React.ReactNode) {
    switch (level) {
        case 1:
            return <h1 itemProp="headline" className="scroll-m-20 text-3xl md:text-4xl font-bold tracking-tight">{children}</h1>;
        case 2:
            return <h2 itemProp="headline" className="scroll-m-20 text-2xl md:text-3xl font-bold tracking-tight">{children}</h2>;
        case 3:
            return <h3 itemProp="headline" className="scroll-m-20 text-xl md:text-2xl font-bold tracking-tight">{children}</h3>;
        case 4:
            return <h4 itemProp="headline" className="scroll-m-20 text-lg md:text-xl font-bold tracking-tight">{children}</h4>;
        case 5:
            return <h5 itemProp="headline" className="scroll-m-20 text-base md:text-lg font-bold tracking-tight">{children}</h5>;
        case 6:
            return <h6 itemProp="headline" className="scroll-m-20 text-sm md:text-base font-bold tracking-tight">{children}</h6>;
        default:
            return <h2 itemProp="headline" className="scroll-m-20 text-2xl md:text-3xl font-bold tracking-tight">{children}</h2>;
    }
}

/* ---------- helpers ---------- */

function renderFigure(
    img: ArticleImage,
    behavior: ImageBehavior,
    variant: ArticleSectionVariant,
    defaultAlt: string
) {
    const alt = img.alt ?? defaultAlt;

    const commonClass =
        "overflow-hidden rounded-xl border border-border/60 bg-background/40 shadow-sm";

    if (behavior.fit === "fixed") {
        const { width, height, priority } = behavior;
        return (
            <figure className={cn(commonClass, "max-w-full")}>
                <Image
                    src={img.url}
                    alt={alt}
                    width={width}
                    height={height}
                    priority={priority}
                    className="h-auto w-auto"
                    sizes="(min-width: 768px) 420px, 100vw"
                />
                {alt && <figcaption className="px-3 pb-3 pt-1 text-xs text-muted-foreground">{alt}</figcaption>}
            </figure>
        );
    }

    if (behavior.fit === "intrinsic") {
        return (
            <figure className={cn(commonClass, "inline-block")}>
                {/* sin width/height explícitos: usa metadata de la imagen si viene */}
                <Image
                    src={img.url}
                    alt={alt}
                    width={img.width ?? 800}
                    height={img.height ?? 600}
                    className="h-auto w-auto"
                    sizes="(min-width: 768px) 420px, 100vw"
                    priority={behavior.priority}
                />
                {alt && <figcaption className="px-3 pb-3 pt-1 text-xs text-muted-foreground">{alt}</figcaption>}
            </figure>
        );
    }

    // responsive
    return (
        <figure className={cn(commonClass, variant === "centered" ? "mx-auto max-w-3xl" : "w-full")}>
            <Image
                src={img.url}
                alt={alt}
                width={img.width ?? 1200}
                height={img.height ?? 800}
                className="h-auto w-full"
                sizes={variant === "centered" ? "(min-width: 1024px) 768px, 100vw" : "(min-width: 768px) 420px, 100vw"}
                priority={behavior.priority}
            />
            {alt && <figcaption className="px-3 pb-3 pt-1 text-xs text-muted-foreground">{alt}</figcaption>}
        </figure>
    );
}

function ArticleBody({ content, useDiv }: { content: BlocksContent; useDiv?: boolean }) {
    return (
        <article className="prose prose-neutral dark:prose-invert max-w-none" itemProp="articleBody">
            <BlocksRenderer
                content={content}
                blocks={{
                    paragraph: ({ children }) =>
                        useDiv ? <div className="mb-4 leading-7">{children}</div> : <p className="leading-7">{children}</p>,
                }}
                modifiers={{
                    bold: ({ children }) => <strong>{children}</strong>,
                    italic: ({ children }) => <em>{children}</em>,
                    code: ({ children }) => (
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{children}</code>
                    ),
                }}
            />
        </article>
    );
}
