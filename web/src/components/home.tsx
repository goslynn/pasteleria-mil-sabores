import ProductGrid from "@/components/ui/product-grid";
import {ProductDTO} from "@/types/product";
import {fetchProducts} from "@/lib/datamapping";
import {ProductCardProps} from "@/components/ui/product-card";
import {normalizeStrapiUrl} from "@/types/strapi/common";
import {FALLBACK_IMG} from "@/app/const";



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

        </>
    )
}