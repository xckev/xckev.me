import { NextRequest, NextResponse } from "next/server";
import { signJwt, setSessionCookie, clearSessionCookie } from "@/lib/journal-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  journalAuthAttempts?: Map<string, RateLimitRecord>;
};

const authAttempts =
  globalForRateLimit.journalAuthAttempts ?? new Map<string, RateLimitRecord>();
globalForRateLimit.journalAuthAttempts = authAttempts;

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();

  return forwardedFor || realIp || "unknown";
}

function getRateLimitRecord(identifier: string, now = Date.now()): RateLimitRecord {
  const record = authAttempts.get(identifier);
  if (!record || record.resetAt <= now) {
    const newRecord = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    authAttempts.set(identifier, newRecord);
    return newRecord;
  }

  return record;
}

function getRateLimitResponse(record: RateLimitRecord, now = Date.now()) {
  const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return NextResponse.json(
    { error: "Too many password attempts. Please try again later.", retryAfter },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}

/** POST /api/auth/journal — verify password, set session cookie */
export async function POST(request: NextRequest) {
  try {
    const clientIdentifier = getClientIdentifier(request);
    const rateLimitRecord = getRateLimitRecord(clientIdentifier);

    if (rateLimitRecord.count >= RATE_LIMIT_MAX_ATTEMPTS) {
      return getRateLimitResponse(rateLimitRecord);
    }

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
      rateLimitRecord.count += 1;

      // Small delay to mitigate brute-force
      await new Promise((r) => setTimeout(r, 300));

      if (rateLimitRecord.count >= RATE_LIMIT_MAX_ATTEMPTS) {
        return getRateLimitResponse(rateLimitRecord);
      }

      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    authAttempts.delete(clientIdentifier);

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
