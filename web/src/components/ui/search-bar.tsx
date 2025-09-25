import React, { useState, useRef } from 'react';
import {cn} from "@/lib/utils";
import {Input} from "@/components/ui/input";
import {SearchIcon, X} from "lucide-react";


export function SearchBar({
                              id = "search-input",
                              placeholder = 'Search...',
                              onSubmit,
                              className,
                          }: {
    id? : string
    placeholder?: string
    onSubmit?: (q: string) => void
    className?: string
}) {

    const [q, setQ] = useState('')
    const inputRef = useRef<HTMLInputElement | null>(null)

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        onSubmit?.(q)
    }

    return (
        <form onSubmit={handleSubmit} className={cn('relative mx-auto w-full max-w-xs', className)}>
            <Input
                id={id}
                name="search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="peer h-8 ps-8 pe-8"
            />

            {/* Lupa a la izquierda */}
            <div
                className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2 text-muted-foreground/80 peer-disabled:opacity-50">
                <SearchIcon size={16}/>
            </div>

            {/* Botón limpiar a la derecha (solo si hay texto) */}
            {q && (
                <button
                    type="button"
                    onClick={() => {
                        setQ('')
                        inputRef.current?.focus()
                    }}
                    className="absolute inset-y-0 end-0 my-auto me-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    aria-label="Borrar búsqueda"
                    title="Borrar"
                >
                    <X className="h-3.5 w-3.5"/>
                </button>
            )}
        </form>
    )
}