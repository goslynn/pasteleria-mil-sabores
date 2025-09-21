'use client'

import Link from "next/link"
import {UserMenuDropdown} from "@/components/ui/user-menu-dropdown";
import {Button} from "@/components/ui/button";
import {apiFetch} from "@/lib/fetching";

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
        <UserMenuDropdown
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            items={items}
            variant={"withlogout"}
            onLogoutClick={async () => {
                try {
                    const res = await apiFetch('/api/session', {method: 'DELETE'})
                    console.log("response logout: ",res)
                    window.location.href = "/auth/login"
                } catch (e) {
                    console.error("Error cerrando sesion : ",e)
                    alert("Error cerrando sesión")
                }

            }
            }
        />
    );
}
