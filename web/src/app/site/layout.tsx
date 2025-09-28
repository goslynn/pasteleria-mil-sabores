import React from "react";
import {AppNavbar} from "@/components/app-navbar";
import AppFooter from "@/components/app-footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppNavbar/>
            <main className="min-h-dvh">{children}</main>
            <AppFooter/>
        </>

    );
}