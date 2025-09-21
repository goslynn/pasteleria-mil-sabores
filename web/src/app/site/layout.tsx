import React from "react";
import {AppNavbar} from "@/components/app-navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AppNavbar />
            <main className="min-h-dvh">{children}</main>
        </>
    );
}