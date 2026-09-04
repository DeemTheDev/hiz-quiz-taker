/**
 * POST /api/admin/logout - clear the admin session cookie and return to /admin.
 */

import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set({ ...sessionCookieOptions(), value: "", maxAge: 0 });
  return response;
}
