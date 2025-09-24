
import * as React from "react";
import { cn } from "@/lib/utils";
import StrapiImage from "@/components/ui/strapi-image";
import { ArticleRenderer } from "@/components/ui/article-renderer";
import type { AboutPageDTO } from "@/types/page-types";

export function About(
    { header, background, about_sections }: AboutPageDTO,
    className?: string
) {
    console.log('background', background);
    return (
        <main className={cn("min-h-screen", className)}>
            {/* HERO: imagen “pegada” que se va revelando al hacer scroll */}
            <section aria-label="About Header" className="relative h-[140vh]">
                {/* El sticky ocupa la altura visible; el contenedor mayor da el efecto de revelado */}
                <div className="sticky top-0 h-[60vh] md:h-[70vh]">
                    <div className="absolute inset-0">
                        <StrapiImage
                            src={background}
                            alt={header}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />
                        {/* Scrim para legibilidad del título */}
                        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />
                    </div>

                    {/* CENTRADO PERFECTO */}
                    <div className="relative z-10 grid h-full place-items-center text-center">
                        <h1 className="mx-auto max-w-5xl px-4 md:px-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow">
                            {header}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Contenido debajo: todas las secciones del artículo */}
            <section className="mx-auto w-full max-w-5xl px-4 md:px-6 py-8 md:py-12 space-y-12 md:space-y-16">
                {about_sections?.map((sec, i) => (
                    <ArticleRenderer
                        key={i}
                        content={sec}
                        headingLevel={2}
                    />
                ))}
            </section>
        </main>
    );
}

export default About;
