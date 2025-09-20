"use client";

import {ProductData} from "@/types/product";
import {ProductGrid} from "@/components/ui/product-grid";
import {fetchUserById} from "@/lib/datamapping";
import {useEffect} from "react";
import {nextFetch, strapiFetch} from "@/lib/fetching";
import {Navbar08} from "@/components/ui/navbar";

const base: ProductData = {
    id: 1,
    name: 'pastelito',
    description: "rico pastelito de los pibes",
    category: 'casero',
    imageUrl: 'https://picsum.photos/seed/1/640/480',
    price: { amount: 1990, currency: 'CLP', locale: 'es-CL' }
}
const products: ProductData[] = Array.from({ length: 9 }).map((_, i) => ({
    ...base,
    id: i + 1,
    name: `${base.name} ${i + 1}`,
    imageUrl: `https://picsum.photos/seed/${i + 1}/640/480`,
    discount: i % 3 === 0 ? { type: 'percentage', value: 20 } : undefined,
}))


export default function HomePage() {
    useEffect(() => {
        let canceled = false;

        (async () => {
            try {

                const { userId } = await nextFetch<{ userId: number | null }>("/api/session");

                if (!userId) {
                    console.log("[Home] Sin sesión.");
                    return;
                }

                const u = await fetchUserById(userId);
                if (!canceled) console.log("[Home] Usuario:", u);
            } catch (e) {
                if (!canceled) console.error("[Home] Error usuario:", e);
            }
            try {

                const { cat } = await strapiFetch<any>("/api/categories?populate=*");

                console.log(cat);
            } catch (e) {
                console.log(e);
            }
        })();

        return () => { canceled = true; };
    }, []);

    return (
        <>
            <Navbar08/>
            <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
                {/* Título / Hero simple opcional */}
                <section className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Nuestros productos</h1>
                    <p className="text-muted-foreground">
                        Endúlzate con nuestras tortas, postres y clásicos de la casa.
                    </p>
                </section>

                {/* Tu grilla de productos existente */}
                <ProductGrid products={products} cols={3} minCardPx={280} gapPx={24} />
            </main>
        </>
    )
}
