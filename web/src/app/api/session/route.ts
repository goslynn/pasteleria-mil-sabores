import { NextResponse } from "next/server";
import {destroySession, getSessionUserId} from "@/lib/auth";

export async function GET() {
    const sessionId = await getSessionUserId();
    return NextResponse.json({ userId: sessionId ?? null});
}

export async function DELETE() {
    await destroySession();
}
