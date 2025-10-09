import {getCart} from "@/app/services/carrito.service";

export const dynamic = 'force-dynamic';


import CarritoPage from "@/components/carrito";
import type { CarritoResponse } from "@/types/carrito";

export default async function Carrito() {
    let items: CarritoResponse["carritoDetalle"] = [];

    try {
        const data = await getCart();

        items = data?.carritoDetalle ?? [];
    } catch (e) {
        console.error("[Carrito] Error cargando carrito:", e);
    }


    return (
        <section className="flex items-center justify-center min-h-screen p-4">
            <CarritoPage items={items} />
        </section>
    );
}