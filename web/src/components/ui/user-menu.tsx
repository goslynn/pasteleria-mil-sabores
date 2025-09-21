// components/user-menu-server.tsx  (Server Component - sin "use client")
import Link from "next/link"
import {UserDropdownMenu} from "@/components/ui/user-dropdown-menu";
import {Button} from "@/components/ui/button";


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
    items: [],
}

export function UserMenu({
                                   userName,
                                   userEmail,
                                   userAvatar,
                                   loginHref = "/#",
                                   items = [],
                               }: UserMenuProps) {
    // Caso sin sesion, mostramos un boton de login.
    if (!userName?.trim()) {
        return (
            <Button asChild>
                <Link
                    href={loginHref}
                    prefetch={false}
                >
                    Ingresa
                </Link>
            </Button>
        )
    }

    // Caso con sesion mostramos icono de usuario con menu.
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
