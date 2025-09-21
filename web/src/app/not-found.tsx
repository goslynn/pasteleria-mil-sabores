import Link from "next/link";

export default function NotFound() {
    return (
        <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 p-8 text-center">
            <h1 className="text-3xl font-bold">404 - Página no encontrada</h1>
            <p className="text-muted-foreground">
                La ruta que visitas no existe o fue movida.
            </p>
            <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-border hover:bg-accent"
            >
                Volver al inicio
            </Link>
        </main>
    );
}
