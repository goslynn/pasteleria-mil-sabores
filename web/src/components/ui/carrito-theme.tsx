"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export function CartButton() {
    function handleClick() {
        // Aquí no haces nada todavía,
        // solo queda el hook para cuando quieras abrir un Drawer/Modal/etc.
        console.log("Carrito presionado")
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir carrito de compras"
            title="Abrir carrito de compras"
            onClick={handleClick}
            className="active:scale-95 transition-transform duration-150"
        >
            <ShoppingCart className="h-5 w-5" />
        </Button>
    )
}
