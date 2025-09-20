import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) : string {
    if (!name) return ""
    return name
        .trim()
        .split(/\s+/)
        .map(p => p[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2);
}
