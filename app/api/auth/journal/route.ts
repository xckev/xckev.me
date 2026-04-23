import { NextRequest, NextResponse } from "next/server";
import { signJwt, setSessionCookie, clearSessionCookie } from "@/lib/journal-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/auth/journal — verify password, set session cookie */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const correctPassword = process.env.JOURNAL_PASSWORD;
    if (!correctPassword) {
      console.error("JOURNAL_PASSWORD env var is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (password !== correctPassword) {
      // Small delay to mitigate brute-force
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = await signJwt();
    const response = NextResponse.json({ ok: true });
    return setSessionCookie(response, token);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE /api/auth/journal — clear session cookie (logout) */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  return clearSessionCookie(response);
}
