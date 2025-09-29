'use client'

import * as React from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {ProductCard, type ProductCardProps} from '@/components/ui/product-card'

export type ProductSliderProps = {
    items: ProductCardProps[]
    title?: string
    className?: string
    /** ancho base de tarjeta (tailwind length, ej: '16rem', '20rem', '280px') */
    cardWidth?: string
    /** gap horizontal entre tarjetas (Tailwind class, ej: 'gap-4', 'gap-6') */
    gapClass?: string
    /** mostrar/ocultar controles flotantes */
    controls?: boolean
    /** aspect ratio a propagar a cada ProductCard (puedes sobreescribir en item) */
    defaultAspect?: ProductCardProps['aspect']
}

export default function ProductSlider({
                                          items,
                                          title,
                                          className,
                                          cardWidth = '18rem',
                                          gapClass = 'gap-4',
                                          controls = true,
                                          defaultAspect = '4/3',
                                      }: ProductSliderProps) {
    const scrollerRef = React.useRef<HTMLDivElement | null>(null)
    const [atStart, setAtStart] = React.useState(true)
    const [atEnd, setAtEnd] = React.useState(false)

    // Actualiza estados de borde (inicio/fin) para habilitar/deshabilitar botones
    const updateEdges = React.useCallback(() => {
        const el = scrollerRef.current
        if (!el) return
        const maxScroll = el.scrollWidth - el.clientWidth
        setAtStart(el.scrollLeft <= 4)
        setAtEnd(el.scrollLeft >= maxScroll - 4)
    }, [])

    React.useEffect(() => {
        updateEdges()
        const el = scrollerRef.current
        if (!el) return
        const onScroll = () => updateEdges()
        el.addEventListener('scroll', onScroll, {passive: true})
        const ro = new ResizeObserver(updateEdges)
        ro.observe(el)
        return () => {
            el.removeEventListener('scroll', onScroll)
            ro.disconnect()
        }
    }, [updateEdges])

    // Navegar por “página”
    const scrollPage = (dir: 1 | -1) => {
        const el = scrollerRef.current
        if (!el) return
        const delta = Math.round(el.clientWidth * 0.9) * dir
        el.scrollBy({left: delta, behavior: 'smooth'})
    }

    // Drag to scroll (mouse/touch)
    React.useEffect(() => {
        const el = scrollerRef.current
        if (!el) return

        let isDown = false
        let startX = 0
        let startLeft = 0

        const onPointerDown = (e: PointerEvent) => {
            // Evita que arrastrar imágenes capture el drag
            if (!(e.target instanceof HTMLElement)) return
            el.setPointerCapture(e.pointerId)
            isDown = true
            startX = e.clientX
            startLeft = el.scrollLeft
        }
        const onPointerMove = (e: PointerEvent) => {
            if (!isDown) return
            const dx = e.clientX - startX
            el.scrollLeft = startLeft - dx
        }
        const onPointerUp = (e: PointerEvent) => {
            isDown = false
            el.releasePointerCapture(e.pointerId)
        }

        el.addEventListener('pointerdown', onPointerDown)
        el.addEventListener('pointermove', onPointerMove)
        el.addEventListener('pointerup', onPointerUp)
        el.addEventListener('pointercancel', onPointerUp)

        // wheel horizontal “natural”
        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return // deja el scroll vertical normal
            e.preventDefault()
            el.scrollBy({left: e.deltaX, behavior: 'auto'})
        }
        el.addEventListener('wheel', onWheel, {passive: false})

        return () => {
            el.removeEventListener('pointerdown', onPointerDown)
            el.removeEventListener('pointermove', onPointerMove)
            el.removeEventListener('pointerup', onPointerUp)
            el.removeEventListener('pointercancel', onPointerUp)
            el.removeEventListener('wheel', onWheel)
        }
    }, [])

    // accesibilidad con teclado (Home/End/PageUp/PageDown)
    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key === 'Home') {
            scrollerRef.current?.scrollTo({left: 0, behavior: 'smooth'})
        } else if (e.key === 'End') {
            const el = scrollerRef.current
            if (el) el.scrollTo({left: el.scrollWidth, behavior: 'smooth'})
        } else if (e.key === 'PageDown' || (e.key === 'ArrowRight' && e.ctrlKey)) {
            e.preventDefault()
            scrollPage(1)
        } else if (e.key === 'PageUp' || (e.key === 'ArrowLeft' && e.ctrlKey)) {
            e.preventDefault()
            scrollPage(-1)
        }
    }

    return (
        <section
            className={cn('relative', className)}
            aria-label={title ?? 'Productos'}
            style={
                {
                    ['--card-w']: cardWidth,
                } as React.CSSProperties & { '--card-w'?: string }
            }
        >
            {title && (
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {controls && (
                        <div className="hidden md:flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => scrollPage(-1)}
                                disabled={atStart}
                                aria-label="Ver anteriores"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => scrollPage(1)}
                                disabled={atEnd}
                                aria-label="Ver siguientes"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Contenedor scrolleable */}
            <div
                ref={scrollerRef}
                tabIndex={0}
                onKeyDown={onKeyDown}
                className={cn(
                    // layout
                    'group/slider relative flex overflow-x-auto overflow-y-visible',
                    'scroll-smooth',
                    'snap-x snap-mandatory',
                    // ocultar barra en navegadores comunes
                    '[scrollbar-width:none] [-ms-overflow-style:none]',
                    '[&::-webkit-scrollbar]:hidden',
                    gapClass,
                    // padding lateral para que los controles no tapen contenido
                    'px-1 sm:px-2'
                )}
                role="list"
                aria-roledescription="Carrusel de productos"
            >
                {/* “pistas”: cada item tiene ancho fijo via var(--card-w) y snap */}
                {items.map((it) => (
                    <div
                        key={it.id}
                        role="listitem"
                        className={cn(
                            'snap-start shrink-0',
                            // ancho de tarjeta: ajustable con --card-w y responsive por media queries
                            'w-[var(--card-w)]'
                        )}
                    >
                        <ProductCard
                            {...it}
                            aspect={it.aspect ?? defaultAspect}
                            className={cn(
                                'h-full',
                                // mejora hover al interior sin “pegarse” al borde
                                'will-change-transform'
                            )}
                        />
                    </div>
                ))}
            </div>

            {/* Controles flotantes en móviles/desktop (opcionales) */}
            {controls && (
                <>
                    <div className="pointer-events-none absolute inset-y-0 left-0 hidden md:block w-16 bg-gradient-to-r from-background to-transparent opacity-90 rounded-l-xl" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden md:block w-16 bg-gradient-to-l from-background to-transparent opacity-90 rounded-r-xl" />

                    <div className="absolute inset-y-0 left-1 flex items-center">
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="shadow md:hidden"
                            onClick={() => scrollPage(-1)}
                            disabled={atStart}
                            aria-label="Ver anteriores"
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                    </div>

                    <div className="absolute inset-y-0 right-1 flex items-center">
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="shadow md:hidden"
                            onClick={() => scrollPage(1)}
                            disabled={atEnd}
                            aria-label="Ver siguientes"
                        >
                            <ChevronRight className="size-5" />
                        </Button>
                    </div>
                </>
            )}
        </section>
    )
}