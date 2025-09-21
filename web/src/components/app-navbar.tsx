import { Navbar } from '@/components/ui/navbar'
import type { NavbarProps } from '@/components/ui/navbar'
import { CakeSlice } from 'lucide-react'
import {UsuarioDTO} from "@/types/user";

export function AppNavbar({ user }: { user: UsuarioDTO | null }) {
    const NAVBAR_PROPS: NavbarProps = {
        homeLogo: { icon: <CakeSlice/>, label: 'Mil Sabores' },
        userMenu: {
            userName: user?.nombre,
            userEmail: user?.email,
            loginHref: 'auth/login',
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
