import CarritoPage from "@/components/carrito";
import { CarritoItem } from "@/types/carrito";
import { CarritoResponse } from "@/types/carrito";
import { getCurrentUser } from "@/lib/datamapping";

export default async function RegisterPage() {
    const user = await getCurrentUser();
    if (!user) {
        return <p>No hay usuario logueado</p>;
    }
    const userId = user.idUsuario;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/carrito/${userId}`, {
        cache: "no-store",
    });

    let carritoItems: CarritoItem[] = [];

    if (res.ok) {
        const data: CarritoResponse = await res.json();

        carritoItems = data.carritoDetalle.map((d) => ({
            idDetalle: d.idCarritoDetalle,
            code: d.idProducto,
            name: d.nombreProducto,
            price: d.precioUnitario,
            quantity: d.cantidad,
            keyImage: d.imagenUrl || "",
            category: undefined,
        }));
    }

    return (
        <section
            className="flex items-center justify-center min-h-screen p-4"
            aria-label="Carrito de compras"
        >
            <CarritoPage items={carritoItems} />
        </section>
    );
}
