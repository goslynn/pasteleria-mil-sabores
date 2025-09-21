import React from "react";
import {AppNavbar} from "@/components/app-navbar";
import {getCurrentUser} from "@/lib/datamapping";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();
    return (
        <>
            <AppNavbar user={user}/>
            <main className="min-h-dvh">{children}</main>
        </>
    );
}