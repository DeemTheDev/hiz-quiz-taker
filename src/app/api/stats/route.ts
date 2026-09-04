/**
 * GET /api/stats - public, anonymous aggregate statistics.
 *
 * Redis budget: 3 commands in ONE pipelined round-trip. The response is
 * edge-cacheable for 30s (stale for a further 120s) so traffic spikes are
 * absorbed by Vercel's CDN rather than Redis.
 */

import type { StatsResponse } from "@/lib/types";
import { buildPublicStats } from "@/lib/server/stats";
import { getStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHEABLE = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
} as const;
const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET(): Promise<Response> {
  const store = getStore();
  if (!store) {
    const res: StatsResponse = { available: false, reason: "not_configured" };
    return Response.json(res, { headers: CACHEABLE });
  }

  try {
    const aggregates = await store.readAggregates();
    const res: StatsResponse = buildPublicStats(aggregates);
    return Response.json(res, { headers: CACHEABLE });
  } catch (error) {
    console.error("[api/stats] stats store error:", error);
    const res: StatsResponse = { available: false, reason: "store_error" };
    // Do not let the edge cache a transient failure.
    return Response.json(res, { headers: NO_STORE });
  }
}
