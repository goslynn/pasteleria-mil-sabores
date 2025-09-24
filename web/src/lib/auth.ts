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

    const jar = await cookies();
    jar.set(cookieName, token, COOKIE_OPTIONS);
}

export async function destroySession() {
    const jar = await cookies();
    jar.delete(cookieName);
}

export async function getSessionUserId(): Promise<number | null> {
    const jar = await cookies();
    const token = jar.get(cookieName)?.value;

    console.debug("session token:", token);

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, secret);
        const sub = payload.sub;
        const userId = typeof sub === "string" ? Number(sub) : Number(sub as unknown);
        return Number.isFinite(userId) ? userId : null;
    } catch {
        return null;
    }
}
