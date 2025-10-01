'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type QuantityStepperProps = {
    /** Valor actual (controlado). Si no lo pasas, el componente maneja su propio estado con defaultValue */
    value?: number
    defaultValue?: number
    onChange?: (next: number) => void
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    className?: string
    /** Tamaño visual; “sm” es el que usas en carrito */
    size?: 'sm' | 'md'
}

export function QuantityStepper({
                                    value,
                                    defaultValue = 1,
                                    onChange,
                                    min = 1,
                                    max = 99,
                                    step = 1,
                                    disabled,
                                    className,
                                    size = 'sm',
                                }: QuantityStepperProps) {
    const isControlled = value !== undefined
    const [internal, setInternal] = React.useState(defaultValue)
    const current = isControlled ? (value as number) : internal

    const clamp = React.useCallback(
        (n: number) => Math.max(min, Math.min(max, n)),
        [min, max]
    )

    const emit = React.useCallback(
        (n: number) => {
            const next = clamp(n)
            if (!isControlled) setInternal(next)
            onChange?.(next)
        },
        [clamp, isControlled, onChange]
    )

    const dec = () => emit(current - step)
    const inc = () => emit(current + step)

    const box = size === 'sm' ? 'h-9 px-3 rounded-xl' : 'h-10 px-4 rounded-xl'
    const icon = size === 'sm' ? 'h-9 w-9 rounded-xl' : 'h-10 w-10 rounded-xl'
    const valueBox =
        'border bg-background shadow-sm text-center flex items-center justify-center select-none font-medium'

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2',
                disabled && 'opacity-60',
                className
            )}
            aria-label="Selector de cantidad"
        >
            <Button
                type="button"
                variant="outline"
                className={cn(icon)}
                disabled={disabled || current <= min}
                onClick={dec}
                aria-label="Disminuir"
            >
                –
            </Button>

            <div className={cn(valueBox, box, 'min-w-12')}>{current}</div>

            <Button
                type="button"
                variant="outline"
                className={cn(icon)}
                disabled={disabled || current >= max}
                onClick={inc}
                aria-label="Aumentar"
            >
                +
            </Button>
        </div>
    )
}
