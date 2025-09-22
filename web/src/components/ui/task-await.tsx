'use client'

import { useEffect, useRef } from 'react'

type TaskAwaitProps = {
    /** Función a ejecutar al montar el componente (puede ser async). */
    action: () => Promise<unknown> | unknown
    /** URL a donde redirigir cuando termine la acción. */
    redirectTo: string
    /** Texto opcional bajo el spinner. Default: "Cargando…" */
    label?: string
}

/**
 * Componente de espera reutilizable con spinner centrado.
 * Ejecuta `action()` al montar y redirige a `redirectTo` al finalizar (éxito o error).
 */
export default function TaskAwait({ action, redirectTo, label = 'Cargando…' }: TaskAwaitProps) {
    // Evita doble redirección por renders o fast-refresh
    const redirected = useRef(false)

    useEffect(() => {
        let cancelled = false

        ;(async () => {
            try {
                await action()
            } catch (err) {
                // No rompemos el flujo: registramos el error y de todas formas redirigimos.
                console.error('TaskWait > action() lanzó un error:', err)
            } finally {
                if (!cancelled && !redirected.current) {
                    redirected.current = true
                    // Redirección "dura" para asegurar estado fresco
                    window.location.replace(redirectTo)
                }
            }
        })()

        return () => {
            cancelled = true
        }
    }, [action, redirectTo])

    return (
        <main className="flex min-h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div
                    aria-hidden="true"
                    className="
            h-10 w-10 rounded-full
            border-4
            border-neutral-300 dark:border-neutral-700
            border-t-neutral-900
            animate-spin
          "
                />
                {/* Texto */}
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{label}</p>
            </div>
        </main>
    )
}
