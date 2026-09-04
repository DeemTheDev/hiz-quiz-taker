/**
 * Pure statistics helpers (no I/O). Safe to unit test in isolation.
 */

import { QUESTIONS, QUESTION_COUNT, type OptionIndex } from "@/data/questions";
import { MIN_PARTICIPANTS_FOR_STATS, type PublicStats, type SubmitPayload } from "@/lib/types";
import type { Aggregates } from "./store";

/** Upper bound accepted for `durationMs` (1 hour). */
export const MAX_DURATION_MS = 3_600_000;
const SCORE_BUCKETS = QUESTION_COUNT + 1;

function sum(values: readonly number[]): number {
  let s = 0;
  for (const v of values) s += v;
  return s;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Copy `counts` into a fixed-length, non-negative integer array. */
function normaliseCounts(counts: readonly number[] | undefined, length: number): number[] {
  const out = new Array<number>(length).fill(0);
  if (!counts) return out;
  for (let i = 0; i < length; i++) {
    const v = counts[i];
    out[i] = typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }
  return out;
}

/** Server-side score: one point per answer equal to that question's correctIndex. */
export function computeScore(answers: readonly number[]): number {
  let score = 0;
  for (let i = 0; i < QUESTIONS.length; i++) {
    if (answers[i] === QUESTIONS[i].correctIndex) score += 1;
  }
  return score;
}

/** Shape aggregates into the public, anonymous stats contract. */
export function buildPublicStats(agg: Aggregates): PublicStats {
  const scoreDistribution = normaliseCounts(agg.scoreCounts, SCORE_BUCKETS);
  const distributionTotal = sum(scoreDistribution);
  const weighted = scoreDistribution.reduce((acc, count, score) => acc + count * score, 0);
  const average = distributionTotal > 0 ? Math.round((weighted / distributionTotal) * 10) / 10 : 0;

  const questionCorrectPct = QUESTIONS.map((question, q) => {
    const counts = normaliseCounts(agg.optionCounts[q], 4);
    const attempts = sum(counts);
    if (attempts === 0) return 0;
    return clamp(Math.round((counts[question.correctIndex] / attempts) * 100), 0, 100);
  });

  const total =
    typeof agg.total === "number" && Number.isFinite(agg.total) && agg.total > 0
      ? Math.floor(agg.total)
      : 0;

  return { available: true, total, average, scoreDistribution, questionCorrectPct };
}

/**
 * Percent of OTHER participants who scored strictly lower than `score`.
 * When `excludeSelf` is true the caller's own attempt (already recorded) is
 * removed from its bucket first. Returns null when fewer than
 * MIN_PARTICIPANTS_FOR_STATS other participants exist.
 */
export function computePercentile(
  scoreCounts: readonly number[],
  score: number,
  excludeSelf: boolean,
): number | null {
  const counts = normaliseCounts(scoreCounts, SCORE_BUCKETS);
  const s = clamp(Math.round(score), 0, QUESTION_COUNT);
  if (excludeSelf && counts[s] > 0) counts[s] -= 1;

  const others = sum(counts);
  if (others < MIN_PARTICIPANTS_FOR_STATS) return null;

  let lower = 0;
  for (let i = 0; i < s; i++) lower += counts[i];
  return clamp(Math.round((lower / others) * 100), 0, 100);
}

/** Median score from a distribution; null when there is no data. */
export function computeMedian(scoreCounts: readonly number[]): number | null {
  const counts = normaliseCounts(scoreCounts, SCORE_BUCKETS);
  const total = sum(counts);
  if (total === 0) return null;

  const pick = (rank: number): number => {
    // rank is 1-based position in the sorted list of scores
    let seen = 0;
    for (let s = 0; s < counts.length; s++) {
      seen += counts[s];
      if (seen >= rank) return s;
    }
    return counts.length - 1;
  };

  if (total % 2 === 1) return pick((total + 1) / 2);
  return (pick(total / 2) + pick(total / 2 + 1)) / 2;
}

/** Share of attempts in the "Prevention Champion" tier (score 9-10), 0-100 integer. */
export function computeChampionPct(scoreCounts: readonly number[]): number | null {
  const counts = normaliseCounts(scoreCounts, SCORE_BUCKETS);
  const total = sum(counts);
  if (total === 0) return null;
  const champions = (counts[9] ?? 0) + (counts[10] ?? 0);
  return clamp(Math.round((champions / total) * 100), 0, 100);
}

/** Compact 10-character tick/cross string, e.g. "✓✓✗✓✓✓✗✓✓✓". */
export function answerPattern(answers: readonly number[]): string {
  let out = "";
  for (let i = 0; i < QUESTIONS.length; i++) {
    out += answers[i] === QUESTIONS[i].correctIndex ? "✓" : "✗";
  }
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionIndex(value: unknown): value is OptionIndex {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 3;
}

/**
 * Strict validation of the submit body. Returns a clean payload or null.
 *  - answers: array of exactly QUESTION_COUNT integers in 0..3
 *  - durationMs: optional finite number in [0, MAX_DURATION_MS]
 */
export function validateSubmitPayload(body: unknown): SubmitPayload | null {
  if (!isRecord(body)) return null;

  const { answers } = body;
  if (!Array.isArray(answers) || answers.length !== QUESTION_COUNT) return null;
  const clean: OptionIndex[] = [];
  for (const a of answers) {
    if (!isOptionIndex(a)) return null;
    clean.push(a);
  }

  const payload: SubmitPayload = { answers: clean };

  if ("durationMs" in body && body.durationMs !== undefined) {
    const d = body.durationMs;
    if (typeof d !== "number" || !Number.isFinite(d) || d < 0 || d > MAX_DURATION_MS) return null;
    payload.durationMs = Math.round(d);
  }

  return payload;
}
