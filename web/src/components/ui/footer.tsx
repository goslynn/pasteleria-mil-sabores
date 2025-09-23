import * as React from "react";
import {Link, SocialKind, SocialLink} from "@/types/general";

export type FooterSection = {
    title?: string;
    links: Link[];
};

export interface FooterProps {
    id : string;
    /** Marca opcional (logo y/o nombre clickeable) */
    brand?: {
        name?: string;
        logoUrl?: string;
        href?: string;
    };
    /** Lista de secciones (cada sección con sus links) */
    sections?: FooterSection[];
    /** Redes sociales opcionales */
    socials?: SocialLink[];

    /** Texto de copyright */
    copyright?: {
        owner?: string; // por defecto brand.name si existe
        year?: number | "auto"; // por defecto "auto"
        textPrefix?: string; // p.ej. "©"
    };

    /** Presentación */
    separator?: boolean; // borde superior (default: true)
    className?: string; // clases extra para el wrapper

    /** Accesibilidad */
    navAriaLabel?: string; // default: "Footer"
}

/** Iconos SVG inline (sin dependencias) */
function SocialIcon({ kind }: { kind: SocialKind }) {
    const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "currentColor" } as const;
    switch (kind) {
        case "facebook":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M13 3h4a1 1 0 0 1 1 1v3h-3a1 1 0 0 0-1 1v3h4l-1 4h-3v7h-4v-7H7v-4h3V8a5 5 0 0 1 5-5z" />
                </svg>
            );
        case "instagram":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.5A2.5 2.5 0 1 0 12 16a2.5 2.5 0 0 0 0-5.5zM18 6.5a1 1 0 1 1 0 2.001 1 1 0 0 1 0-2.001z" />
                </svg>
            );
        case "x":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M3 3h5.3l4.1 5.4L17 3h4l-6.9 8.2L21 21h-5.3l-4.6-6.1L7 21H3l7-8.4L3 3z" />
                </svg>
            );
        case "tiktok":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M15 2c1.3 2 3 3.2 5 3.3V9c-2.2-.1-4.1-1.1-5-2.3V15a7 7 0 1 1-7-7c.5 0 1 .1 1.5.2V11a3.5 3.5 0 1 0 2.5 3.3V2h3z" />
                </svg>
            );
        case "youtube":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M23 12c0-2.2-.2-3.7-.5-4.6-.3-.8-1-1.5-1.8-1.8C19.8 5.2 12 5.2 12 5.2s-7.8 0-8.7.4c-.8.3-1.5 1-1.8 1.8C1.2 8.3 1 9.8 1 12s.2 3.7.5 4.6c.3.8 1 1.5 1.8 1.8.9.4 8.7.4 8.7.4s7.8 0 8.7-.4c.8-.3 1.5-1 1.8-1.8.3-.9.5-2.4.5-4.6zM10 15.5v-7l6 3.5-6 3.5z" />
                </svg>
            );
        case "linkedin":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.1c.5-.9 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 5.9V21h-4v-4.9c0-1.2 0-2.8-1.7-2.8-1.7 0-1.9 1.3-1.9 2.7V21h-4z" />
                </svg>
            );
        case "github":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.5-1.5-1.9-1.5-1.9-1.2-.8.1-.8.1-.8 1.3.1 2 .  9 2 . 9 2.2 1.9 3.4 1.3 4.2 1 .9. - .  6. 3-  .  2 .  6-.  3 1 .  3-  .  4 2 .  2-  .  8 3 .  9-  .  8 2 .  2-.  8 4 .  8-  .  8 2 .  2-.  8V19c0-1 .  2-.  4- .  8-1 .  7-2 .  8- .  3-  .  6-1 .  3-2 .  6-1 .  8-3 .  5 1 .  5- .  8 3 .  5-2 .  5 3 .  5-  .  8 1 .  5-  .  8 0-  .  8-  .  8 1 .  5V3c0-.  3 .  2-.  7 .  8-.  6A12 12 0 0 0 12 .5z" />
                </svg>
            );
        case "whatsapp":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M20 3.9A10 10 0 0 0 4 17.3L3 21l3.8-1A10 10 0 0 0 12 22a10 10 0 0 0 8-18.1zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.4.7.7-2.3-.2-.3A8 8 0 1 1 20 12a8 8 0 0 1-8 8zm4.5-5.8c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1s-.7.7-.8.9c-.1.1-.3.2-.6.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3.1-.1.1-.2.2-.3.1-.1.1-.2.1-.3 0-.1 0-.2 0-.3s0-.4-.2-.6c-.1-.2-.6-.6-.8-.6-.2 0-.5 0-.7 0-.2 0-.5.2-.7.4s-.7.7-.7 1.7 1 .  9 1 .  9c.1.2 1.9 3 4.5 4.2.6.3 1.1.5 1.5.6.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.4-1s.2-.9.1-1.1c-.2-.1-.4-.2-.6-.3z" />
                </svg>
            );
        default:
            return null;
    }
}

export function Footer({
                           id,
                           brand,
                           sections = [],
                           socials = [],
                           copyright,
                           separator = true,
                           className = "",
                           navAriaLabel = "Footer",
                       }: FooterProps) {
    const year =
        copyright?.year === "auto" || copyright?.year === undefined
            ? new Date().getFullYear()
            : copyright.year;

    const owner =
        copyright?.owner ??
        brand?.name ??
        ""; // si no hay owner ni brand, se deja vacío

    const prefix = copyright?.textPrefix ?? "©";

    const externalAttrs = (isExternal?: boolean) =>
        isExternal
            ? { target: "_blank", rel: "noopener noreferrer" as const }
            : {};

    return (
        <footer
            id={id}
            className={[
                "w-full",
                separator ? "border-t border-border/40" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            role="contentinfo"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Marca + Social */}
                <div
                    className="flex flex-col gap-4 sm:flex-row sm:justify-between items-center text-center"
                >
                    {/* Marca */}
                    {brand ? (
                        <div className="flex items-center gap-3">
                            {brand.logoUrl ? (
                                <a
                                    href={brand.href ?? "#"}
                                    className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                                    aria-label={brand.name ?? "Inicio"}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={brand.logoUrl}
                                        alt={brand.name ?? "Logo"}
                                        className="h-8 w-auto"
                                    />
                                    {brand.name ? (
                                        <span className="font-semibold">{brand.name}</span>
                                    ) : null}
                                </a>
                            ) : brand.name ? (
                                <a
                                    href={brand.href ?? "#"}
                                    className="inline-flex items-center font-semibold hover:opacity-90 transition-opacity"
                                >
                                    {brand.name}
                                </a>
                            ) : null}
                        </div>
                    ) : (
                        <span className="sr-only">Brand</span>
                    )}

                    {/* Redes sociales */}
                    {socials.length > 0 ? (
                        <nav aria-label="Redes sociales">
                            <ul className="flex gap-3 sm:gap-4">
                                {socials.map(({ kind, href, label, external = true }) => (
                                    <li key={`${kind}-${href}`}>
                                        <a
                                            href={href}
                                            aria-label={label ?? kind}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/10 transition-colors"
                                            {...externalAttrs(external)}
                                        >
                                            <SocialIcon kind={kind} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ) : null}
                </div>

                {/* Secciones */}
                {sections.length > 0 ? (
                    <nav
                        aria-label={navAriaLabel}
                        className={[
                            "mt-8 grid gap-6",
                            // columnas responsivas simples
                            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                        ].join(" ")}
                    >
                        {sections.map((section, idx) => (
                            <div key={section.title ?? `sec-${idx}`}>
                                {section.title ? (
                                    <h2 className="mb-2 text-sm font-semibold tracking-wide opacity-80">
                                        {section.title}
                                    </h2>
                                ) : null}
                                <ul className="space-y-2">
                                    {section.links.map(({ label, href, external }, i) => (
                                        <li key={`${label}-${i}`}>
                                            <a
                                                href={href}
                                                className="text-sm hover:underline underline-offset-4"
                                                {...externalAttrs(external)}
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                ) : null}

                {/* Línea final */}
                <div className="mt-8 pt-6 border-t border-border/40">
                    <p className="text-xs opacity-70 items-center text-center">
                        {prefix} {owner ? `${year} ${owner}` : year}
                    </p>
                </div>
            </div>
        </footer>
    );
}
