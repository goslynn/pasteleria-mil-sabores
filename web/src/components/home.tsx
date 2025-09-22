import ProductGrid from "@/components/ui/product-grid";
import {ProductCardDTO} from "@/types/product";
import {fetchProducts} from "@/lib/datamapping";
import {ProductCardProps} from "@/components/ui/product-card";
import {validateUrl} from "@/types/strapi/common";


export async function HomePage() {
    const productsDTO: ProductCardDTO[] = await fetchProducts();

    const p: ProductCardProps[] = productsDTO.map(dto => ({
        product: {
            id: dto.code,
            name: dto.name,
            category: dto.category?.name ?? "",
            imageUrl: validateUrl(dto.images?.[0]?.url),
            price: {
                amount: dto.price ?? 0,
                priceInCents: false,
                currency: "CLP",
                locale: "es-CL"
            }
        },
    }));


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

                {/* Tu grilla de productos existente */}
                <ProductGrid products={p} cols={3} minCardPx={280} gapPx={24}/>
            </main>
        </>
    )
}