import { getInitials } from "@/lib/utils";

export interface UsuarioDTO {
    idUsuario: number,
    nombre: string,
    email: string,
    password?: string | null,
    fechaNacimiento: Date,
    createdAt: Date
}

export class Usuario {
    private readonly u : UsuarioDTO;

    constructor(u : UsuarioDTO) {
        this.u = u;
    }

    get idUsuario() { return this.u.idUsuario; }
    get nombre() { return this.u.nombre; }
    get email() { return this.u.email; }
    get fechaNacimiento() { return this.u.fechaNacimiento; }


    /**
     * Edad exacta en años a una fecha de referencia (hoy por defecto).
     * Regla: resta 1 si aún no cumple años este año.
     */
    age(on: Date = new Date()): number {
        const b = this.u.fechaNacimiento;
        let years = on.getFullYear() - b.getFullYear();
        const hasHadBirthdayThisYear =
            on.getMonth() > b.getMonth() ||
            (on.getMonth() === b.getMonth() && on.getDate() >= b.getDate());
        if (!hasHadBirthdayThisYear) years--;
        return years;
    }

    /**
     * ¿Es el cumpleaños en la fecha 'on'?
     * Maneja 29/Feb según opción: "exact" (default), "feb28" o "mar1".
     * Parametro on por defecto equivale al dia de hoy
     */
    isBirthday(
        on: Date = new Date(),
        opts: { treatFeb29As?: "exact" | "feb28" | "mar1" } = {}
    ): boolean {
        const b = this.u.fechaNacimiento;
        const feb29 = b.getMonth() === 1 && b.getDate() === 29;
        if (feb29) {
            const leap = isLeap(on.getFullYear());
            const mode = opts.treatFeb29As ?? "exact";
            if (mode === "exact") return leap && on.getMonth() === 1 && on.getDate() === 29;
            if (mode === "feb28") return on.getMonth() === 1 && on.getDate() === (leap ? 29 : 28);
            if (mode === "mar1")  return on.getMonth() === 2 && on.getDate() === 1;
        }
        return on.getMonth() === b.getMonth() && on.getDate() === b.getDate();
    }

    /**
     * retorna el dominio del email.
     * de un email sample@org.com retornamos @org.com
     */
    emailDomain(): string {
        const at = this.u.email.lastIndexOf("@");
        return at >= 0 ? this.u.email.slice(at).toLowerCase() : "";
    }

    /** ¿Cumple una edad mínima? (por ejemplo, ≥ 50) */
    isAtLeastAge(min: number, on: Date = new Date()): boolean {
        return this.age(on) >= min;
    }

    getInitials() {
        return getInitials(this.u.nombre);
    }

    /** Devuelve el DTO original. */
    toDTO(): UsuarioDTO { return this.u; }

}

function isLeap(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

