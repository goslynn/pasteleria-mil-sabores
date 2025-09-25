// app/api/debug/route.ts
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // evita caché en dev y ISR en esta ruta
export const runtime = "nodejs"; // si usas APIs de Node (fs, net, etc.). Quita si usas Edge.

function safeError(err: unknown) {
    if (err instanceof Error) {
        return {
            name: err.name,
            message: err.message,
            stack: err.stack,
            cause: (err as any).cause ?? null,
        };
    }
    try {
        return JSON.parse(JSON.stringify(err));
    } catch {
        return { nonSerializable: String(err) };
    }
}

export async function GET(req: NextRequest) {
    try {
        // Sanity check del entorno
        const url = new URL(req.url);
        const now = new Date().toISOString();

        // Si quieres probar un fetch interno, descomenta y ajusta:
        // const r = await fetch(process.env.STRAPI_HOST + "/api/brand?populate=*", {
        //   headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN ?? ""}` },
        //   // Evita que Next cachee resultados mientras debuggeas:
        //   cache: "no-store",
        // });
        // const sample = await r.json();

        return NextResponse.json({
            ok: true,
            message: "Debug endpoint OK",
            now,
            pathname: url.pathname,
            // sample,
            envPresent: {
                STRAPI_HOST: !!process.env.STRAPI_HOST,
                STRAPI_TOKEN: !!process.env.STRAPI_TOKEN,
                NODE_ENV: process.env.NODE_ENV,
            },
        });
    } catch (err) {
        // Log completo al server (terminal)
        console.error("[/api/debug] ERROR:", err);

        // Respuesta “amigable” al cliente
        return NextResponse.json(
            { ok: false, error: safeError(err) },
            { status: 500 },
        );
    }
}