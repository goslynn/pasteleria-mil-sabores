import { nextApi } from "@/lib/fetching";
import CarritoPage from "@/components/carrito";
import { CarritoItem } from "@/types/carrito";
import { CarritoResponse } from "@/types/carrito";
import { getCurrentUser } from "@/lib/datamapping";

export default async function Carrito() {
    let user = await getCurrentUser();
    let carritoItems: CarritoItem[] = [];

    try {
        const data: CarritoResponse = await nextApi.get(`/api/carrito/`)
        carritoItems = data.carritoDetalle.map(d => ({
            idDetalle: d.idCarritoDetalle,
            idCarrito: d.idCarrito,
            code: d.idProducto,
            name: d.nombreProducto,
            price: d.precioUnitario,
            quantity: d.cantidad,
            keyImage: d.imagenUrl || "",
            category: undefined,
        }));
    } catch (e) {
        console.error("Error cargando carrito:", e)
    }

    return (
        <section className="flex items-center justify-center min-h-screen p-4">
            <CarritoPage items={carritoItems} />
        </section>
    );
}
