/**
 * GET /api/admin/export - CSV of every retained submission (admin only).
 *
 * Columns: timestamp_iso, score, duration_ms, q1..q10 (canonical option index
 * chosen), q1_correct..q10_correct (1/0). Capped at 50,000 rows.
 */

import { QUESTIONS } from "@/data/questions";
import { isAuthenticated } from "@/lib/server/admin-auth";
import { getStore, MAX_SUBMISSIONS, type RawSubmission } from "@/lib/server/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" } as const;

const HEADER = [
  "timestamp_iso",
  "score",
  "duration_ms",
  ...QUESTIONS.map((q) => `q${q.id}`),
  ...QUESTIONS.map((q) => `q${q.id}_correct`),
].join(",");

/** Timestamps are machine generated, but never trust stored data blindly. */
function safeTimestamp(value: string): string {
  return /^[0-9T:.Z+-]{1,40}$/.test(value) ? value : "";
}

function toCsvRow(sub: RawSubmission): string {
  const answers = QUESTIONS.map((_, i) => {
    const a = sub.a[i];
    return Number.isInteger(a) && a >= 0 && a <= 3 ? String(a) : "";
  });
  const correct = QUESTIONS.map((q, i) => (sub.a[i] === q.correctIndex ? "1" : "0"));
  const duration = typeof sub.d === "number" && Number.isFinite(sub.d) ? String(Math.round(sub.d)) : "";
  const score = Number.isInteger(sub.s) ? String(sub.s) : "";
  return [safeTimestamp(sub.t), score, duration, ...answers, ...correct].join(",");
}

export async function GET(): Promise<Response> {
  if (!(await isAuthenticated())) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const store = getStore();
  if (!store) {
    return Response.json(
      { ok: false, error: "not_configured" },
      { status: 503, headers: NO_STORE },
    );
  }

  try {
    const rows = (await store.readAll()).slice(0, MAX_SUBMISSIONS);
    const lines = [HEADER];
    for (const row of rows) lines.push(toCsvRow(row));
    const csv = lines.join("\r\n") + "\r\n";

    return new Response(csv, {
      status: 200,
      headers: {
        ...NO_STORE,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="hiv-quiz-submissions.csv"',
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    console.error("[api/admin/export] stats store error:", error);
    return Response.json({ ok: false, error: "store_error" }, { status: 500, headers: NO_STORE });
  }
}
