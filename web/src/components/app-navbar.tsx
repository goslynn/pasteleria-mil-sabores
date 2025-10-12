'use client'

import { Navbar, NavigationLinks } from '@/components/ui/navbar'
import { CakeSlice } from 'lucide-react'
import { FOOTER_ID, HOME_URL } from '@/app/const'
import { HomeLogo } from '@/components/ui/home-logo'
import { SearchBar } from '@/components/ui/search-bar'
import AppUserMenu from '@/components/ui/app-user-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { GoToCartButton } from '@/components/ui/goto-carrito-button'
import { Link } from '@/types/general'
import {UserMenuProps} from "@/components/ui/user-menu";

type AppNavbarProps = {
    searchAction: (formData: FormData) => void | Promise<void>
}

export function AppNavbar({ searchAction }: AppNavbarProps) {
    if (!searchAction) throw new Error('AppNavbar requiere searchAction')

    const footerRef = `#${FOOTER_ID}`

    const enlaces: Link[] = [
        { link: HOME_URL, label: 'Inicio' },
        { link: '/site/categories', label: 'Categorias' },
        { link: '/site/about', label: 'Sobre nosotros' },
        { link: footerRef, label: 'Contacto' },
    ]

    const userMenuProps : UserMenuProps = {
        loginHref: "/auth/login",
        items: [
            { key: 'profile', label: "Perfil", href: "/site/config/"},
            { key: 'logout', label: "Cerrar sesión", href: "/auth/logout", destructive: true , separatorAbove: true}
        ]
    }

    return (
        <Navbar className="brand-scope">
            <Navbar.Icon>
                <HomeLogo icon={<CakeSlice />} label="Mil Sabores" />
            </Navbar.Icon>

            <Navbar.Search>
                {/* ahora sí le pasas la FUNCIÓN */}
                <SearchBar action={searchAction} />
            </Navbar.Search>

            <Navbar.Actions>
                <AppUserMenu {...userMenuProps} />
                <ThemeToggle />
                <GoToCartButton link="/site/carrito" />
            </Navbar.Actions>

            <Navbar.Bottom>
                <NavigationLinks links={enlaces} />
            </Navbar.Bottom>
        </Navbar>
    )
}
