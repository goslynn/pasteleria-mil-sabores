import { Navbar } from '@/components/ui/navbar'
import type { NavbarProps } from '@/components/ui/navbar'
import { CakeSlice } from 'lucide-react'
import { UsuarioDTO } from "@/types/user";
import { getCurrentUser } from "@/lib/datamapping";
import { FOOTER_ID, HOME_URL } from "@/app/const";
import { redirect } from "next/navigation";

export async function AppNavbar() {
    const user: UsuarioDTO | null = await getCurrentUser();
    const footerRef = `#${FOOTER_ID}`;

    // ✅ Server Action declarada directamente aquí
    async function searchAction(formData: FormData) {
        "use server"; // necesario para que Next la trate como Server Action
        const q = (formData.get("q") ?? "").toString().trim();
        const page = "1";
        if (q.length > 0) {
            redirect(`/site/product?q=${encodeURIComponent(q)}&page=${page}`);
        }
    }

    const NAVBAR_PROPS: NavbarProps = {
        homeLogo: { icon: <CakeSlice />, label: "Mil Sabores" },
        userMenu: {
            userName: user?.nombre,
            userEmail: user?.email,
            loginHref: "auth/login",
            items: [
                { key: "config", label: "Ajustes", href: "/site/config" },
                {
                    key: "logout",
                    label: "Cerrar sesion",
                    href: "/auth/logout",
                    destructive: true,
                    separatorAbove: true,
                },
            ],
        },
        navigationLinks: [
            { href: HOME_URL, label: "Inicio" },
            { href: "/site/categories", label: "Categorias" },
            { href: "/site/about", label: "Sobre nosotros" },
            { href: footerRef, label: "Contacto" },
        ],
        cart: { link: "/site/carrito" },

        // ❌ ya no usamos onSearchSubmit
        // ✅ pasamos la Server Action al SearchBar
        searchBarProps: {
            action: searchAction,
        },
    };

    return <Navbar {...NAVBAR_PROPS} className="brand-scope" />;
}
