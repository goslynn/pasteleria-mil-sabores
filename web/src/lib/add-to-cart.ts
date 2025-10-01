// src/lib/cart/add-to-cart.ts
'use client'

import * as React from 'react'
import type { ProductDTO } from '@/types/product'
import type { CarritoPostBody, CarritoResponse } from '@/types/carrito'
import { HttpError, nextApi } from '@/lib/fetching'
import { useCart } from '@/hooks/cart-context'

/** Contrato mínimo del producto */
export type ProductLike = { code: string; name: string; price: number }
export type ProductInput = ProductDTO | ProductLike

export function toProductLike(p: ProductInput): ProductLike {
    const hasCode = typeof (p as { code?: unknown }).code === 'string'
    const hasName = typeof (p as { name?: unknown }).name === 'string'
    const hasPrice = typeof (p as { price?: unknown }).price === 'number'
    if (!hasCode || !hasName || !hasPrice) {
        throw new Error('Producto inválido: se requieren { code, name, price }')
    }
    const { code, name, price } = p as ProductLike
    return { code, name, price }
}

export type AddToCartOptions = {
    /** Cantidad a agregar (default 1) */
    cantidad?: number
    /** Función POST (para tests/mocks) */
    postFn?: (body: CarritoPostBody) => Promise<CarritoResponse>
    /** Callback éxito (recibe el body enviado) */
    onAdded?: (payload: CarritoPostBody) => void
    /** Callback error */
    onError?: (error: Error) => void
    /** Si lo pasas, se setea el cartId retornado (útil fuera de React) */
    setCartId?: (id: number) => void
}

/** POST real por defecto */
async function defaultPost(body: CarritoPostBody): Promise<CarritoResponse> {
    try {
        const resp = await nextApi.post<CarritoResponse>('/api/carrito', body)
        if (!resp || !resp.idCarrito) throw new Error('Respuesta inválida del servidor')
        return resp
    } catch (error) {
        const httperr = error as HttpError
        const msg =
            httperr ? `${httperr.toString()}` : error instanceof Error ? error.message : 'Error desconocido'
        throw new Error('Fallo al agregar al carrito: ' + msg)
    }
}

/**
 * Función reusable (NO depende de React).
 * Valida producto, arma el body y hace POST.
 * Ejecuta callbacks y (opcional) setea el cartId.
 */
export async function addToCart(
    producto: ProductInput,
    {
        cantidad = 1,
        postFn = defaultPost,
        onAdded,
        onError,
        setCartId,
    }: AddToCartOptions = {}
): Promise<{ body: CarritoPostBody; response: CarritoResponse }> {
    try {
        const prod = toProductLike(producto)
        const body: CarritoPostBody = { code: prod.code, cantidad }
        const response = await postFn(body)
        if (response?.idCarrito && setCartId) setCartId(response.idCarrito)
        onAdded?.(body)
        return { body, response }
    } catch (e) {
        const err = e instanceof Error ? e : new Error('Error desconocido al agregar al carrito')
        onError?.(err)
        throw err
    }
}

/**
 * Hook que conecta la función pura con el contexto de carrito
 * para guardar automáticamente el cartId.
 */
export function useAddToCart(defaults?: Omit<AddToCartOptions, 'setCartId'>) {
    const { setCartId } = useCart()
    return React.useCallback(
        (producto: ProductInput, opts?: Omit<AddToCartOptions, 'setCartId'>) =>
            addToCart(producto, { setCartId, ...defaults, ...opts }),
        [setCartId, defaults]
    )
}
