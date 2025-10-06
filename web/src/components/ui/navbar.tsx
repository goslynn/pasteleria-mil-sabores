'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { HamburgerIcon } from '@/components/ui/hamburger-icon'
import {useIsMobile} from "@/hooks/use-mobile";
import {Link as ILink} from "@/types/general";
import {usePathname} from "next/navigation";
import {NavigationMenu, NavigationMenuItem, NavigationMenuList} from "@/components/ui/navigation-menu";
import Link from "next/link";


type AnyProps = Record<string, unknown>
type Cmp<T extends AnyProps = AnyProps> = React.ComponentType<T>
type ElOf<T extends Cmp> = React.ReactElement<React.ComponentProps<T>, T>

function isElementOfType<T extends Cmp>(
    node: React.ReactNode,
    type: T,
): node is ElOf<T> {
    return React.isValidElement(node) && node.type === type
}

function pickOneChildOfType<T extends Cmp>(
    children: React.ReactNode,
    type: T,
): ElOf<T> | undefined {
    return React.Children.toArray(children).find((c) => isElementOfType(c, type)) as
        | ElOf<T>
        | undefined
}

function pickAllChildrenOfType<T extends Cmp>(
    children: React.ReactNode,
    type: T,
): ElOf<T>[] {
    return React.Children.toArray(children).filter((c) => isElementOfType(c, type)) as ElOf<T>[]
}

/** ─────────────────────────────────────────────────────────────
 *  Slots (compound components)
 *  ────────────────────────────────────────────────────────────*/
type SlotProps = { children?: React.ReactNode; className?: string }

const IconSlot: React.FC<SlotProps> = ({ children }) => <>{children}</>
IconSlot.displayName = 'Navbar.Icon'

const SearchSlot: React.FC<SlotProps> = ({ children }) => <>{children}</>
SearchSlot.displayName = 'Navbar.Search'

const ActionsSlot: React.FC<SlotProps> = ({ children }) => <>{children}</>
ActionsSlot.displayName = 'Navbar.Actions'

/** Barra de navegación inferior (links, menús, etc.) */
const BottomSlot: React.FC<SlotProps> = ({ children }) => <>{children}</>
BottomSlot.displayName = 'Navbar.Bottom'

export type NavbarProps = React.HTMLAttributes<HTMLElement>

interface NavbarCompound extends React.FC<NavbarProps> {
    Icon: typeof IconSlot
    Search: typeof SearchSlot
    Actions: typeof ActionsSlot
    Bottom: typeof BottomSlot
}

export const Navbar: NavbarCompound = ({ className, children, ...props }: NavbarProps) => {
    const isMobile = useIsMobile()

    // Extrae slots desde children (tipado seguro)
    const Icon = pickOneChildOfType(children, IconSlot)
    const Search = pickOneChildOfType(children, SearchSlot)
    const Actions = pickOneChildOfType(children, ActionsSlot)
    const BottomAll = pickAllChildrenOfType(children, BottomSlot)

    // Puedes permitir múltiples <Navbar.Bottom/>; los unimos
    const Bottom = BottomAll.length ? (
        <>
            {BottomAll.map((b, i) => (
                <React.Fragment key={i}>{b}</React.Fragment>
            ))}
        </>
    ) : null

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b border-border bg-background text-foreground px-4 md:px-6 [&_a]:no-underline',
                className,
            )}
            {...props}
        >
            <div className="container mx-auto max-w-screen-2xl">
                {/* Sección superior */}
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Izquierda */}
                    <div className="flex flex-1 items-center gap-2">
                        {/* Hamburguesa (mobile) - muestra la barra inferior en popover */}
                        {isMobile && Bottom && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        className="group h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Abrir menú"
                                        type="button"
                                    >
                                        <HamburgerIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-64 p-1">
                                    {/* El contenido real de navegación lo aporta el caller dentro de <Navbar.Bottom/> */}
                                    {Bottom}
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* Icono / marca (inyectado) */}
                        {Icon ?? null}
                    </div>

                    {/* Centro: búsqueda (inyectado) */}
                    <div className="grow">{Search ?? null}</div>

                    {/* Derecha: acciones (inyectado) */}
                    <div className="flex flex-1 items-center justify-end gap-2">{Actions ?? null}</div>
                </div>

                {/* Desktop: barra inferior visible */}
                {!isMobile && Bottom && <div className="py-2">{Bottom}</div>}
            </div>
        </header>
    )
}

export function NavigationLinks({ links }: { links: ILink[] }) {
    const pathname = usePathname()

    // clases iguales a las que tenías antes
    const desktopBtn =
        'inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-1.5 text-sm font-medium ' +
        'bg-transparent text-muted-foreground hover:text-foreground transition-colors ' +
        'focus:bg-transparent focus-visible:outline-none'

    const mobileBtn =
        'flex w-full justify-start rounded-md px-3 py-2 text-sm font-medium ' +
        'bg-transparent text-muted-foreground hover:text-foreground transition-colors ' +
        'focus:bg-transparent focus-visible:outline-none'

    // MOBILE (popover) — solo visible < md
    const MobileList = (
        <NavigationMenu className="max-w-none md:hidden">
            <NavigationMenuList className="flex-col items-start gap-0">
                {links.map((link, idx) => {
                    const href = link.link ?? '#'
                    const isActive = !!link.link && pathname === href
                    return (
                        <NavigationMenuItem key={href ?? `${link.label}-${idx}`} className="w-full">
                            <Button
                                asChild
                                variant="ghost"
                                className={`${mobileBtn} ${isActive ? 'text-foreground font-semibold' : ''}`}
                            >
                                <Link href={href} prefetch={false} aria-current={isActive ? 'page' : undefined}>
                                    {link.label}
                                </Link>
                            </Button>
                        </NavigationMenuItem>
                    )
                })}
            </NavigationMenuList>
        </NavigationMenu>
    )

    // DESKTOP (barra inferior) — solo visible ≥ md
    const DesktopList = (
        <div className="hidden md:block py-2">
            <NavigationMenu>
                <NavigationMenuList className="gap-2">
                    {links.map((link, idx) => {
                        const href = link.link ?? '#'
                        const isActive = !!link.link && pathname === href
                        return (
                            <NavigationMenuItem key={href ?? `${link.label}-${idx}`}>
                                <Button
                                    asChild
                                    variant="ghost"
                                    className={`${desktopBtn} ${isActive ? 'text-foreground font-semibold' : ''}`}
                                >
                                    <Link href={href} prefetch={false} aria-current={isActive ? 'page' : undefined}>
                                        {link.label}
                                    </Link>
                                </Button>
                            </NavigationMenuItem>
                        )
                    })}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )

    return (
        <>
            {MobileList}
            {DesktopList}
        </>
    )
}


Navbar.Icon = IconSlot
Navbar.Search = SearchSlot
Navbar.Actions = ActionsSlot
Navbar.Bottom = BottomSlot
