import ProductGrid from "@/components/ui/product-grid";
import {ProductDTO} from "@/types/product";
import {fetchAboutPage, fetchFooter, fetchProducts} from "@/lib/datamapping";
import {ProductCardProps} from "@/components/ui/product-card";
import {normalizeStrapiUrl} from "@/types/strapi/common";
import {Footer, FooterProps} from "@/components/ui/footer";
import {FALLBACK_IMG, FOOTER_ID} from "@/app/const";
import {FooterDTO} from "@/types/page-types";

// const footerDemo: FooterProps = {
//     "id": "footer-demo",
//     "brand": {
//         "name": "Pastelería Mil Sabores",
//         "logoUrl": "/logo.png",
//         "href": "/"
//     },
//     "sections": [
//         {
//             "title": "Contacto",
//             "links": [
//                 {
//                     "label": "Escríbenos",
//                     "link": "mailto:contacto@pasteleriams.cl",
//                     "external": true
//                 },
//                 {
//                     "label": "Llámanos",
//                     "link": "tel:+56912345678",
//                     "external": true
//                 }
//             ]
//         },
//         {
//             "title": "Enlaces rápidos",
//             "links": [
//                 { "label": "Inicio", "link": "/", "external": false },
//                 { "label": "Productos", "link": "/categories", "external": false },
//                 { "label": "Sobre nosotros", "link": "/about", "external": false }
//             ]
//         },
//         {
//             "title": "Legal",
//             "links": [
//                 { "label": "Términos y Condiciones", "link": "/terms", "external": false },
//                 { "label": "Política de Privacidad", "link": "/privacy", "external": false }
//             ]
//         }
//     ],
//     "socials": [
//         { "kind": "facebook", "link": "https://facebook.com/pasteleriams", "label": "Facebook", "external": true },
//         { "kind": "instagram", "link": "https://instagram.com/pasteleriams", "label": "Instagram", "external": true },
//         { "kind": "github", "link": "https://github.com/pasteleriams", "label": "GitHub", "external": true },
//         { "kind": "whatsapp", "link": "https://wa.me/56912345678", "label": "WhatsApp", "external": true }
//     ],
//     "copyright": {
//         "owner": "Pastelería Mil Sabores",
//         "year": "auto",
//         "textPrefix": "©"
//     }
// }



export async function HomePage() {
    const toProductCard = (dto: ProductDTO): ProductCardProps => {
        let img : string;
        if (!dto.images?.[0]?.url) {
            img = FALLBACK_IMG;
        } else {
            img = normalizeStrapiUrl(dto.images?.[0]?.url);
        }
        return {
            category: dto?.category?.name,
            id: dto.documentId,
            imageUrl: img,
            name: dto.name,
            price: dto.price,
            href: "#"
        }
    }

    const cards = await fetchProducts( {
        "fields[0]": "code",
        "fields[1]": "name",
        "fields[2]": "price",
        "fields[3]": "description",
        "populate[category][fields][0]": "name",
        "populate[images][fields][0]": "url",
        "populate[images][fields][1]": "formats",
        "pagination[pageSize]": "100",
        "publicationState": "live"
    }, toProductCard);

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

    const aboutPage = await fetchAboutPage();
    console.log("about", aboutPage);



    console.log("pie" ,footerData);
    return (
        <>
            <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
                {/* Título / Hero simple opcional */}
                <section className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Nuestros productos</h1>
                    <p className="text-muted-foreground">
                        Endúlzate con nuestras tortas, postres y clásicos de la casa.
                    </p>
                </section>
                <div className="p-6 sm:p-8 md:p-10 flex justify-center">
                    <div className="w-full max-w-6xl bg-muted rounded-2xl shadow-md ring-1 ring-border p-4 sm:p-6 md:p-8">
                        <ProductGrid products={cards} cols={3} minCardPx={280} gapPx={24} className={"brand-scope"}/>
                    </div>
                </div>
            </main>
            <div className="bg-primary text-primary-foreground w-full">
                <Footer {...footerData} />
            </div>
        </>
    )
}