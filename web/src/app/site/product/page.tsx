import ProductGrid from "@/components/ui/product-grid";
import { toProductCard } from "@/lib/datamapping";
import { notFound, redirect } from "next/navigation";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { findProducts } from "@/app/services/product-search.service";
import type { PageProps } from "@/types/page-types";
import type { ApiMeta } from "@/types/strapi/common";
import {NamedError} from "@/lib/exceptions";

type ProductsQuery = {
    searchParams: PageProps["searchParams"] & {
        q?: string;
        cat?: string;
        page?: string;
        pageSize?: string;
    };
};

// --- Helpers ---------------------------------------------------
function ensurePageInUrl(sp: Record<string, string | string[] | undefined>) {
    const hasPage = sp && Object.prototype.hasOwnProperty.call(sp, "page");
    if (hasPage) return;

    const qp = new URLSearchParams();
    Object.entries(sp ?? {}).forEach(([k, v]) => {
        if (v == null) return;
        if (Array.isArray(v)) v.forEach((x) => qp.append(k, String(x)));
        else qp.set(k, String(v));
    });
    qp.set("page", "1");
    redirect(`?${qp.toString()}`);
}

function buildPageHref(
    sp: Record<string, string | string[] | undefined>,
    page: number,
): string {
    const qp = new URLSearchParams();
    Object.entries(sp ?? {}).forEach(([k, v]) => {
        if (v == null) return;
        if (Array.isArray(v)) v.forEach((x) => qp.append(k, String(x)));
        else qp.set(k, String(v));
    });
    qp.set("page", String(page));
    return `?${qp.toString()}`;
}

// --- Page ------------------------------------------------------
export default async function ProductsPage({ searchParams }: ProductsQuery) {
    // Next 15: searchParams es Promise en Server Components
    const sp = await searchParams;

    if (!sp) notFound();

    // Si no viene page en el URL, fuerza page=1
    ensurePageInUrl(sp);

    const page = Number(sp.page ?? "1");
    const pageSize = sp.pageSize ? Number(sp.pageSize) : 20;
    const q = sp.q ?? "";
    const cat = sp.cat?.trim() || undefined;

    try {
        // Servicio nuevo: si viene category, ignora q (misma regla que tenías)
        const resp = await findProducts({
            page,
            pageSize,
            q,
            category: cat,
        });

        // resp tiene shape de Strapi: { data: ProductDTO[], meta: { pagination } }
        const products = Array.isArray(resp?.data) ? resp.data : [];
        if (products.length === 0) notFound();

        const cards = products.map(toProductCard);

        const pagination: ApiMeta["pagination"] | undefined = resp?.meta?.pagination;
        const currentPage: number = pagination?.page ?? page;
        const pageCount: number = pagination?.pageCount ?? 1;

        return (
            <div className="flex-1 flex flex-col items-center px-4 py-6 md:py-10">
                <section className="w-full max-w-6xl flex flex-col gap-6">
                    <header className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold tracking-tight">Resultados</h1>
                    </header>

                    <div className="bg-muted rounded-2xl ring-1 ring-border shadow-md p-4 sm:p-6 md:p-8">
                        <ProductGrid
                            products={cards}
                            cols={3}
                            minCardPx={280}
                            gapPx={24}
                            className="brand-scope"
                        />
                    </div>

                    {/* Paginación */}
                    {pageCount > 1 && (
                        <div className="flex w-full justify-center">
                            <Pagination className="w-auto">
                                <PaginationContent>
                                    {/* Prev */}
                                    <PaginationItem>
                                        {currentPage > 1 ? (
                                            <PaginationPrevious href={buildPageHref(sp, currentPage - 1)} />
                                        ) : (
                                            <span className="pointer-events-none opacity-50">
                        <PaginationPrevious href="#" />
                      </span>
                                        )}
                                    </PaginationItem>

                                    {/* Primera */}
                                    <PaginationItem>
                                        <PaginationLink
                                            href={buildPageHref(sp, 1)}
                                            isActive={currentPage === 1}
                                        >
                                            1
                                        </PaginationLink>
                                    </PaginationItem>

                                    {/* Ellipsis izquierda */}
                                    {currentPage > 3 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    {/* Ventana central */}
                                    {Array.from({ length: 3 })
                                        .map((_, i) => currentPage - 1 + i)
                                        .filter((p) => p > 1 && p < pageCount)
                                        .map((p) => (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    href={buildPageHref(sp, p)}
                                                    isActive={currentPage === p}
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                    {/* Ellipsis derecha */}
                                    {currentPage < pageCount - 2 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    {/* Última */}
                                    {pageCount > 1 && (
                                        <PaginationItem>
                                            <PaginationLink
                                                href={buildPageHref(sp, pageCount)}
                                                isActive={currentPage === pageCount}
                                            >
                                                {pageCount}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )}

                                    {/* Next */}
                                    <PaginationItem>
                                        {currentPage < pageCount ? (
                                            <PaginationNext href={buildPageHref(sp, currentPage + 1)} />
                                        ) : (
                                            <span className="pointer-events-none opacity-50">
                        <PaginationNext href="#" />
                      </span>
                                        )}
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </section>
            </div>
        );
    } catch (e) {
        // Tus servicios lanzan ValidationError / NotFoundError
        const namedErr = e as NamedError;
        if (namedErr && namedErr.name === "NotFoundError") notFound();
        else throw e;
    }
}
