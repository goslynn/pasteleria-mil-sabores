import * as React from 'react';
import CategorySection, {CategoryItem} from "@/components/ui/category";

const SAMPLE_CATEGORIES: CategoryItem[] = [
    {
        title: "Repostería",
        href: "/categoria/reposteria",
        image: "https://picsum.photos/seed/cake/600/400",
        description:
            "Todo lo dulce que imagines: pasteles, galletas y cupcakes. Tortas de chocolate, pasteles de fruta.",
    },
    {
        title: "Videojuegos",
        href: "/categoria/videojuegos",
        image: "https://picsum.photos/seed/game/600/400",
        description: "Encuentra consolas, accesorios y tus títulos favoritos.",
    },
    {
        title: "Ropa",
        href: "/categoria/ropa",
        image: "https://picsum.photos/seed/clothes/600/400",
        description: "Colección 2025. Descubre nuestras prendas más nuevas y sostenibles.",
    },
    {
        title: "Electrónica",
        href: "/categoria/electronica",
        image: "https://picsum.photos/seed/phone/600/400",
        // sin descripción
    },
];


export default function CategoriesPage() {
    //TODO: fetch de las categorias desde strapi
    return (
        <main className="container mx-auto p-6">
            <h1 className="text-3xl font-semibold mt-8 mb-24 text-center">
               Descubre nuestras categorías
            </h1>

            <div className="mx-auto max-w-4xl bg-muted rounded-2xl shadow-md ring-1 ring-border p-4 sm:p-6 md:p-8 ">
                <CategorySection items={SAMPLE_CATEGORIES} className="brand-scope" />
            </div>
        </main>
    );
}