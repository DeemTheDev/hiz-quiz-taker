/**
 * Shared contract between the quiz UI and the anonymous stats API.
 * No personal data ever crosses this boundary.
 */

import type { OptionIndex } from "@/data/questions";

/** What the client sends when a quiz attempt is completed. */
export interface SubmitPayload {
  /**
   * Canonical option index chosen for each of the 10 questions, in question
   * order (0 = the correct option, 1-3 = the distractors). Length must be 10.
   */
  answers: OptionIndex[];
  /** Wall-clock time from first question shown to last answer, in ms. Optional. */
  durationMs?: number;
}

/** Aggregate, anonymous statistics. */
export interface PublicStats {
  available: true;
  /** Total number of completed attempts recorded. */
  total: number;
  /** Mean score out of 10, rounded to 1 decimal. */
  average: number;
  /** scoreDistribution[s] = number of attempts that scored exactly s (length 11). */
  scoreDistribution: number[];
  /** questionCorrectPct[i] = % of attempts that got question i (0-based) right, 0-100 integer. */
  questionCorrectPct: number[];
}

export interface StatsUnavailable {
  available: false;
  reason?: string;
}

export type Stats = PublicStats | StatsUnavailable;

/** Response to POST /api/submit */
export interface SubmitResponse {
  ok: boolean;
  /** Server-computed score (0-10) from the submitted answers. */
  score: number;
  /**
   * Percent of OTHER participants who scored strictly lower than this attempt,
   * 0-100 integer. null when there aren't enough participants to be meaningful.
   */
  percentile: number | null;
  stats: Stats;
}

/** Response to GET /api/stats */
export type StatsResponse = Stats;

/** Minimum participant count before we show averages/percentiles to users. */
export const MIN_PARTICIPANTS_FOR_STATS = 5;
