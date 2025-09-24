import React from "react";
import {AppNavbar} from "@/components/app-navbar";
import {Footer, FooterProps} from "@/components/ui/footer";
import {fetchFooter} from "@/lib/datamapping";
import {FOOTER_ID} from "@/app/const";
import {FooterDTO} from "@/types/page-types";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const footerDefaults: FooterProps = {
        id: FOOTER_ID,
        copyright: {
            owner: "Pasteleria Mil Sabores",
        },
        sections: [],
        socials: []
    }

    const toFooterProps = (dto: FooterDTO): FooterProps => {
        return {
            id: FOOTER_ID,
            copyright: {
                owner: "Pasteleria Mil Sabores",
            },
            sections: dto.footer_sections,
            socials: dto.socials
        }
    }

    const footerFetched = await fetchFooter(toFooterProps)

    const footerData: FooterProps = {
        ...footerDefaults,
        ...(footerFetched ?? {})
    }
    return (
        <>
            <AppNavbar/>
            <main className="min-h-dvh">{children}</main>
            <div className="bg-primary text-primary-foreground w-full">
                <Footer {...footerData} />
            </div>
        </>

    );
}