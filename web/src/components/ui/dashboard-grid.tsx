'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DashboardGridProps {
    cols?: number; // default 6
    gap?: number;  // default 4
    className?: string;
    children?: React.ReactNode;
}

export function DashboardGrid({
                                  cols = 6,
                                  gap = 4,
                                  className,
                                  children,
                              }: DashboardGridProps) {
    return (
        <div
            className={cn(
                `grid grid-cols-${cols} gap-${gap} auto-rows-[100px]`, // altura base de filas
                className
            )}
        >
            {children}
        </div>
    );
}

export interface DashboardItemProps {
    importance: number;
    className?: string;
    children?: React.ReactNode;
}

function mapImportance(imp: number) {
    switch (imp) {
        case 4: return { cols: 3, rows: 3 };
        case 3: return { cols: 2, rows: 2 };
        case 2: return { cols: 2, rows: 1 };
        default: return { cols: 1, rows: 1 };
    }
}

export function DashboardItem({ importance, className, children }: DashboardItemProps) {
    const { cols, rows } = mapImportance(importance);

    return (
        <div
            className={cn(
                `col-span-${cols} row-span-${rows}`,
                'rounded-lg border p-4 bg-background',
                className
            )}
        >
            {children}
        </div>
    );
}
