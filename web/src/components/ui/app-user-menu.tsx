import Link from "next/link"
import {UserMenu, UserMenuProps} from "@/components/ui/user-menu";
import {Button} from "@/components/ui/button";


export const DEFAULT_USER_MENU: UserMenuProps = {
    userName: undefined,
    userEmail: undefined,
    userAvatar: undefined,
    loginHref: '/login',
    items: [],
}

export function AppUserMenu({
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
        <UserMenu
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            items={items}
        />
    );
}
