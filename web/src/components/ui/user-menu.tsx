// components/user-menu-server.tsx  (Server Component - sin "use client")
import Link from "next/link"
import { ChevronDownIcon } from "lucide-react"
import {UserDropdownMenu} from "@/components/ui/user-dropdown-menu";


export type UserMenuItem = {
    key: string
    label: string
    href?: string
    destructive?: boolean
    separatorAbove?: boolean
}

export interface UserMenuProps {
    /** Nombre visible del usuario (si falta => se asume no hay sesión) */
    userName?: string
    /** Email del usuario */
    userEmail?: string
    /** URL de la imagen del avatar */
    userAvatar?: string
    /** Ruta al registro (solo cuando no hay sesión) */
    registerHref?: string
    /** Ruta al login (solo cuando no hay sesión) */
    loginHref?: string
    /** Items extra que aparecerán en el menú (cuando hay sesión).
     * El item de logout se agrega automáticamente si no lo pasas. */
    items?: UserMenuItem[]
}

export const DEFAULT_USER_MENU: UserMenuProps = {
    userName: undefined,
    userEmail: undefined,
    userAvatar: undefined,
    loginHref: '/login',
    registerHref: '/signup',
    items: [],
}

export function UserMenu({
                                   userName,
                                   userEmail,
                                   userAvatar,
                                   registerHref = "/registro",
                                   loginHref = "/login",
                                   items = [],
                               }: UserMenuProps) {
    // SIN sesión → split button server (solo <Link>)
    if (!userName?.trim()) {
        return (
            <div className="flex">
                <Link
                    href={registerHref}
                    prefetch={false}
                    className="h-9 px-3 inline-flex items-center justify-center rounded-l-md bg-primary text-primary-foreground font-semibold"
                >
                    Registrarse
                </Link>

                {/* La flecha y el dropdown son la "isla" client */}
                <UserDropdownMenu
                    trigger={
                        <button
                            className="h-9 px-2 rounded-r-md border border-l-0 inline-flex items-center justify-center"
                            aria-label="Más opciones"
                            type="button"
                        >
                            <ChevronDownIcon className="h-4 w-4" />
                        </button>
                    }
                    items={[
                        { key: "login", label: "Iniciar sesión", href: loginHref }
                    ]}
                />
            </div>
        )
    }

    // CON sesión → el trigger + lista se resuelven en la isla client
    return (
        <UserDropdownMenu
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            items={[
                ...items,
                { key: "logout", label: "Cerrar sesión", href: "/logout", destructive: true }
            ]}
        />
    )
}
