import Image, { type ImageProps } from 'next/image';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { normalizeStrapiUrl, type StrapiMedia, type MediaFormatInfo } from '@/types/strapi/common';
import { FALLBACK_IMG } from "@/app/const";

type StrapiImageSource = StrapiMedia | string | null | undefined;

export interface StrapiImageProps extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'fill'> {
    /** Acepta string (URL) o un objeto StrapiMedia */
    src: StrapiImageSource;
    /** Nombre del formato de Strapi (thumbnail, small, medium, large, etc.) */
    format?: string;
    /** Texto alternativo (si no se provee, se intenta inferir desde StrapiMedia) */
    alt?: string;
    /** Title HTML (si no se provee, se intenta inferir desde StrapiMedia) */
    title?: string;
    /** Si lo estableces, usa `<Image fill>`; si no, intenta derivar width/height del media */
    fill?: boolean;
    /** Width/height opcionales si quieres forzar dimensiones cuando no usas fill */
    width?: number;
    height?: number;
    /** Clases adicionales */
    className?: string;
    /** sizes para responsive (por defecto 100vw) */
    sizes?: string;
}

/** Prioridad de formatos cuando no se especifica `format` */
const FORMAT_PRIORITY = ['large', 'medium', 'small', 'thumbnail'];

/** Extrae el formato de Strapi más adecuado */
function pickFormat(
    media?: StrapiMedia,
    formatName?: string
): MediaFormatInfo | undefined {
    const formats = media?.formats;
    if (!formats) return undefined;

    if (formatName && formats[formatName]) {
        return formats[formatName];
    }

    for (const name of FORMAT_PRIORITY) {
        if (formats[name]) return formats[name];
    }
    return undefined;
}

/** Intenta construir la mejor URL a partir de string o StrapiMedia */
function computeUrl(input: StrapiImageSource, format?: string): string | undefined {
    if (!input) return undefined;

    // Caso string directo
    if (typeof input === 'string') {
        const trimmed = input.trim();
        if (!trimmed) return undefined;
        // Normalizamos SIEMPRE lo que venga de Strapi o absoluto
        return normalizeStrapiUrl(trimmed);
    }

    // Caso StrapiMedia
    const media = input as StrapiMedia;
    const chosen = pickFormat(media, format);
    const candidate = chosen?.url ?? media.url ?? media.previewUrl ?? undefined;
    if (!candidate) return undefined;

    return normalizeStrapiUrl(candidate);
}

/** Infiero alt/title SEO-friendly desde StrapiMedia */
function inferSeo(
    media?: StrapiMedia,
    overrideAlt?: string,
    overrideTitle?: string
): { alt: string; title?: string } {
    const alt =
        overrideAlt ??
        (media?.alternativeText?.trim() ||
            media?.caption?.trim() ||
            media?.name?.trim() ||
            'Imagen');

    const title =
        overrideTitle ??
        (media?.caption?.trim() || media?.name?.trim() || undefined);

    return { alt, title };
}

/** Infiero dimensiones desde el formato elegido o desde la imagen base */
function inferDimensions(
    media?: StrapiMedia,
    format?: string
): { width?: number; height?: number } {
    if (!media) return {};
    const chosen = pickFormat(media, format);
    const width = chosen?.width ?? media.width ?? undefined;
    const height = chosen?.height ?? media.height ?? undefined;
    return { width, height };
}

export function StrapiImage(props: StrapiImageProps) {
    const {
        src,
        format,
        alt: altProp,
        title: titleProp,
        className,
        fill,
        width,
        height,
        sizes = '100vw',
        // Pasamos lo demás tal cual a <Image/>
        ...rest
    } = props;

    // URL final (si no se puede resolver, uso FALLBACK_IMG sin pasar por normalize)
    const resolvedUrl = computeUrl(src, format) || FALLBACK_IMG;

    // SEO alt/title
    const mediaObj = typeof src === 'object' ? (src as StrapiMedia) : undefined;
    const { alt, title } = inferSeo(mediaObj, altProp, titleProp);

    // Dimensiones: si no hay fill, necesito width/height para <Image/>
    const inferred = inferDimensions(mediaObj, format);
    const finalWidth = fill ? undefined : width ?? inferred.width ?? 800;
    const finalHeight = fill ? undefined : height ?? inferred.height ?? 600;

    // Seguridad: si alguien puso fill sin sizes, mantenemos el sizes por defecto
    const imageProps: Partial<ImageProps> = fill
        ? { fill: true, sizes }
        : { width: finalWidth, height: finalHeight, sizes };

    return (
        <Image
            src={resolvedUrl}
            alt={alt}
            title={title}
            className={cn(className)}
            // buenas prácticas de performance, se pueden sobreescribir desde props
            loading="lazy"
            decoding="async"
            {...imageProps}
            {...rest}
        />
    );
}

export default StrapiImage;
