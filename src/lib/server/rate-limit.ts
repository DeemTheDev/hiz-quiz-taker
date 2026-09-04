/**
 * Privacy-preserving rate-limit keys (server-only).
 *
 * The client IP is used ONLY to derive a salted SHA-256 hash for a short-lived
 * rate-limit counter. It is never stored with submissions and never logged.
 */

import { createHash } from "node:crypto";

/** Quiz submissions: 20 attempts per hour per client. */
export const SUBMIT_RATE_LIMIT = { limit: 20, windowSeconds: 3_600 } as const;
/** Admin login attempts: 10 per 15 minutes per client. */
export const LOGIN_RATE_LIMIT = { limit: 10, windowSeconds: 900 } as const;

/**
 * Best-effort client IP: first entry of `x-forwarded-for` (Vercel sets this),
 * then `x-real-ip`, else "unknown".
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

/** sha256(ip + RATE_LIMIT_SALT) as hex. The raw IP never leaves this function. */
export function hashClientIp(headers: Headers): string {
  const salt = process.env.RATE_LIMIT_SALT ?? "";
  return createHash("sha256").update(clientIp(headers) + salt).digest("hex");
}
