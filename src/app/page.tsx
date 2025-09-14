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
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        {/* logo con href al home */}
                    </div>
                </header>
                <div className="p-4">
                    <ProductGrid products={products} cols={4} />
                </div>
                {/*<div className="flex flex-1 flex-col gap-4 p-4 pt-0">*/}
                {/*    <div className="grid auto-rows-min gap-4 md:grid-cols-3">*/}
                {/*        <ProductGrid products={products} cols={3} />*/}
                {/*    </div>*/}
                {/*    <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />*/}
                {/*</div>*/}
            </SidebarInset>
        </SidebarProvider>
    )
}
