import { Navbar } from '@/components/ui/navbar'
import type { NavbarProps } from '@/components/ui/navbar'
import { CakeSlice } from 'lucide-react'
import {UsuarioDTO} from "@/types/user";
import {getCurrentUser} from "@/lib/datamapping";

const user : UsuarioDTO | null = await getCurrentUser();

const NAVBAR_PROPS: NavbarProps = {
    homeLogo: {
        icon: <CakeSlice />,
        label: 'Mil Sabores'
    },
    userMenu: {
        userName: user?.nombre,
        userEmail: user?.email,
        loginHref: 'auth/login'
    },
    navigationLinks: [
        { href: '/', label: 'Inicio'},
        { href: '/categories', label: 'Categorias' },
        { href: '/about', label: 'Sobre nosotros' },
        { href: '/contact', label: 'Contacto' },
    ]
}

export function AppNavbar() {
    console.log("User in Navbar:");
    console.log(user);
    console.log("NAVBAR_PROPS:");
    console.log(NAVBAR_PROPS);
    return <Navbar {...NAVBAR_PROPS} />
}
