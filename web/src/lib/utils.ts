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

type HttpError = {
    status?: number;
    message?: string;
};

export function isHttpError(e: unknown): e is HttpError {
    return typeof e === "object" && e !== null && "status" in e;
}

export function parsePositiveInt(value: string): number | null {
    const num = Number(value);

    // validar que sea entero y positivo
    if (!Number.isInteger(num) || num <= 0) {
        return null; // o lanza error según tu caso
    }

    return num;
}

export function isPositiveNumber(n: unknown): n is number {
    return typeof n === "number" && Number.isFinite(n) && n > 0;
}