'use client'

import * as React from 'react'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { HamburgerIcon } from '@/components/ui/hamburger-icon'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { DEFAULT_USER_MENU, AppUserMenu } from '@/components/ui/app-user-menu'
import { DEFAULT_HOME_LOGO, HomeLogo, type HomeLogoProps } from '@/components/ui/home-logo'
import {SearchBar, SearchBarProps} from '@/components/ui/search-bar'
import {usePathname} from "next/navigation";
import {UserMenuProps} from "@/components/ui/user-menu";
import {CartButton, CartButtonProps} from "@/components/ui/carrito-theme";

export interface NavbarNavItem {
    href?: string
    label: string
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    homeLogo?: Partial<HomeLogoProps>
    userMenu?: Partial<UserMenuProps>
    navigationLinks?: NavbarNavItem[]
    searchPlaceholder?: string
    searchBarProps : SearchBarProps
    cart: CartButtonProps;
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
                           searchBarProps,
                           cart,
                           className,
                           ...props
                       }: NavbarProps) {
    const mergedHomeLogo: HomeLogoProps = { ...DEFAULT_HOME_LOGO, ...(homeLogo ?? {}) }
    const mergedUserMenu: UserMenuProps = { ...DEFAULT_USER_MENU, ...(userMenu ?? {}) }

    const containerRef = useRef<HTMLElement | null>(null)
    const isMobile = useIsMobile(containerRef)
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const pathname = usePathname()

    // normalizo por si pasan "brandscope" sin guion
    const normalizedScope =
        typeof className === 'string' && className.includes('brandscope') && !className.includes('brand-scope')
            ? className.replace('brandscope', 'brand-scope')
            : className

    return (
        <header
            ref={containerRef}
            className={cn(
                // 👇 tokens para que el scope de marca funcione
                'sticky top-0 z-50 w-full border-b border-border bg-background text-foreground px-4 md:px-6 [&_a]:no-underline',
                normalizedScope // 👈 aquí puedes pasar "brand-scope" (o "brandscope") desde afuera
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

                                            {navigationLinks.map((link, idx) => {
                                                const isActive = mounted && !!link.href && pathname === link.href
                                                const mobileBtn =
                                                    'flex w-full justify-start rounded-md px-3 py-2 text-sm font-medium ' +
                                                    'bg-transparent text-muted-foreground hover:text-foreground transition-colors ' +
                                                    'focus:bg-transparent focus-visible:outline-none'

                                                return (
                                                    <NavigationMenuItem key={link.href ?? `${link.label}-${idx}`}
                                                                        className="w-full">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            className={`${mobileBtn} ${isActive ? 'text-foreground font-semibold' : ''}`}
                                                        >
                                                            <Link
                                                                href={link.href ?? '#'}
                                                                prefetch={false}
                                                                aria-current={isActive ? 'page' : undefined}
                                                            >
                                                                {link.label}
                                                            </Link>
                                                        </Button>
                                                    </NavigationMenuItem>
                                                )
                                            })}
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
                        <SearchBar {...searchBarProps}/>
                    </div>

                    {/* Derecha: Usuario + Tema */}
                    <div className="flex flex-1 items-center justify-end gap-2">
                        <AppUserMenu
                            userName={mergedUserMenu.userName}
                            userEmail={mergedUserMenu.userEmail}
                            userAvatar={mergedUserMenu.userAvatar}
                            items={mergedUserMenu.items}
                            loginHref={mergedUserMenu.loginHref}
                        />
                        <ThemeToggle/>
                        <CartButton {...cart}/>
                    </div>
                </div>

                {/* DESKTOP */}

                {!isMobile && (
                    <div className="py-2">
                        <NavigationMenu>
                            <NavigationMenuList className="gap-2">
                                {navigationLinks.map((link, idx) => {
                                    const isActive = mounted && !!link.href && pathname === link.href
                                    const desktopBtn =
                                        'inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-1.5 text-sm font-medium ' +
                                        'bg-transparent text-muted-foreground hover:text-foreground transition-colors ' +
                                        'focus:bg-transparent focus-visible:outline-none'

                                    return (
                                        <NavigationMenuItem key={link.href ?? `${link.label}-${idx}`}>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className={`${desktopBtn} ${isActive ? 'text-foreground font-semibold' : ''}`}
                                            >
                                                <Link
                                                    href={link.href ?? '#'}
                                                    prefetch={false}
                                                    aria-current={isActive ? 'page' : undefined}
                                                >
                                                    {link.label}
                                                </Link>
                                            </Button>
                                        </NavigationMenuItem>
                                    )
                                })}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                )}
            </div>
        </header>
    )
}
