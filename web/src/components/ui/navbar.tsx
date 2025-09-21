'use client'

import * as React from 'react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { HamburgerIcon } from '@/components/ui/hamburger-icon'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { DEFAULT_USER_MENU, UserMenu, type UserMenuProps } from '@/components/ui/user-menu'
import { DEFAULT_HOME_LOGO, HomeLogo, type HomeLogoProps } from '@/components/ui/home-logo'
import { SearchBar } from '@/components/ui/search-bar'

export interface NavbarNavItem {
    href?: string
    label: string
    active?: boolean
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    /** Props para el logo (usa HomeLogo). Puedes pasar solo lo que quieras sobreescribir */
    homeLogo?: Partial<HomeLogoProps>
    /** Props para el menú de usuario (usa UserMenu). Puedes pasar solo lo que quieras sobreescribir */
    userMenu?: Partial<UserMenuProps>
    /** Links de navegación principales */
    navigationLinks?: NavbarNavItem[]
    /** Placeholder del buscador */
    searchPlaceholder?: string
    /** Callbacks de interacción */
    onNavItemClick?: (href: string) => void
    onSearchSubmit?: (query: string) => void
}

function useIsMobile(ref: React.RefObject<HTMLElement | null>, breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const check = () => {
            const w = ref.current?.offsetWidth ?? 0
            setIsMobile(w < breakpoint)
        }
        check()
        const ro = new ResizeObserver(check)
        const el = ref.current
        if (el) ro.observe(el)
        return () => ro.disconnect()
    }, [ref, breakpoint])
    return isMobile
}

export function Navbar({
                           homeLogo,
                           userMenu,
                           navigationLinks = [],
                           searchPlaceholder = 'Buscar...',
                           onNavItemClick,
                           onSearchSubmit,
                           className,
                           ...props
                       }: NavbarProps) {
    // defaults seguros
    const mergedHomeLogo: HomeLogoProps = { ...DEFAULT_HOME_LOGO, ...(homeLogo ?? {}) }
    const mergedUserMenu: UserMenuProps = { ...DEFAULT_USER_MENU, ...(userMenu ?? {}) }

    const containerRef = useRef<HTMLElement | null>(null)
    const isMobile = useIsMobile(containerRef)

    const handleSearchSubmit = useCallback(
        (q: string) => {
            onSearchSubmit?.(q)
        },
        [onSearchSubmit]
    )

    return (
        <header
            ref={containerRef}
            className={cn(
                'sticky top-0 z-50 w-full border-b bg-background px-4 md:px-6 [&_a]:no-underline',
                className
            )}
            {...props}
        >
            <div className="container mx-auto max-w-screen-2xl">
                {/* Sección superior */}
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Izquierda */}
                    <div className="flex flex-1 items-center gap-2">
                        {/* Hamburguesa (mobile) */}
                        {isMobile && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        className="group h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Abrir menú"
                                        type="button"
                                    >
                                        <HamburgerIcon/>
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent align="start" className="w-64 p-1">
                                    <NavigationMenu className="max-w-none">
                                        <NavigationMenuList className="flex-col items-start gap-0">
                                            {navigationLinks.map((link, idx) => (
                                                <NavigationMenuItem
                                                    key={link.href ?? `${link.label}-${idx}`}
                                                    className="w-full"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            if (link.href) onNavItemClick?.(link.href)
                                                        }}
                                                        className={cn(
                                                            'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer',
                                                            link.active && 'bg-accent text-accent-foreground'
                                                        )}
                                                    >
                                                        {link.label}
                                                    </button>
                                                </NavigationMenuItem>
                                            ))}
                                        </NavigationMenuList>
                                    </NavigationMenu>
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* Logo (link a "/") */}
                        <HomeLogo
                            icon={mergedHomeLogo.icon}
                            label={mergedHomeLogo.label}
                            className={mergedHomeLogo.className}
                            iconClassName={mergedHomeLogo.iconClassName}
                        />
                    </div>

                    {/* Centro: búsqueda */}
                    <div className="grow">
                        <SearchBar placeholder={searchPlaceholder} onSubmit={handleSearchSubmit}/>
                    </div>

                    {/* Derecha: Carro (TODO) + Usuario + Tema */}
                    <div className="flex flex-1 items-center justify-end gap-2">
                        {/* TODO: Cart */}
                        <UserMenu
                            userName={mergedUserMenu.userName}
                            userEmail={mergedUserMenu.userEmail}
                            userAvatar={mergedUserMenu.userAvatar}
                            items={mergedUserMenu.items}
                            loginHref={mergedUserMenu.loginHref}
                        />
                        <ThemeToggle/>
                    </div>
                </div>

                {/* Navegación inferior (desktop) */}
                {!isMobile && (
                    <div className="py-2">
                        <NavigationMenu>
                            <NavigationMenuList className="gap-2">
                                {navigationLinks.map((link, idx) => (
                                    <NavigationMenuItem key={link.href ?? `${link.label}-${idx}`}>
                                        <NavigationMenuLink
                                            href={link.href}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (link.href) onNavItemClick?.(link.href)
                                            }}
                                            className={cn(
                                                'text-muted-foreground hover:text-primary py-1.5 font-medium transition-colors cursor-pointer group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 text-sm focus:bg-accent focus:text-accent-foreground focus:outline-none',
                                                link.active && 'text-primary'
                                            )}
                                            data-active={link.active}
                                        >
                                            {link.label}
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                )}
            </div>
        </header>
    );
}
