'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Check } from 'lucide-react'
import type { ProductDTO } from '@/types/product'
import type { CarritoPostBody, CarritoResponse } from '@/types/carrito'
import { useCart } from '@/hooks/cart-context'
import {HttpError, nextApi} from '@/lib/fetching'

/** Mínimo que el botón necesita del producto */
type ProductLike = {
    code: string
    name: string
    price: number
}

/** Acepta ProductDTO completo o un JSON plano con solo los campos usados */
type ProductInput = ProductDTO | ProductLike

function toProductLike(p: ProductInput): ProductLike {
    const hasCode = typeof (p as { code?: unknown }).code === 'string'
    const hasName = typeof (p as { name?: unknown }).name === 'string'
    const hasPrice = typeof (p as { price?: unknown }).price === 'number'

    if (!hasCode || !hasName || !hasPrice) {
        throw new Error(
            'Producto inválido: se requieren campos { code: string, name: string, price: number }'
        )
    }
    const { code, name, price } = p as ProductLike
    return { code, name, price }
}

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

/** Botón “Agregar al carrito” con animación + hook para guardar cartId */
export function AddToCartButton(props: AddToCartButtonProps) {
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

    const { setCartId } = useCart()

    const [loading, setLoading] = React.useState<boolean>(false)
    const [added, setAdded] = React.useState<boolean>(false)

    // defaults que se pueden sobrescribir
    const handleAdded = onAdded ?? ((body: CarritoPostBody) => {
        alert(`✅ Producto agregado: ${body.nombre} (x${body.cantidad})`)
    })
    const handleError = onAddError ?? ((error: Error) => {
        alert(`❌ Error al agregar al carrito: ${error.message}`)
    })

    const handlePost = React.useCallback(
        async (body: CarritoPostBody): Promise<CarritoResponse> => {
            console.log("carrito pe causa ", JSON.stringify(body));
            try {
                const resp = await nextApi.post<CarritoResponse>('/api/carrito',body )
                if (!resp || !resp.idCarrito) {
                    console.error(new Error('Fallo al agregar al carrito: respuesta inválida del servidor'));
                }
                return resp
            } catch (error) {
                const httperr = error as HttpError

                const msg = httperr ? `${httperr.toString()}` :
                    error instanceof Error ? error.message : 'Error desconocido'
                throw new Error('Fallo al agregar al carrito: ' + msg)
            }
        },
        []
    )

    const onClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
        onClickExtra?.(e)
        if (e.defaultPrevented) return

        setLoading(true)
        setAdded(true)

        let { userId } = await nextApi.get<{ userId?: number }>('/api/session', {
            cache: 'no-store',
            next: { revalidate: 0 },
        })
        if (!userId) userId = -1 // guest

        let prod: ProductLike
        try {
            prod = toProductLike(producto)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Producto inválido')
            handleError(error)
            setAdded(false)
            setLoading(false)
            return
        }

        const body: CarritoPostBody = {
            idUsuario: userId,
            idProducto: prod.code,
            cantidad,
            nombre: prod.name,
            precio: prod.price,
        }

        try {
            const resp = await handlePost(body)
            if (resp?.idCarrito) setCartId(resp.idCarrito)
            handleAdded(body)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido al agregar al carrito')
            handleError(error)
            setAdded(false)
        } finally {
            setLoading(false)
            setTimeout(() => setAdded(false), 900)
        }
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
            {added ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {children ?? (loading ? 'Agregando…' : label)}
        </Button>
    )
}
