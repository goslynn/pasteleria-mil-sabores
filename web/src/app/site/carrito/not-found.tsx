import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CarritoNotFound() {
    return (
        <div className="flex flex-col items-center justify-center mt-24 md:mt-32 p-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Carrito Vacío</h1>
            <p className="text-lg text-muted-foreground mb-6">
                No tienes productos en tu carrito.
            </p>
            <Link href="/site">
                <Button>Ver Productos</Button>
            </Link>
        </div>
    );
}
