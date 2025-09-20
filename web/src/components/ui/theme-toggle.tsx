'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Laptop, Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    // Si quieres que el icono refleje "lo que ves" en pantalla, usa 'applied'.
    const applied = theme === 'system' ? systemTheme : theme

    // Siguiente destino (nunca 'system')
    const next = theme === 'system'
        ? (systemTheme === 'dark' ? 'light' : 'dark')
        : (theme === 'dark' ? 'light' : 'dark')

    function nextTheme() {
        setTheme(next)
    }

    // ANIMACIÓN: superponemos los 3 íconos y hacemos crossfade+scale+rotate
    const baseIcon =
        "absolute inset-0 m-auto h-4 w-4 origin-center " +
        "motion-safe:transition-all motion-safe:duration-200"
    const visible = "opacity-100 scale-100 rotate-0"
    const hidden  = "opacity-0 scale-75 -rotate-90"

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={nextTheme}
            aria-label={`Cambiar a tema ${next}`}
            title={`Cambiar a tema ${next}`}
            className="active:scale-95 motion-safe:transition-transform motion-safe:duration-150"
        >
      <span className="relative inline-block h-4 w-4 align-middle">
        {/* Opción A (por defecto): icono según 'applied' (lo que ves) */}
          <Sun   className={`${baseIcon} ${applied === 'light' ? visible : hidden}`} aria-hidden={applied !== 'light'} />
        <Moon  className={`${baseIcon} ${applied === 'dark'  ? visible : hidden}`} aria-hidden={applied !== 'dark'} />
        <Laptop className={`${baseIcon} ${applied !== 'light' && applied !== 'dark' ? visible : hidden}`} aria-hidden={applied === 'light' || applied === 'dark'} />

          {/*
          Opción B (mostrar explícitamente 'System'):
          - Sustituye las 3 líneas anteriores por estas 3 si prefieres ver el Laptop
            cuando theme === 'system', aunque la UI esté en light/dark.

          <Sun    className={`${baseIcon} ${theme === 'light' ? visible : hidden}`}  aria-hidden={theme !== 'light'} />
          <Moon   className={`${baseIcon} ${theme === 'dark'  ? visible : hidden}`}  aria-hidden={theme !== 'dark'} />
          <Laptop className={`${baseIcon} ${theme === 'system' ? visible : hidden}`} aria-hidden={theme !== 'system'} />
        */}
      </span>
        </Button>
    )
}
