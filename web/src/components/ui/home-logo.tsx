import Link from "next/link";
import {cn} from "@/lib/utils";
import React from "react";

function Logo(props: React.SVGAttributes<SVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 324 323" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect x="88.1023" y="144.792" width="151.802" height="36.5788" rx="18.2894" transform="rotate(-38.5799 88.1023 144.792)" fill="currentColor" />
            <rect x="85.3459" y="244.537" width="151.802" height="36.5788" rx="18.2894" transform="rotate(-38.5799 85.3459 244.537)" fill="currentColor" />
        </svg>
    );
}

export const DEFAULT_HOME_LOGO: HomeLogoProps = {
    icon: <Logo/>,
    label: undefined,
    className: undefined,
    iconClassName: "text-2xl",
}

export interface HomeLogoProps {
    /** SVG o ReactNode del logo (obligatorio, no hay fallback) */
    icon: React.ReactNode
    /** Texto opcional a la derecha del icono */
    label?: React.ReactNode
    /** Clases para el <Link> contenedor */
    className?: string
    /** Clases para el contenedor del icono (tamaño/color) */
    iconClassName?: string
}

export function HomeLogo({ icon, label, className, iconClassName }: HomeLogoProps) {
    return (
        <Link
            href="/"
            className={cn(
                "flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors",
                className
            )}
            aria-label={label ? `Ir al inicio (${String(label)})` : "Ir al inicio"}
        >
      <span className={cn("text-2xl", iconClassName)} aria-hidden>
        {icon}
      </span>
            {label ? (
                <span className="hidden sm:inline font-bold text-xl">{label}</span>
            ) : null}
        </Link>
    )
}