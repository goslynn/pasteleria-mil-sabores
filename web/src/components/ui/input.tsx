import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                // Base
                "h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none",
                "bg-background text-foreground border-input",
                // Placeholder y selección
                "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
                // File input
                "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:px-2 file:text-sm file:font-medium file:text-foreground",
                // Disabled
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                // Focus
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                // Invalid
                "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                // Dark mode
                "dark:bg-input/30 dark:border-input dark:text-foreground",
                className
            )}
            {...props}
        />
    )
}

export { Input }
