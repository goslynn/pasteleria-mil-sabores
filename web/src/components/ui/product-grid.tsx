import {ProductCard, ProductCardProps} from "@/components/ui/product-card";
import React from "react";

type ProductGridProps = {
    products: ProductCardProps[]
    cols?: number       // máximo de columnas
    minCardPx?: number  // ancho mínimo de cada tarjeta
    gapPx?: number
}

export function ProductGrid({
                                products,
                                cols = 4,
                                minCardPx = 280,
                                gapPx = 24,
                            }: ProductGridProps) {
    const maxWidth = `calc(${cols} * ${minCardPx}px + ${(cols - 1)} * ${gapPx}px)`

    return (
        <div
            className="grid mx-auto justify-items-center"
            style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(${minCardPx}px, 1fr))`,
                gap: gapPx,
                maxWidth,
                width: "100%",
            }}
        >
            {products.map((p) => (
                <ProductCard
                    key={p.product.id}
                    product={p.product}
                    className="w-full max-w-[280px]"
                />
            ))}
        </div>
    )
}


export default ProductGrid;
