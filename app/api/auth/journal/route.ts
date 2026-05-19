import { NextRequest, NextResponse } from "next/server";
import { signJwt, setSessionCookie, clearSessionCookie } from "@/lib/journal-auth";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

type RateLimitRecord = {
  count: number;
  retryAfter: number;
};

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();

  return forwardedFor || realIp || "unknown";
}

function getRateLimitKey(identifier: string): string {
  return `journal:auth:attempts:${identifier}`;
}

async function getRateLimitRecord(identifier: string): Promise<RateLimitRecord> {
  const redis = getRedis();
  const key = getRateLimitKey(identifier);
  const count = Number((await redis.get<number>(key)) ?? 0);
  const ttl = count > 0 ? await redis.ttl(key) : RATE_LIMIT_WINDOW_SECONDS;

  return {
    count,
    retryAfter: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS,
  };
}

async function recordFailedAttempt(identifier: string): Promise<RateLimitRecord> {
  const redis = getRedis();
  const key = getRateLimitKey(identifier);
  await redis.set(key, 0, { nx: true, ex: RATE_LIMIT_WINDOW_SECONDS });

  const count = await redis.incr(key);
  let retryAfter = await redis.ttl(key);

  if (retryAfter <= 0) {
    await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    retryAfter = RATE_LIMIT_WINDOW_SECONDS;
  }

  return { count, retryAfter };
}

async function clearFailedAttempts(identifier: string) {
  await getRedis().del(getRateLimitKey(identifier));
}

function getRateLimitResponse(record: RateLimitRecord) {
  return NextResponse.json(
    { error: "Too many password attempts. Please try again later.", retryAfter: record.retryAfter },
    {
      status: 429,
      headers: { "Retry-After": String(record.retryAfter) },
    }
  );
}

/** POST /api/auth/journal — verify password, set session cookie */
export async function POST(request: NextRequest) {
  try {
    const clientIdentifier = getClientIdentifier(request);
    const rateLimitRecord = await getRateLimitRecord(clientIdentifier);

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
      const failedAttemptRecord = await recordFailedAttempt(clientIdentifier);

      // Small delay to mitigate brute-force
      await new Promise((r) => setTimeout(r, 300));

      if (failedAttemptRecord.count >= RATE_LIMIT_MAX_ATTEMPTS) {
        return getRateLimitResponse(failedAttemptRecord);
      }

      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    await clearFailedAttempts(clientIdentifier);

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
