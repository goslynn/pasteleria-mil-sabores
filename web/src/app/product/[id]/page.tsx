import ProductDetail from "@/components/ui/product-detail";
import {StrapiImageSource} from "@/components/ui/strapi-image";
import {BlocksContent} from "@strapi/blocks-react-renderer";
import {Separator} from "@/components/ui/separator";

const SAMPLE_PRODUCT = {
    id: 25,
    documentId: "tzczp7ofcyqu1mg4errdoa55",
    code: "PST-003",
    name: "Chocolate Avellanas",
    description: [
        {
            type: "paragraph",
            children: [
                {
                    type: "text",
                    text: "Bizcocho de cacao con ganache y crocante de avellanas.",
                },
            ],
        },
    ] as BlocksContent,
    price: 2390,
    images: null,
    category: {
        id: 4,
        documentId: "o0l4ehjay3cj7hv8c9n7wkph",
        name: "Pastelitos",
        slug: "pastelitos",
        description: null,
    },
    keyImage: {
        id: 1,
        documentId: "q6gkoploqbi65ggqe8ytx920",
        name: "pastel-chocolate-avellana_800x800.jpg",
        alternativeText: "Pastel de chocolate con avellanas",
        caption: null,
        width: 800,
        height: 800,
        formats: {
            thumbnail: {
                url: "/uploads/thumbnail_pastel_chocolate_avellana_800x800_e926ced46b.jpg",
                width: 156,
                height: 156,
            },
            small: {
                url: "/uploads/small_pastel_chocolate_avellana_800x800_e926ced46b.jpg",
                width: 500,
                height: 500,
            },
            medium: {
                url: "/uploads/medium_pastel_chocolate_avellana_800x800_e926ced46b.jpg",
                width: 750,
                height: 750,
            },
        },
        url: "/uploads/pastel_chocolate_avellana_800x800_e926ced46b.jpg",
    } as StrapiImageSource,
};

export default function Page() {
    return (
        <section
            className="
        mx-auto w-full max-w-6xl px-4 sm:px-6
        [--page-gap:theme(spacing.8)] lg:[--page-gap:theme(spacing.10)]
        mt-[var(--page-gap)] mb-[var(--page-gap)]
        scroll-mt-[var(--site-header,0px)]
      "
        >
            {/* Card contenedor */}
            <div className="bg-muted rounded-2xl border border-border shadow-md overflow-hidden">

                {/* ZONA 1: centrado perfecto respecto a viewport */}
                <div
                    className="grid place-items-center p-4 sm:p-6 md:p-8 ">
                    <ProductDetail product={SAMPLE_PRODUCT} />
                </div>

                <Separator/>

                {/* ZONA 2: extra dentro del mismo card (scroll normal) */}
                <div className="p-4 sm:p-6 md:p-8 space-y-10">
                    <div className="rounded-xl border border-border p-6 bg-background/60">
                        Productos relacionados (placeholder)
                    </div>
                    <div className="rounded-xl border border-border p-6 bg-background/60">
                        Opiniones (placeholder)
                    </div>
                </div>
            </div>
        </section>
    );
}





