import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/journal-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/auth/journal/check — lightweight session validity check */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  return NextResponse.json({ authenticated: true });
}
