import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import {destroySession} from "@/lib/auth";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export async function GET() {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ userId: null });

    try {
        const { payload } = await jwtVerify(token, secret);
        const sub = payload.sub ? parseInt(String(payload.sub), 10) : null;
        return NextResponse.json({ userId: sub });
    } catch {
        return NextResponse.json({ userId: null });
    }
}

export async function DELETE() {
    await destroySession();
}
