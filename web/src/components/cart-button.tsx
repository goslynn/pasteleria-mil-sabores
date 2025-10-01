'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Check, X, Loader2 } from 'lucide-react'
import type { CarritoPostBody } from '@/types/carrito'
import { useAddToCart, type ProductInput } from '@/lib/add-to-cart'

export interface AddToCartButtonProps
    extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
    label?: string
    producto: ProductInput
    cantidad?: number
    /** callback OK (entrega el body enviado) */
    onAdded?: (payload: CarritoPostBody) => void
    /** callback error */
    onAddError?: (error: Error) => void
    /** click adicional del consumidor */
    onClickExtra?: React.MouseEventHandler<HTMLButtonElement>
}

export function CartButton(props: AddToCartButtonProps) {
    const {
        producto,
        cantidad = 1,
        label = 'Agregar al carrito',
        onAdded,
        onAddError,
        onClickExtra,
        className,
        children,
        disabled,
        ...buttonProps
    } = props

    const runAddToCart = useAddToCart({ onAdded, onError: onAddError })

    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)
    const [error, setError] = React.useState(false)

    const handleAdded = onAdded ?? ((body: CarritoPostBody) => {
        alert(`✅ Producto agregado: (x${body.cantidad})`)
    })
    const handleError = onAddError ?? ((error: Error) => {
        alert(`❌ Error al agregar al carrito: ${error.message}`)
    })

    const onClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
        onClickExtra?.(e)
        if (e.defaultPrevented) return

        setLoading(true)
        setSuccess(false)
        setError(false)
        try {
            await runAddToCart(producto, { cantidad, onAdded: handleAdded, onError: handleError })
            setSuccess(true)
        } catch {
            setError(true)
        } finally {
            setLoading(false)
            setTimeout(() => {
                setSuccess(false)
                setError(false)
            }, 1200) // se resetea tras 1.2s
        }
    }

    let icon
    if (loading) {
        icon = <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    } else if (success) {
        icon = <Check className="mr-2 h-4 w-4 " />
    } else if (error) {
        icon = <X className="mr-2 h-4 w-4 " />
    } else {
        icon = <Plus className="mr-2 h-4 w-4" />
    }

    return (
        <Button
            type="button"
            className={[
                'transition-transform duration-150 active:scale-95',
                loading ? 'opacity-90' : '',
                className ?? '',
            ].join(' ')}
            aria-live="polite"
            aria-busy={loading}
            onClick={onClick}
            disabled={disabled || loading}
            data-testid="add-to-cart-button"
            {...buttonProps}
        >
            {icon}
            {children ?? (loading ? 'Agregando…' : label)}
        </Button>
    )
}
