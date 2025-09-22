import { Navbar } from '@/components/ui/navbar'
import type { NavbarProps } from '@/components/ui/navbar'
import { CakeSlice } from 'lucide-react'
import {UsuarioDTO} from "@/types/user";
import {getCurrentUser} from "@/lib/datamapping";

export async function AppNavbar() {
    const user: UsuarioDTO | null = await getCurrentUser();
    const NAVBAR_PROPS: NavbarProps = {
        homeLogo: { icon: <CakeSlice/>, label: 'Mil Sabores' },
        userMenu: {
            userName: user?.nombre,
            userEmail: user?.email,
            loginHref: 'auth/login',
            items: [{key: "config", label: "Ajustes", href: "/site/config"},
                {key: "logout", label: "Cerrar sesion", href: "/auth/logout", destructive: true, separatorAbove: true}],
        },
        navigationLinks: [
            { href: '/', label: 'Inicio' },
            { href: '/categories', label: 'Categorias' },
            { href: '/about', label: 'Sobre nosotros' },
            { href: '/contact', label: 'Contacto' },
        ],
    };

    return <Navbar {...NAVBAR_PROPS} />;
}
