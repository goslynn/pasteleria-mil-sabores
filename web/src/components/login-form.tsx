"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useActionState } from "react";
import { SimpleState } from "@/types/general";
import { PasswInput } from "@/components/ui/passw-input";
import Link from "next/link";

export function LoginForm(
    {
        className,
        action,
        ...props
    }: React.ComponentProps<"div"> & {
        action: (prev: SimpleState, formData: FormData) => Promise<SimpleState>;
    }
) {
    const [state, formAction] = useActionState<SimpleState, FormData>(action, { ok: false });

    return (
        // Contenedor centrado vertical y horizontalmente
        <div
            className={cn(
                "min-h-[70vh] w-full mx-auto flex flex-col items-center justify-center gap-6",
                className
            )}
            {...props}
        >
            {/* Card acotado y centrado */}
            <Card className="w-full max-w-md overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                    {/* conectar el dispatcher del hook como action del <form> */}
                    <form className="flex flex-col gap-6" action={formAction}>
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
                            <p className="text-muted-foreground text-balance">Inicia Sesión</p>
                        </div>

                        {/* error de la action */}
                        {state?.error && (
                            <p className="text-red-600 text-sm" role="alert">
                                {state.error}
                            </p>
                        )}

                        <div className="grid gap-3">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                name="email"
                                required
                                autoComplete="email"
                                inputMode="email"
                            />
                        </div>

                        <div className="grid gap-3">
                            <div className="flex items-center">
                                <Label htmlFor="password">Contraseña</Label>
                                <Link
                                    href="#"
                                    className="ml-auto text-sm underline-offset-2 hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <PasswInput id="password" name="password" required autoComplete="current-password" />
                        </div>

                        <Button type="submit" className="w-full">
                            Iniciar sesión
                        </Button>

                        <div className="text-center text-sm">
                            ¿No tienes una cuenta?{" "}
                            <Link href="/auth/signup" className="underline underline-offset-4">
                                Regístrate
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                Al continuar, aceptas nuestros <a href="#">Términos de servicio</a> y nuestra{" "}
                <a href="#">Política de privacidad</a>.
            </div>
        </div>
    );
}
