import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserSessionPayload } from "./rbac";

const AUTH_SECRET = process.env.AUTH_SECRET || "gowithstudy-super-secure-dev-session-key-32chars";
const SECRET_KEY = new TextEncoder().encode(AUTH_SECRET);
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "gowithstudy_session";

// 30 days default, 60 days if remember me is true (ensures mobile & desktop persistence)
export const SESSION_DURATION_DEFAULT = 30 * 24 * 60 * 60; // 30 days in seconds
export const SESSION_DURATION_REMEMBER = 60 * 24 * 60 * 60; // 60 days in seconds
export const ADMIN_SESSION_DURATION = 8 * 60 * 60; // 8 hours absolute max for admin

export const ADMIN_COOKIE_NAME =
  process.env.ADMIN_SESSION_COOKIE_NAME ||
  (process.env.NODE_ENV === "production" ? "__Host-gws_admin" : "gws_admin");

/**
 * Hashes a plaintext password using bcrypt with salt rounds = 10.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 */
export async function comparePassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

/**
 * Creates and signs a secure JWT session token.
 */
export async function createSessionToken(
  payload: UserSessionPayload,
  durationSeconds: number = SESSION_DURATION_DEFAULT
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + durationSeconds)
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT session token and returns the payload.
 */
export async function verifySessionToken(
  token: string
): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as unknown as UserSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Sets an HttpOnly, secure, SameSite session cookie.
 * Configured so that mobile browsers and desktop browsers maintain persistent authentication.
 */
export async function setSessionCookie(
  token: string,
  durationSeconds: number = SESSION_DURATION_DEFAULT
): Promise<void> {
  try {
    const cookieStore = await cookies();
    const isHttps =
      (process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false) ||
      Boolean(process.env.VERCEL);
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      // Enforce secure flag in production HTTPS, allow local development testing from mobile Wi-Fi
      secure: process.env.NODE_ENV === "production" && isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: durationSeconds,
    });
  } catch {
    // Outside request store (e.g. testing)
  }
}

/**
 * Clears the session cookie on logout.
 */
export async function clearSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete("campusflow_session");
  } catch {
    // Outside request store
  }
}

/**
 * Reads and verifies the current session from incoming cookies.
 */
export async function getSession(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(COOKIE_NAME)?.value ||
      cookieStore.get("campusflow_session")?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Sets a hardened admin session cookie (__Host-gws_admin).
 * SameSite=Strict, Secure, HttpOnly, 8h max lifetime.
 */
export async function setAdminSessionCookie(
  token: string,
  durationSeconds: number = ADMIN_SESSION_DURATION
): Promise<void> {
  try {
    const cookieStore = await cookies();
    const isHttps =
      (process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false) ||
      Boolean(process.env.VERCEL);

    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && isHttps,
      sameSite: "strict",
      path: "/",
      maxAge: durationSeconds,
    });
  } catch {
    // Outside request store (e.g. testing)
  }
}

/**
 * Clears the dedicated admin session cookie.
 */
export async function clearAdminSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
    cookieStore.delete("gws_admin");
  } catch {
    // Outside request store
  }
}

/**
 * Reads and verifies the dedicated admin session cookie.
 */
export async function getAdminSession(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(ADMIN_COOKIE_NAME)?.value ||
      cookieStore.get("gws_admin")?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
