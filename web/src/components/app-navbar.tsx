import { Navbar } from '@/components/ui/navbar'
import type { NavbarProps } from '@/components/ui/navbar'
import { CakeSlice } from 'lucide-react'
import {UsuarioDTO} from "@/types/user";
import {getCurrentUser} from "@/lib/datamapping";
import {FOOTER_ID} from "@/app/const";



export async function AppNavbar() {
    const user: UsuarioDTO | null = await getCurrentUser();
    const footerRef = `#${FOOTER_ID}`;
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
            { href: '/categories', label: 'Categorias' },
            { href: '/site/about', label: 'Sobre nosotros' },
            { href: footerRef , label: 'Contacto' },
        ],
        cart: {
            link: "/site/cart"
        }
    };

    return <Navbar {...NAVBAR_PROPS} />;
}
