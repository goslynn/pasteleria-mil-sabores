import {ProductDetailResponse} from "@/app/api/product/types";
import {Separator} from "@/components/ui/separator";
import {nextApi} from "@/lib/fetching";
import ProductDetailCard from "@/components/ui/product-detail";
import ProductSlider, {ProductSliderProps} from "@/components/ui/product-slider";
import {toProductCard, toProductDetail} from "@/lib/datamapping";


interface ProductPageProps {
    params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    console.log("ProductPage id:", id);
    const resp = await nextApi.get<ProductDetailResponse>(`api/product/${id}?related=4`);

    const pd = resp.data?.product;
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
    const related = resp.data?.related || [];

    const sliderProps : ProductSliderProps = {
        title: "Productos Relacionados.",
        items: related.map(toProductCard)
    }

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
                        <div className="rounded-xl border border-border p-6 bg-background/60">
                            <ProductSlider {...sliderProps} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}





