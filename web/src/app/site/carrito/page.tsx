import CarritoPage, {CarritoItem} from "@/components/carrito";

export default async function RegisterPage() {
    const carritoEjemplo: CarritoItem[] = [
        {
            code: "SKU001",
            name: "Camiseta básica",
            price: 12000,
            images: [],
            category: undefined,
            quantity: 2,
        },
        {
            code: "SKU002",
            name: "Pantalón jeans",
            price: 24990,
            images: [],
            category: undefined,
            quantity: 1,
        },
    ]
    return (
        <section className="flex items-center justify-center min-h-screen p-4" aria-label={"Carrito de compras"}>
            <CarritoPage items={carritoEjemplo} />
        </section>
    );
}
