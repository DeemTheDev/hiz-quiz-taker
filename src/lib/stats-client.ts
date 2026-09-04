"use client";

import type { OptionIndex } from "@/data/questions";
import type { Stats, SubmitPayload, SubmitResponse } from "@/lib/types";

const UNAVAILABLE: Stats = { available: false, reason: "network" };

/** Fetch the public aggregate stats. Never throws. */
export async function fetchStats(signal?: AbortSignal): Promise<Stats> {
  try {
    const res = await fetch("/api/stats", { signal, cache: "no-store" });
    if (!res.ok) return UNAVAILABLE;
    const data = (await res.json()) as Stats;
    return data && typeof data === "object" && "available" in data ? data : UNAVAILABLE;
  } catch {
    return UNAVAILABLE;
  }
}

/**
 * Submit a completed attempt. Never throws. Returns null on network failure
 * so the UI can still show the locally-computed score.
 */
export async function submitAttempt(
  answers: OptionIndex[],
  durationMs?: number,
): Promise<SubmitResponse | null> {
  const clamped =
    durationMs === undefined || !Number.isFinite(durationMs)
      ? undefined
      : Math.min(3_600_000, Math.max(0, Math.round(durationMs)));
  const payload: SubmitPayload = { answers, durationMs: clamped };
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      keepalive: true,
    });
    if (!res.ok) return null;
    return (await res.json()) as SubmitResponse;
  } catch {
    return null;
  }
}
