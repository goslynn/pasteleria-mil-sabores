"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-gradient-to-b from-white to-zinc-100">
      <Card className="w-full max-w-xl shadow-xl">
        <CardContent className="p-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Hola Mundo</h1>
          <p className="text-zinc-600 mb-6">
            ¡Tu proyecto Next.js está vivo! Edita{" "}
            <code className="font-mono">src/app/page.tsx</code>.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => alert("¡Bienvenido a Next.js!")}>
              Probar botón
            </Button>
            <a
              href="https://nextjs.org/docs"
              className="underline underline-offset-4 text-sm"
              target="_blank"
              rel="noreferrer"
            >
              Ver documentación
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
