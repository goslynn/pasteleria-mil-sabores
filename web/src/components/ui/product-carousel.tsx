'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ProductCard, type ProductCardProps } from '@/components/ui/product-card'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'

export type ProductSliderProps = {
    items: ProductCardProps[]
    className?: string
    title?: string
    /** preset de columnas por breakpoint (tokens literales para que Tailwind no los purgue) */
    columnsPreset?:
        | '1'
        | '1-2'
        | '1-2-3'
        | '1-2-3-4'
        | '2-3-4'
        | '2-3-4-5'
    /** mostrar/ocultar controles */
    controls?: boolean
    /** aspect por defecto para cada ProductCard */
    defaultAspect?: ProductCardProps['aspect']
    /** loop embla */
    loop?: boolean
    /** separación entre slides (usa patrón -ml/pl del ejemplo oficial) */
    spacing?: 'tight' | 'normal' | 'wide'
    /** dónde ubicar las flechas */
    controlsPosition?: 'inside' | 'outside'
    /** empuje lateral extra para las flechas cuando están "outside" */
    controlsGutterPx?: number // ej: 12 -> -left-[12px]
}

function presetToClasses(preset: NonNullable<ProductSliderProps['columnsPreset']>): string {
    // TODAS las clases son literales y quedan en el bundle → no hay purgado
    switch (preset) {
        case '1':            return 'basis-full'
        case '1-2':          return 'basis-full sm:basis-1/2'
        case '1-2-3':        return 'basis-full sm:basis-1/2 lg:basis-1/3'
        case '1-2-3-4':      return 'basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
        case '2-3-4':        return 'basis-1/2 md:basis-1/3 lg:basis-1/4'
        case '2-3-4-5':      return 'basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5'
        default:             return 'basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
    }
}

function spacingTrack(spacing: NonNullable<ProductSliderProps['spacing']>): string {
    // clases literales
    switch (spacing) {
        case 'tight':  return '-ml-2 md:-ml-3'
        case 'wide':   return '-ml-5 md:-ml-6'
        default:       return '-ml-3 md:-ml-4'
    }
}
function spacingItem(spacing: NonNullable<ProductSliderProps['spacing']>): string {
    switch (spacing) {
        case 'tight':  return 'pl-2 md:pl-3'
        case 'wide':   return 'pl-5 md:pl-6'
        default:       return 'pl-3 md:pl-4'
    }
}

export default function ProductCarousel({
                                          items,
                                          className,
                                          title,
                                          columnsPreset = '1-2-3-4',     // como el ejemplo de shadcn
                                          controls = true,
                                          defaultAspect = '4/3',
                                          loop = false,
                                          spacing = 'normal',
                                          controlsPosition = 'outside',
                                          controlsGutterPx = 12,
                                      }: ProductSliderProps) {
    const basis = presetToClasses(columnsPreset)
    const trackGap = spacingTrack(spacing)
    const itemPad = spacingItem(spacing)

    const insidePrev = 'left-2'
    const insideNext = 'right-2'
    const outsidePrev = `left-0 -translate-x-full -ml-[${controlsGutterPx}px]`
    const outsideNext = `right-0 translate-x-full -mr-[${controlsGutterPx}px]`

    const prevClass =
        controlsPosition === 'outside' ? outsidePrev : insidePrev
    const nextClass =
        controlsPosition === 'outside' ? outsideNext : insideNext


    return (
        <section aria-label={title ?? 'Productos'} className={cn('relative', className)}>
            {title && (
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
            )}

            <Carousel
                className="w-full"
                opts={{
                    align: 'start',
                    containScroll: 'trimSnaps', // no “medios” ítems
                    slidesToScroll: 1,          // 1 por clic
                    dragFree: false,
                    loop,
                }}
            >
                {/* patrón oficial: -ml en el track + pl en cada item (NO usar gap) */}
                <CarouselContent className={cn(trackGap, 'px-2')}>
                    {items.map((it) => (
                        <CarouselItem
                            key={it.id}
                            className={cn('shrink-0', itemPad, basis, 'py-2')}
                        >
                            <ProductCard
                                {...it}
                                aspect={it.aspect ?? defaultAspect}
                                className="h-full"
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {controls && (
                    <>
                        <CarouselPrevious
                            aria-label="Ver anteriores"
                            className={cn(
                                'pointer-events-auto', // por si el contenedor tiene pointer-events
                                prevClass
                            )}
                        />
                        <CarouselNext
                            aria-label="Ver siguientes"
                            className={cn('pointer-events-auto', nextClass)}
                        />
                    </>
                )}
            </Carousel>
        </section>
    )
}
