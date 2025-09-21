import {ProductData} from "@/types/product";
import {ProductGrid} from "@/components/ui/product-grid";
import {fetchProducts} from "@/lib/datamapping";

// const products: ProductData[] = await fetchProducts();

export default function HomePage() {

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
                <ProductGrid products={[]} cols={3} minCardPx={280} gapPx={24} />
            </main>
        </>
    )
}
