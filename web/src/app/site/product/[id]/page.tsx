import {Separator} from "@/components/ui/separator";
import ProductDetailCard from "@/components/ui/product-detail";
import ProductCarousel, {ProductSliderProps} from "@/components/ui/product-carousel";
import {toProductCard, toProductDetail} from "@/lib/datamapping";
import {getProductWithRelated} from "@/app/services/product.service";



interface ProductPageProps {
    params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;


    const resp = await getProductWithRelated(id, 4)

    const pd = resp?.product;
    if (!pd) {
        return (
            <div className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <div className="bg-muted rounded-2xl border border-border shadow-md overflow-hidden">
                    <div className="min-h-[70vh] grid place-items-center p-4 sm:p-6 md:p-8">
                        <p>Producto no encontrado</p>
                    </div>
                </div>
            </div>
        );
    }
    const related = resp?.related || [];

    const sliderProps : ProductSliderProps = {
        title: "Productos Relacionados.",
        items: related.map(toProductCard)
    }

    console.log("sliderProps:", sliderProps);

    return (
        <div className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            {/* Card contenedor */}
            <div className="bg-muted rounded-2xl border border-border shadow-md overflow-hidden">

                <div className="min-h-[70vh] grid place-items-center p-4 sm:p-6 md:p-8">
                    <ProductDetailCard product={toProductDetail(pd)} />
                </div>

                <Separator />

                <div className="p-4 sm:p-6 md:p-8 space-y-10">
                    {related.length > 0 && (
                        <div className="rounded-xl border border-border py-6 px-12 bg-background/60">
                            <ProductCarousel {...sliderProps} columnsPreset="1-2-3-4" spacing="normal"/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}





