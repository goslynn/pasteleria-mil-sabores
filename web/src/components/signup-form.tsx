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

export function SignupForm({
                               className,
                               action,
                               ...props
                           }: React.ComponentProps<"div"> & {
    action: (prev: SimpleState, formData: FormData) => Promise<SimpleState>;
}) {
    const [state, formAction] = useActionState<SimpleState, FormData>(action, {
        ok: false,
    });

    return (
        <div
            className={cn(
                "min-h-[70vh] w-full mx-auto flex flex-col items-center justify-center gap-6",
                className
            )}
            {...props}
        >
            <Card className="w-full max-w-md overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                    <form className="flex flex-col gap-6" action={formAction}>
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-2xl font-bold">Crear una cuenta</h1>
                            <p className="text-muted-foreground text-balance">
                                Ingresa tu información para registrarte
                            </p>
                        </div>

                        {/* error devuelto por la action */}
                        {state?.error && (
                            <p className="text-red-600 text-sm" role="alert">
                                {state.error}
                            </p>
                        )}

                        <div className="grid gap-3">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                name="nombre"
                                id="name"
                                type="text"
                                placeholder="Tu nombre"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="email">Correo electrónico *</Label>
                            <Input
                                name="email"
                                id="email"
                                type="email"
                                placeholder="tucorreo@ejemplo.com"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="fecha_nacimiento">Fecha de nacimiento *</Label>
                            <Input
                                name="fecha_nacimiento"
                                id="fecha_nacimiento"
                                type="date"
                                required
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="password">Contraseña *</Label>
                            <PasswInput name="password" id="password" required />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="confirm-password">Confirmar contraseña *</Label>
                            <PasswInput
                                name="confirm-password"
                                id="confirm-password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Registrarse
                        </Button>

                        <div className="text-center text-sm">
                            ¿Ya tienes una cuenta?{" "}
                            <Link
                                href="/auth/login"
                                className="underline underline-offset-4"
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                Al hacer clic en continuar, estarás aceptando nuestros{" "}
                <a href="#">Términos de servicio</a> y nuestra{" "}
                <a href="#">Política de privacidad</a>.
            </div>
        </div>
    );
}
