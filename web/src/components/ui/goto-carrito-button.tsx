'use client'

import * as React from 'react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'
import {ShoppingCart} from 'lucide-react'
import {cn} from '@/lib/utils'
import {useCart} from '@/hooks/cart-context'
import {CarritoResponse} from "@/types/carrito";
import {nextApi} from "@/lib/fetching";

export interface CartButtonProps {
    link: string
    className?: string
}


async function fetchCartItemsCount(cartId : number): Promise<number> {
    console.log("Cargando carrito...", cartId)
    let carrito: CarritoResponse | null = null;

    try {
        const res = await nextApi.get<CarritoResponse | { data: CarritoResponse }>(
            "/api/carrito"
        );
        carrito = (res as { data?: CarritoResponse })?.data ?? (res as CarritoResponse);
    } catch (e) {
        console.error("Error cargando carrito:", e);
    }

    return carrito?.carritoDetalle?.length ?? 0
}

/** Hook: trae y mantiene el count del carrito; se refresca con cartId y con el evento 'cart:changed' */
function useCartCount() {
    const { cartId } = useCart()
    const [count, setCount] = React.useState(0)

    const load = React.useCallback(async () => {
        if (cartId == null) {
            setCount(0)
            return
        }
        try {
            const n = await fetchCartItemsCount(cartId)
            setCount(Number.isFinite(n) ? n : 0)
        } catch {
            // Silencioso por ahora; podrías loguear si quieres
        }
    }, [cartId])

    React.useEffect(() => {
        // Cargar cuando cambia el cartId
        load()
    }, [load])

    React.useEffect(() => {
        // Permite que otros flujos notifiquen cambios sin polling
        const onChanged = () => load()
        window.addEventListener('cart:changed', onChanged)
        return () => window.removeEventListener('cart:changed', onChanged)
    }, [load])

    return count
}

export function GoToCartButton({ link, className }: CartButtonProps) {
    const count = useCartCount()

    // Animación de rebote solo cuando aumenta
    const prevRef = React.useRef<number>(count)
    const [bump, setBump] = React.useState(false)

    React.useEffect(() => {
        const prev = prevRef.current
        if (count > prev) {
            setBump(true)
            const t = setTimeout(() => setBump(false), 350) // duración del “rebote”
            return () => clearTimeout(t)
        }
        // si disminuye o queda igual, no hay rebote (solo cambia el número)
        prevRef.current = count
    }, [count])

    // Cuando el efecto anterior termina, sincronizamos el prev
    React.useEffect(() => {
        if (!bump) prevRef.current = count
    }, [bump, count])

    return (
        <Link href={link} className="flex justify-center">
            <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir carrito de compras"
                title="Abrir carrito de compras"
                className={cn(
                    'relative active:scale-95 transition-transform duration-150',
                    className
                )}
            >
                <ShoppingCart className="h-5 w-5"/>

                {/* Badge */}
                <span
                    // Mostramos solo si count > 0
                    className={cn(
                        'pointer-events-none absolute -right-1.5 -top-1.5 min-w-5 h-5 px-1',
                        'rounded-full text-[11px] leading-[20px] text-white bg-rose-500',
                        'flex items-center justify-center font-semibold',
                        // Aparición/ocultamiento suave
                        'transition-all duration-200',
                        count > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                        // Rebote (one-shot) solo cuando aumenta
                        bump ? 'animate-[cart-bounce_350ms_ease-out]' : ''
                    )}
                >
          {count}
        </span>
            </Button>

            {/* Keyframes locales (solo una vez por página) */}
            <style>{`
              @keyframes cart-bounce {
                0% { transform: scale(0.8); }
                40% { transform: scale(1.15); }
                70% { transform: scale(0.95); }
                100% { transform: scale(1); }
              }
            `}</style>

        </Link>
    );
}
