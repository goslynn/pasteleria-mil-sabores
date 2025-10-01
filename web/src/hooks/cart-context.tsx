'use client'

import * as React from 'react'

type CartContextValue = {
    cartId: number | null
    setCartId: (id: number | null) => void
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartId, setCartIdState] = React.useState<number | null>(null)

    // Rehidratación desde localStorage
    React.useEffect(() => {
        try {
            const saved = window.localStorage.getItem('cart:id')
            if (saved) {
                const parsed = Number(saved)
                if (!Number.isNaN(parsed)) setCartIdState(parsed)
            }
        } catch {
            /* noop */
        }
    }, [])

    // Persistencia
    const setCartId = React.useCallback((id: number | null) => {
        setCartIdState(id)
        try {
            if (id != null) {
                window.localStorage.setItem('cart:id', String(id))
            } else {
                window.localStorage.removeItem('cart:id')
            }
        } catch {
            /* noop */
        }
    }, [])

    const value = React.useMemo(() => ({ cartId, setCartId }), [cartId, setCartId])
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const ctx = React.useContext(CartContext)
    if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
    return ctx
}
