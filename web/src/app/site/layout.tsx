import React from "react";
import {AppNavbar} from "@/components/app-navbar";
import AppFooter from "@/components/app-footer";
import {CartProvider} from "@/hooks/cart-context";
import {searchAction} from "@/app/site/actions";

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const prerender = false

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <CartProvider>
            <AppNavbar searchAction={searchAction}/>
                <main className="min-h-dvh">{children}</main>
            </CartProvider>
            <AppFooter/>
        </>

    );
}