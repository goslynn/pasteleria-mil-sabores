'use client'

import Link from "next/link"
import {UserMenu, UserMenuProps} from "@/components/ui/user-menu";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {getCurrentUser} from "@/lib/datamapping";
import {UsuarioDTO} from "@/types/user";

function RenderUserMenu({
                                   userName,
                                   userEmail,
                                   userAvatar,
                                   loginHref = "/#",
                                   items = [],
                               }: UserMenuProps) {
    // Caso sin sesion, mostramos un boton de login.
    if (!userName?.trim() || !userEmail?.trim()) {
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
        <UserMenu
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            items={items}
        />
    );
}

/**
 * Isla cliente que resuelve la sesión en runtime (CSR).
 * - Llama a /api/session con credentials: 'include'
 * - Si hay user, pasa props a AppUserMenu
 * - Si no hay, AppUserMenu muestra el botón de login
 */
export default function AppUserMenu(props: Partial<UserMenuProps>) {
    const user = useUsuarioActual();
    return (
        <RenderUserMenu
            userName={user?.nombre}
            userEmail={user?.email}
            loginHref={props.loginHref}
            items={props.items}
        />
    );
}

export function useUsuarioActual() {
    const [user, setUser] = useState<UsuarioDTO | null>(null)

    useEffect(() => {
        let isMounted = true

        async function loadUser() {
            try {
                const usuario = await getCurrentUser()
                if (isMounted) setUser(usuario)
            } catch (e) {
                console.error('Error cargando usuario actual:', e)
                if (isMounted) setUser(null)
            }
        }

        loadUser()

        return () => { isMounted = false }
    }, [])

    return user
}
