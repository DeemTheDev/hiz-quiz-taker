/**
 * POST /api/submit - record a completed quiz attempt (anonymous).
 *
 * Redis budget per call: 2 (rate limit) + 15 (record) + 3 (aggregates) = 20
 * commands in 3 pipelined HTTP round-trips.
 */

import type { SubmitResponse } from "@/lib/types";
import { hashClientIp, SUBMIT_RATE_LIMIT } from "@/lib/server/rate-limit";
import { buildPublicStats, computePercentile, computeScore, validateSubmitPayload } from "@/lib/server/stats";
import { getStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Generous upper bound for a 10-answer JSON body. */
const MAX_BODY_BYTES = 4_096;
const NO_STORE = { "Cache-Control": "no-store" } as const;

function jsonError(status: number, error: string): Response {
  return Response.json({ ok: false, error }, { status, headers: NO_STORE });
}

/**
 * Only accept same-origin JSON. Third-party pages can still POST via no-cors
 * with text/plain; requiring application/json (a CORS-preflighted type) and a
 * matching Origin keeps casual stat-pollution out.
 */
function rejectForeign(request: Request): Response | null {
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.includes("application/json")) return jsonError(415, "unsupported_media_type");

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return jsonError(403, "cross_origin");
    } catch {
      return jsonError(403, "cross_origin");
    }
  }
  return null;
}

export async function POST(request: Request): Promise<Response> {
  const rejected = rejectForeign(request);
  if (rejected) return rejected;

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonError(413, "payload_too_large");
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return jsonError(413, "payload_too_large");
    body = JSON.parse(raw);
  } catch {
    return jsonError(400, "invalid_json");
  }

  const payload = validateSubmitPayload(body);
  if (!payload) return jsonError(400, "invalid_payload");

  // Never trust a client-provided score.
  const score = computeScore(payload.answers);

  const store = getStore();
  if (!store) {
    const res: SubmitResponse = {
      ok: true,
      score,
      percentile: null,
      stats: { available: false, reason: "not_configured" },
    };
    return Response.json(res, { headers: NO_STORE });
  }

  try {
    const allowed = await store.checkRateLimit(
      hashClientIp(request.headers),
      SUBMIT_RATE_LIMIT.limit,
      SUBMIT_RATE_LIMIT.windowSeconds,
    );
    if (!allowed) return jsonError(429, "rate_limited");

    await store.recordAttempt({
      answers: payload.answers,
      score,
      durationMs: payload.durationMs,
      timestamp: new Date(),
    });

    const aggregates = await store.readAggregates();
    const res: SubmitResponse = {
      ok: true,
      score,
      // Exclude the attempt we just recorded from its own comparison group.
      percentile: computePercentile(aggregates.scoreCounts, score, true),
      stats: buildPublicStats(aggregates),
    };
    return Response.json(res, { headers: NO_STORE });
  } catch (error) {
    // Log the message only: Upstash errors can embed the pipeline body.
    console.error("[api/submit] stats store error:", error instanceof Error ? error.message : "unknown error");
    const res: SubmitResponse = {
      ok: true,
      score,
      percentile: null,
      stats: { available: false, reason: "store_error" },
    };
    return Response.json(res, { headers: NO_STORE });
  }
}
