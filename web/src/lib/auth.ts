import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const {AUTH_SECRET, SESSION_COOKIE_NAME} = process.env;
if (!AUTH_SECRET) {
    throw new Error("AUTH_SECRET no definido o demasiado corto. Define uno fuerte en .env(.local).");
}

const secret = new TextEncoder().encode(AUTH_SECRET);
const cookieName = SESSION_COOKIE_NAME ?? "session";


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

    const cookieStore = await cookies();
    cookieStore.set(cookieName, token, COOKIE_OPTIONS);
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(cookieName);
}

export async function getSessionUserId(): Promise<number | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, secret);
        const sub = payload.sub;
        return sub ? parseInt(String(sub), 10) : null;
    } catch {
        return null;
    }
}
