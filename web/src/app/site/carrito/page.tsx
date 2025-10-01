// app/carrito/page.tsx (o donde tengas este componente)
import CarritoPage from "@/components/carrito";
import type { CarritoResponse } from "@/types/carrito";
import { nextApi } from "@/lib/fetching";
import {notFound} from "next/navigation";

export default async function Carrito() {
    let carrito: CarritoResponse | null = null;

    try {
        // Puede venir como JSON directo o envuelto en { data: ... }
        const res = await nextApi.get<CarritoResponse | { data: CarritoResponse }>(
            "/api/carrito"
        );
        carrito =
            (res as { data?: CarritoResponse })?.data ?? (res as CarritoResponse);
    } catch (e) {
        console.error("Error cargando carrito:", e);
    }

    const items = carrito?.carritoDetalle ?? [];

    if (!items.length) {
        notFound()
    }

    return (
        <section className="flex items-center justify-center min-h-screen p-4">
            <CarritoPage items={items} />
        </section>
    );
}
