import {fetchProducts} from "@/lib/datamapping";

// ejemplo y tal..
type PageProps = {
    searchParams: {
        q?: string;
        page?: string;
        pageSize?: string;
    }
};

export default async function ProductosPage({ searchParams }: PageProps) {
    const q = (searchParams.q ?? "").trim();
    const page = Number(searchParams.page ?? 1);
    const pageSize = Number(searchParams.pageSize ?? 12);

    const products = await fetchProducts({ q, page, pageSize });

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-8">
            {/* Prefilla la búsqueda desde la URL */}
    {/* Usa SearchBar (HTML) o SearchBarClient */}
    {/* <SearchBar defaultValue={q} action="/productos" /> */}
    {/* <SearchBarClient targetPath="/productos" /> */}

    <h1 className="mb-4 text-2xl font-semibold">Resultados {q ? `para “${q}”` : ""}</h1>

    {products.data.length === 0 ? (
        <p>No encontramos productos.</p>
    ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.data.map(p => (
                    <li key={p.id} className="rounded-md border p-4">
                <h3 className="font-medium">{p.attributes.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.attributes.code}</p>
        {/* imagen/precio/etc */}
        </li>
    ))}
        </ul>
    )}

    {/* Paginación mínima */}
    <div className="mt-6 flex items-center gap-2">
        {page > 1 && (
            <a
                href={`/productos?${qs({ q, page: page - 1, pageSize })}`}
    className="rounded border px-3 py-1"
        >
        Anterior
        </a>
)}
    <a
        href={`/productos?${qs({ q, page: page + 1, pageSize })}`}
    className="rounded border px-3 py-1"
        >
        Siguiente
        </a>
        </div>
        </main>
);
}

// pequeño helper para recomponer querystrings
function qs(obj: Record<string, string | number | undefined>) {
    const u = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
        if (v !== undefined && String(v).length > 0) u.set(k, String(v));
    });
    return u.toString();
}
