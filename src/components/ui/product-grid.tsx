import {ProductData} from "@/types/product";
import {ProductCard} from "@/components/ui/product-card";
import React from "react";



type ProductGridProps = {
    products: ProductData[]
    cols?: number
    minCardPx?: number
    gapPx?: number
}

export function ProductGrid({
                                products,
                                cols = 4,
                                minCardPx = 280,
                                gapPx = 24,
                            }: ProductGridProps) {
    // Cálculo para que en pantallas grandes nunca supere "cols" columnas:
    //   maxWidth = cols * minCardPx + (cols-1) * gap
    const maxWidth = `calc(${cols} * ${minCardPx}px + ${(cols - 1)} * ${gapPx}px)`

    return (
        <div
            className="grid mx-auto place-content-center"
            style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minCardPx}px, 1fr))`, gap: gapPx }}
        >
            {products.map(p => <ProductCard key={p.id} product={p} className={"mx-auto place-content-center"} />)}
        </div>
    )
}

export default ProductGrid