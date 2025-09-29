// search-bar.tsx
"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SearchIcon, X } from "lucide-react";

export type SearchBarProps = {
    /** Server Action (permitida como form action) */
    action: (formData: FormData) => Promise<void> | void;
    /** id del input (opcional) */
    id?: string;
    /** placeholder del input (opcional) */
    placeholder?: string;
    className?: string;
    /** valor inicial (hidratado desde server si quieres) */
    initialQuery?: string;
    /** página por defecto para paginación */
    defaultPage?: number | string;
};

export function SearchBar({
                              id = "search-input",
                              placeholder = "Buscar…",
                              action,
                              className,
                              initialQuery = "",
                              defaultPage = 1,
                          }: SearchBarProps) {
    const [q, setQ] = useState<string>(initialQuery);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // 👇 No interceptamos el submit; dejamos que el form llame a la Server Action.
    //    Mantener onSubmit aquí rompería el patrón de Server Action.
    return (
        <form action={action} className={cn("relative mx-auto w-full max-w-xs", className)}>
            <Input
                ref={inputRef}
                id={id}
                name="q"                 // <- la Server Action leerá "q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="peer h-8 ps-8 pe-8"
                aria-label="Buscar productos"
            />

            {/* Si usas paginación */}
            <input type="hidden" name="page" value={String(defaultPage)} />

            {/* Lupa a la izquierda */}
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2 text-muted-foreground/80 peer-disabled:opacity-50">
                <SearchIcon size={16} />
            </div>

            {/* Botón limpiar a la derecha (solo si hay texto) */}
            {q && (
                <button
                    type="button"
                    onClick={() => {
                        setQ("");
                        inputRef.current?.focus();
                    }}
                    className="absolute inset-y-0 end-0 my-auto me-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    aria-label="Borrar búsqueda"
                    title="Borrar"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </form>
    );
}
