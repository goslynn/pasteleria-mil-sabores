import * as React from 'react';
import CategorySection, {CategoryItem} from "@/components/ui/category";
import {CategoryDTO} from "@/types/product"
import {QueryValue} from "@/lib/fetching";
import {fetchCategories} from "@/lib/datamapping";


export default async function CategoriesPage() {
    const toCategoryItem = (dto : CategoryDTO) : CategoryItem => {
        return {
            title: dto?.name,
            description: dto?.description,
            image: dto?.image,
            href: `/site/product?cat=${dto?.documentId}`
        }
    }
    const q: Record<string, QueryValue> = {
        "fields[0]": "documentId",
        "fields[1]": "name",
        "fields[2]": "description",
        "populate[image][fields][0]": "url",
        "populate[image][fields][1]": "formats",
    };

    const data = await fetchCategories(q, toCategoryItem)
    console.log("Categories page", data);
    return (
        <main className="container mx-auto p-6">
            <h1 className="text-3xl font-semibold mt-8 mb-24 text-center">
               Descubre nuestras categorías
            </h1>

            <div className="mx-auto max-w-4xl bg-muted rounded-2xl shadow-md ring-1 ring-border p-4 sm:p-6 md:p-8 ">
                <CategorySection items={data} className="brand-scope" />
            </div>
        </main>
    );
}