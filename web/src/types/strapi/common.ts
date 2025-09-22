// ===== Utilidades comunes =====
export type ISODateString = string;

/** Strapi RichText (editor) muy básico y extensible */
export type RichTextNode =
    | { type: 'text'; text?: string }
    | { type: 'paragraph'; children?: RichTextNode[] };

/** Atributos base repetidos en Strapi */
export interface StrapiBase {
    id?: number;
    documentId?: string;
    createdAt?: ISODateString;
    updatedAt?: ISODateString;
    publishedAt?: ISODateString;
}

// ===== Media =====
export interface MediaFormatInfo {
    name?: string;
    hash?: string;
    ext?: string;
    mime?: string;
    path?: string | null;
    width?: number;
    height?: number;
    size?: number;
    sizeInBytes?: number;
    url?: string;
}

/** `formats` es un diccionario (thumbnail, small, medium, large, etc.) */
export type MediaFormats = Record<string, MediaFormatInfo | undefined>;

export interface MediaImage extends StrapiBase {
    name?: string;
    alternativeText?: string | null;
    caption?: string | null;
    width?: number;
    height?: number;
    formats?: MediaFormats;
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url?: string;
    previewUrl?: string | null;
    provider?: string;
    provider_metadata?: unknown;
}

// ===== Respuestas API =====
export interface ApiPagination {
    page?: number;
    pageSize?: number;
    pageCount?: number;
    total?: number;
}

export interface ApiMeta {
    pagination?: ApiPagination;
    // agrega aquí otros metadatos si los usas
}

/** Listado paginado típico de Strapi */
export interface StrapiList<T> {
    data: T[];
    meta?: ApiMeta;
}

/** Recurso individual típico de Strapi */
export interface StrapiSingular<T> {
    data: T;
    meta?: ApiMeta;
}