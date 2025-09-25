'use client'

import * as React from 'react'
import type { Link as LinkType, SocialKind, SocialLink } from '@/types/general'
// react-icons de Simple Icons (brand icons)
import {
    SiFacebook, SiInstagram, SiX, SiTiktok, SiYoutube, SiLinkedin,
    SiGithub, SiWhatsapp
} from 'react-icons/si'
import type { IconType } from 'react-icons'
import {StrapiImage, StrapiImageSource} from "@/components/ui/strapi-image";
import {ImageFormat} from "@/types/strapi/common";

// ---------- Tipos ----------
export type FooterSection = {
    title?: string
    links: LinkType[]
}

export interface FooterProps {
    id: string
    brand?: {
        name?: string
        logo?: StrapiImageSource
        href?: string
    }
    sections?: FooterSection[]
    socials?: SocialLink[]
    copyright?: {
        owner?: string
        year?: number | 'auto'
        textPrefix?: string
    }
    separator?: boolean
    className?: string
    navAriaLabel?: string
}

// ---------- Mapeo de íconos por red ----------
const SocialIconMap: Partial<Record<SocialKind, IconType>> = {
    facebook: SiFacebook,
    instagram: SiInstagram,
    x: SiX,
    tiktok: SiTiktok,
    youtube: SiYoutube,
    linkedin: SiLinkedin,
    github: SiGithub,
    whatsapp: SiWhatsapp,
}

function SocialIcon({ kind, className }: { kind: SocialKind; className?: string }) {
    const Icon = SocialIconMap[kind]
    if (!Icon) return null
    return <Icon className={className} aria-hidden="true" />
}

// ---------- Componente ----------
export function Footer({
                           id,
                           brand,
                           sections = [],
                           socials = [],
                           copyright,
                           separator = true,
                           className = '',
                           navAriaLabel = 'Footer',
                       }: FooterProps) {
    const year =
        copyright?.year === 'auto' || copyright?.year === undefined
            ? new Date().getFullYear()
            : copyright.year

    const owner = copyright?.owner ?? brand?.name ?? ''
    const prefix = copyright?.textPrefix ?? '©'

    const externalAttrs = (isExternal?: boolean) =>
        isExternal ? ({ target: '_blank', rel: 'noopener noreferrer' } as const) : ({})

    return (
        <footer
            id={id}
            role="contentinfo"
            className={[
                'w-full',
                // usamos un borde neutro para evitar tokens que te fallaban (border-border)
                separator ? 'border-t border-white/10' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Marca + Social */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between items-center text-center">
                    {/* Marca */}
                    {brand ? (
                        <div className="flex items-center gap-3">
                            {brand.logo ? (
                                <a
                                    href={brand.href ?? '#'}
                                    className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                                    aria-label={brand.name ?? 'Inicio'}
                                >
                                    <StrapiImage src={brand.logo} className="h-8 w-auto" format={ImageFormat.Thumbnail}/>
                                    {brand.name ? <span className="font-semibold">{brand.name}</span> : null}
                                </a>
                            ) : brand.name ? (
                                <a
                                    href={brand.href ?? '#'}
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
                            <ul className="flex gap-2 sm:gap-3">
                                {socials.map(({ kind, link, label, external = true }) => (
                                    <li key={`${kind}-${link}`}>
                                        <a
                                            href={link}
                                            aria-label={label ?? kind}
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
                                            {...externalAttrs(external)}
                                        >
                                            <SocialIcon kind={kind} className="h-5 w-5" />
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
                        className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {sections.map((section, idx) => (
                            <div key={section.title ?? `sec-${idx}`}>
                                {section.title ? (
                                    <h2 className="mb-3 text-sm font-semibold tracking-wide">
                                        {section.title}
                                    </h2>
                                ) : null}
                                <ul className="space-y-2">
                                    {section.links.map(({ label, link, external }, i) => (
                                        <li key={`${label}-${i}`} className="pl-2">
                                            <a
                                                href={link}
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
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-xs opacity-70 text-center">
                        {prefix} {owner ? `${year} ${owner}` : year}
                    </p>
                </div>
            </div>
        </footer>
    )
}
