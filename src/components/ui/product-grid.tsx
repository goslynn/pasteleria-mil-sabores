
import {ProductData} from "@/types/product";
import {cx} from "class-variance-authority";
import {ProductCard} from "@/components/ui/product-card";



function gridColsClass(cols: number) {
    return {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
    }[Math.min(6, Math.max(1, cols))]!
}


export function ProductGrid({ products, cols = 3, className }: { products: ProductData[]; cols?: number; className?: string }) {
    return (
        <div className={cx('grid auto-rows-min gap-4', gridColsClass(cols), className)}>
            {products.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    )
}