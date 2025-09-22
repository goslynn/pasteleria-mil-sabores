import ProductGrid from "@/components/ui/product-grid";
import {ProductCardDTO} from "@/types/product";
import {fetchProducts} from "@/lib/datamapping";


export async function HomePage() {
    const products: ProductCardDTO[] = await fetchProducts();
    console.log("fetched strapi products", products);
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
                <ProductGrid products={[]} cols={3} minCardPx={280} gapPx={24}/>
            </main>
        </>
    )
}