/**
 * POST /api/admin/login - form login (application/x-www-form-urlencoded, field `password`).
 *
 * Success: sets the `hq_admin` session cookie and 303-redirects to /admin.
 * Failure: 303-redirects to /admin?error=1 (bad password) or ?error=2 (too many attempts).
 */

import { NextResponse } from "next/server";
import {
  isAdminConfigured,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieOptions,
  sessionToken,
  verifyPassword,
} from "@/lib/server/admin-auth";
import { hashClientIp, LOGIN_RATE_LIMIT } from "@/lib/server/rate-limit";
import { getStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);

  if (!isAdminConfigured()) return redirectTo("/admin");

  // Brute-force protection: reuse the stats store's fixed-window limiter.
  // Fail open if the store is unavailable so an outage cannot lock admins out.
  const store = getStore();
  if (store) {
    try {
      const allowed = await store.checkRateLimit(
        `login:${hashClientIp(request.headers)}`,
        LOGIN_RATE_LIMIT.limit,
        LOGIN_RATE_LIMIT.windowSeconds,
      );
      if (!allowed) return redirectTo("/admin?error=2");
    } catch (error) {
      console.error("[api/admin/login] rate limit check failed:", error);
    }
  }

  let password = "";
  try {
    const form = await request.formData();
    const value = form.get("password");
    password = typeof value === "string" ? value : "";
  } catch {
    return redirectTo("/admin?error=1");
  }

  if (!password || !verifyPassword(password)) return redirectTo("/admin?error=1");

  const response = redirectTo("/admin");
  response.cookies.set({
    ...sessionCookieOptions(),
    value: sessionToken(),
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
