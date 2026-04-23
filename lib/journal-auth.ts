import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "journal_session";
const JWT_EXPIRY = "7d";

function getSecret(): Uint8Array {
  const secret = process.env.JOURNAL_JWT_SECRET;
  if (!secret) throw new Error("Missing JOURNAL_JWT_SECRET environment variable");
  return new TextEncoder().encode(secret);
}

/** Creates a signed JWT and returns it as a string */
export async function signJwt(): Promise<string> {
  return new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret());
}

/** Verifies a JWT string. Returns the payload or null if invalid/expired. */
export async function verifyJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

/** Sets the session cookie on a NextResponse */
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });
  return response;
}

/** Clears the session cookie */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}

/** 
 * Middleware helper: reads the session cookie from the request and verifies it.
 * Returns null if valid, or a NextResponse(401) if not.
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }
  return null;
}
