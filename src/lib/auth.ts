import { SignJWT, jwtVerify } from "jose";

const secretString =
  process.env.AUTH_SECRET || "qrovia-dev-secret-do-not-use-in-production";
const secret = new TextEncoder().encode(secretString);

export const SESSION_COOKIE = "qrovia_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function createSessionToken(userId: number, email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<{
  userId: number;
  email: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return { userId: Number(payload.sub), email: String(payload.email ?? "") };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production" && process.env.FORCE_INSECURE_COOKIE !== "1",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
