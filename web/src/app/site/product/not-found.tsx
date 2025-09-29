import Link from "next/link";
import {PageProps} from "@/types/page-types";

export default async function NotFound({ searchParams }: PageProps) {
    const q = (searchParams?.q ?? "").toString().trim();

    return (
        <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 p-8 text-center">
            <h1 className="text-3xl font-bold">Nada que ver aquí</h1>
            <p className="text-muted-foreground">
                {`No encontramos${q ? ` resultados para “${q}”` : " lo que buscas"}.`}
            </p>
            <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-border hover:bg-accent"
            >
                Volver al inicio
            </Link>
        </section>
    );
}