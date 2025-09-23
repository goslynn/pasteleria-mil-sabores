import {ProductCard, ProductCardProps} from "@/components/ui/product-card";
import React from "react";
import {cn} from "@/lib/utils";

type ProductGridProps = {
    products: ProductCardProps[]
    cols?: number       // máximo de columnas
    minCardPx?: number  // ancho mínimo de cada tarjeta
    gapPx?: number
    className? : string
}

export function ProductGrid({
                                products,
                                cols = 4,
                                minCardPx = 280,
                                gapPx = 24,
                                className,
                            }: ProductGridProps) {

    const maxWidth = `calc(${cols} * ${minCardPx}px + ${(cols - 1)} * ${gapPx}px)`

    return (
        <div
            className={cn("grid mx-auto justify-items-center", className)}
            style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(${minCardPx}px, 1fr))`,
                gap: gapPx,
                maxWidth,
                width: "100%",
            }}
        >
            {products.map((p) => (
                <ProductCard
                    key={p.id}
                    {...p}
                    className="w-full max-w-[280px]"
                />
            ))}
        </div>
    )
}


export default ProductGrid;
