// components/strapi-image.tsx
import Image, { type ImageProps } from 'next/image';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { normalizeStrapiUrl, type StrapiMedia, type MediaFormatInfo } from '@/types/strapi/common';
import { FALLBACK_IMG } from '@/app/const';

type StrapiImageSource = StrapiMedia | string | null | undefined;

export interface StrapiImageProps
    extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'fill'> {
    src: StrapiImageSource;
    format?: string;
    alt?: string;
    title?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    sizes?: string;
}

/* --- helpers --- */
function pickFormat(media?: StrapiMedia, formatName?: string): MediaFormatInfo | undefined {
    const formats = media?.formats;
    if (!formats) return;

    // Solo buscar si se pidió un formato explícito
    if (formatName && formats[formatName]) {
        return formats[formatName];
    }
    return undefined;
}

function computeUrl(input: StrapiImageSource, format?: string): string | undefined {
    if (!input) return;
    if (typeof input === "string") {
        const trimmed = input.trim();
        if (!trimmed) return;
        return normalizeStrapiUrl(trimmed);
    }

    const media = input as StrapiMedia;

    // Si no hay format -> usa url base
    if (!format) {
        return media.url ? normalizeStrapiUrl(media.url) : undefined;
    }

    // Si hay format, intenta buscarlo
    const chosen = pickFormat(media, format);
    const candidate = chosen?.url ?? media.url ?? media.previewUrl ?? undefined;
    return candidate ? normalizeStrapiUrl(candidate) : undefined;
}

function inferDimensions(media?: StrapiMedia, format?: string): { width?: number; height?: number } {
    if (!media) return {};

    // Igual que computeUrl: si no hay format, devolver dimensiones de la base
    if (!format) {
        return {
            width: media.width ?? undefined,
            height: media.height ?? undefined,
        };
    }

    const chosen = pickFormat(media, format);
    return {
        width: chosen?.width ?? media.width ?? undefined,
        height: chosen?.height ?? media.height ?? undefined,
    };
}


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
    const title = overrideTitle ?? (media?.caption?.trim() || media?.name?.trim() || undefined);
    return { alt, title };
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
        priority: priorityProp,
        loading: loadingProp,
        ...rest
    } = props;

    const resolvedUrl = computeUrl(src, format) || FALLBACK_IMG;

    const mediaObj = typeof src === 'object' ? (src as StrapiMedia) : undefined;
    const { alt, title } = inferSeo(mediaObj, altProp, titleProp);

    const inferred = inferDimensions(mediaObj, format);
    const finalWidth = fill ? undefined : width ?? inferred.width ?? 800;
    const finalHeight = fill ? undefined : height ?? inferred.height ?? 600;

    const priority = !!priorityProp;
    // Evitar conflicto: si priority es true, NO pasamos loading.
    const loading =
        priority ? undefined : loadingProp /* si lo envías, se respeta; si no, Next usa lazy */;

    const sizeProps = fill ? { fill: true as const, sizes } : { width: finalWidth, height: finalHeight, sizes };

    return (
        <Image
            src={resolvedUrl}
            alt={alt}
            title={title}
            className={cn(className)}
            priority={priority}
            {...(loading ? { loading } : {})}
            {...sizeProps}
            {...rest}
        />
    );
}

export default StrapiImage;
