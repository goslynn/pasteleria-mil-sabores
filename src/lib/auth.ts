import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const rawSecret = process.env.AUTH_SECRET;
if (!rawSecret) {
    throw new Error("AUTH_SECRET no definido o demasiado corto. Define uno fuerte en .env(.local).");
}
const secret = new TextEncoder().encode(rawSecret);
const COOKIE_NAME = "session";

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días (en segundos)
};

export async function hashPassword(plain: string) {
    return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
}

export async function createSession(userId: number) {
    const token = await new SignJWT({ sub: String(userId) })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);

    // Next 15: cookies() es async; aquí sí puedes escribir cookies (Server Action/Route Handler)
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function destroySession() {
    const cookieStore = await cookies();
    // opción A (recomendada):
    cookieStore.delete(COOKIE_NAME);
    // opción B:
    // cookieStore.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSessionUserId(): Promise<number | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, secret);
        const sub = payload.sub;
        return sub ? parseInt(String(sub), 10) : null;
    } catch {
        return null;
    }
}
