"use client";

import { useEffect, useState } from "react";
import type { OptionIndex } from "@/data/questions";
import { fetchStats, submitAttempt } from "@/lib/stats-client";
import type { Stats, SubmitResponse } from "@/lib/types";

/** Public aggregate stats, fetched once on mount. `null` while loading. */
export function useStats(enabled = true) {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const ac = new AbortController();
    fetchStats(ac.signal).then((s) => {
      if (!ac.signal.aborted) setStats(s);
    });
    return () => ac.abort();
  }, [enabled]);
  return stats;
}

const SUBMITTED_KEY = "hq:submitted:v1";

/**
 * One in-flight/settled submission per attempt seed, shared across remounts
 * (StrictMode double effects, screen re-renders) so an attempt is never
 * recorded twice.
 */
const submissions = new Map<number, Promise<SubmitResponse | null>>();

function wasSubmitted(seed: number): boolean {
  try {
    return sessionStorage.getItem(SUBMITTED_KEY) === String(seed);
  } catch {
    return false;
  }
}

function markSubmitted(seed: number) {
  try {
    sessionStorage.setItem(SUBMITTED_KEY, String(seed));
  } catch {
    /* ignore */
  }
}

function clearSubmitted(seed: number) {
  try {
    if (sessionStorage.getItem(SUBMITTED_KEY) === String(seed)) sessionStorage.removeItem(SUBMITTED_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Submit a finished attempt exactly once per attempt seed (survives reloads via
 * sessionStorage). `settled` becomes true when the request has finished, even
 * if it failed (`result` stays null in that case).
 */
export function useSubmitResult(args: {
  active: boolean;
  seed: number;
  answers: OptionIndex[];
  durationMs?: number;
}) {
  const { active, seed, answers, durationMs } = args;
  const [state, setState] = useState<{ result: SubmitResponse | null; settled: boolean }>({
    result: null,
    settled: false,
  });

  useEffect(() => {
    if (!active || answers.length === 0) return;
    let cancelled = false;

    let promise = submissions.get(seed);
    if (!promise) {
      if (wasSubmitted(seed)) {
        // Already recorded (page reload): just fetch public stats for display.
        promise = fetchStats().then(
          (stats): SubmitResponse => ({
            ok: true,
            score: answers.filter((a) => a === 0).length,
            percentile: null,
            stats,
          }),
        );
      } else {
        // Mark BEFORE sending so a reload mid-flight cannot double-count; undo
        // the mark only on a network-level failure so a later reload can retry.
        markSubmitted(seed);
        promise = submitAttempt(answers, durationMs).then((res) => {
          if (res === null) clearSubmitted(seed);
          return res;
        });
      }
      submissions.set(seed, promise);
    }

    promise.then((res) => {
      if (!cancelled) setState({ result: res, settled: true });
    });
    return () => {
      cancelled = true;
    };
  }, [active, seed, answers, durationMs]);

  return state;
}
