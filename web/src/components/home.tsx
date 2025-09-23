import ProductGrid from "@/components/ui/product-grid";
import {ProductDTO} from "@/types/product";
import {fetchProducts} from "@/lib/datamapping";
import {ProductCardProps} from "@/components/ui/product-card";
import {normalizeStrapiUrl} from "@/types/strapi/common";


export async function HomePage() {
    const toProductCard = (dto: ProductDTO): ProductCardProps => {
        return {
            product: {
                id: dto.code,
                name: dto.name,
                category: dto.category?.name ?? "",
                imageUrl: normalizeStrapiUrl(dto.images?.[0]?.url),
                price: {
                    amount: dto.price ?? 0,
                    priceInCents: false,
                    currency: "CLP",
                    locale: "es-CL"
                }
            }
        }
    }

    const cards = await fetchProducts( {
        "fields[0]": "code",
        "fields[1]": "name",
        "fields[2]": "price",
        "fields[3]": "description",
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

                <ProductGrid products={cards} cols={3} minCardPx={280} gapPx={24}/>
            </main>
        </>
    )
}