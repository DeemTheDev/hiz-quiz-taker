/**
 * Minimal single-password admin auth (server-only).
 *
 * - Password lives in ADMIN_PASSWORD.
 * - Session cookie `hq_admin` = `<expiresAtMs>.<HMAC-SHA256(label:expiresAtMs, key=ADMIN_PASSWORD)>`.
 *   The signature covers the expiry, so a leaked cookie dies with it (7 days),
 *   and changing the password invalidates every session immediately.
 * - All comparisons are timing-safe over fixed-length SHA-256 digests, so
 *   length differences do not leak.
 */

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "hq_admin";
/** 7 days. */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const SESSION_LABEL = "hq-admin-session-v2";

function adminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  return pw && pw.length > 0 ? pw : null;
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Constant-time equality over the digests of two arbitrary strings. */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

function sign(pw: string, expiresAtMs: string): string {
  return createHmac("sha256", pw).update(`${SESSION_LABEL}:${expiresAtMs}`).digest("hex");
}

export function isAdminConfigured(): boolean {
  return adminPassword() !== null;
}

/** Timing-safe password check. Always false when ADMIN_PASSWORD is unset. */
export function verifyPassword(input: string): boolean {
  const pw = adminPassword();
  if (!pw || typeof input !== "string") return false;
  return safeEqual(input, pw);
}

/** Signed, expiring session token. */
export function sessionToken(expiresAtMs: number = Date.now() + SESSION_MAX_AGE_SECONDS * 1000): string {
  const pw = adminPassword();
  if (!pw) throw new Error("ADMIN_PASSWORD is not configured");
  const exp = String(Math.floor(expiresAtMs));
  return `${exp}.${sign(pw, exp)}`;
}

/** Validates a token string: well-formed, unexpired, correctly signed. */
export function verifySessionToken(value: string | undefined | null): boolean {
  const pw = adminPassword();
  if (!pw || !value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!/^\d{1,16}$/.test(exp) || sig.length !== 64) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(pw, exp));
}

/** True when the request carries a valid `hq_admin` session cookie. */
export async function isAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

/** Cookie attributes shared by login (set) and logout (clear). */
export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}
