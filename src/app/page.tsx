"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {ProductData} from "@/types/product";
import {ProductGrid} from "@/components/ui/product-grid";


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
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4"/>
                        {/* logo con href al home */}
                    </div>
                </header>

                {/* Contenedor visual principal */}
                <div className="p-6 sm:p-8 md:p-10 flex justify-center">
                    <div className="w-full max-w-6xl bg-chart-5 rounded-2xl shadow-md ring-1 ring-rose-200/40 p-4 sm:p-6 md:p-8">
                        {/* Grid responsivo limitado por cols */}
                        <ProductGrid products={products} cols={3} minCardPx={280} gapPx={24} />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
