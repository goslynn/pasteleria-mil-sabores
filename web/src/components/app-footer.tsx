import {Footer, FooterProps} from "@/components/ui/footer";
import {FooterDTO} from "@/types/page-types";
import {FOOTER_ID, HOME_URL} from "@/app/const";
import {fetchFooter} from "@/lib/datamapping";
import {brand} from "@/lib/brand";


export const revalidate = 300;

export default async function AppFooter() {
    const empresa = await brand();
    console.log("empresa (brand): ", empresa);

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
                owner: empresa?.name || "Pasteleria Mil Sabores",
            },
            brand: {
                name: empresa?.name || "Pasteleria Mil Sabores",
                logo: empresa?.icon,
                href: HOME_URL
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
        <div className="bg-accent text-accent-foreground w-full">
            <Footer {...footerData} />
        </div>
    )
}