import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CartButtonProps {
    link: string;
    className?: string;
}

export function CartButton({ link, className  }: CartButtonProps) {
    return (
        <Link href={link} className="flex justify-center">
            <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir carrito de compras"
                title="Abrir carrito de compras"
                className={cn(
                    "active:scale-95 transition-transform duration-150",
                    className
                )}
            >
                <ShoppingCart className="h-5 w-5" />
            </Button>
        </Link>
    );
}
