'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import type { NavbarProps } from '@/components/ui/navbar'
import { CakeSlice } from 'lucide-react'

type HidePattern = string | RegExp

export interface AppNavbarProps {
    /** Rutas donde NO quieres mostrar el navbar.
     *  - string: coincidencia exacta
     *  - RegExp: patrón (p.ej. /^\/auth(\/|$)/ )
     *  Si es undefined, null o [], NO se oculta. */
    hideOn?: HidePattern | HidePattern[] | null
}

// Props canónicas (sin defaults de ocultado)
const NAVBAR_PROPS_GUEST: NavbarProps = {
    homeLogo: {
        icon: <CakeSlice />,
        label: 'Mil Sabores'
    },
    userMenu: {
        loginHref: '/login'
    },
    navigationLinks: [
        { href: '/', label: 'Inicio', active: true },
        { href: '/categories', label: 'Categorias' },
        { href: '/about', label: 'Sobre nosotros' },
        { href: '/contact', label: 'Contacto' },
    ],
    onNavItemClick: (href) => console.log('Ir a:', href),
    onSearchSubmit: (q) => console.log('Buscar:', q),
}

export function AppNavbar({ hideOn }: AppNavbarProps) {
    const pathname = usePathname()

    // normaliza: undefined/null => [], string => [string]
    const patterns: HidePattern[] =
        hideOn == null ? [] : Array.isArray(hideOn) ? hideOn : [hideOn]

    const shouldHide =
        patterns.length > 0 &&
        patterns.some((p) =>
            typeof p === 'string' ? p === pathname : p.test(pathname)
        )

    if (shouldHide) return null
    return <Navbar {...NAVBAR_PROPS_GUEST} />
}
