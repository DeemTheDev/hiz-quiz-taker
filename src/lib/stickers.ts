"use client";

/**
 * Sticker Book (achievements) + personal best. Device-local only (localStorage),
 * never sent anywhere. None of the six stickers rewards a low score.
 */

import type { StickerKey } from "@/lib/copy";

const STICKERS_KEY = "hq:stickers";
const BEST_KEY = "hq:best";

export const STICKER_ORDER: readonly StickerKey[] = [
  "first-run",
  "pro",
  "champion",
  "perfect",
  "hot-streak",
  "comeback",
];

export function loadStickers(): Set<StickerKey> {
  try {
    const raw = localStorage.getItem(STICKERS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((k): k is StickerKey => STICKER_ORDER.includes(k as StickerKey)));
  } catch {
    return new Set();
  }
}

export function saveStickers(set: Set<StickerKey>): void {
  try {
    localStorage.setItem(STICKERS_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function loadBest(): number | null {
  try {
    const v = localStorage.getItem(BEST_KEY);
    if (v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function saveBest(score: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    /* ignore */
  }
}

export interface RunSummary {
  score: number;
  bestStreak: number;
}

/**
 * Apply a finished run: updates stickers + best in storage and returns the
 * newly earned sticker keys (in display order) and the previous best.
 */
export interface RunResult {
  /** newly earned sticker keys, in display order */
  earned: StickerKey[];
  previousBest: number | null;
  best: number;
}

export function applyRun(run: RunSummary): RunResult {
  const have = loadStickers();
  const previousBest = loadBest();
  const earned: StickerKey[] = [];

  const award = (k: StickerKey, cond: boolean) => {
    if (cond && !have.has(k)) {
      have.add(k);
      earned.push(k);
    }
  };

  award("first-run", true);
  award("pro", run.score >= 7);
  award("champion", run.score >= 9);
  award("perfect", run.score === 10);
  award("hot-streak", run.bestStreak >= 5);
  award("comeback", previousBest !== null && run.score > previousBest);

  saveStickers(have);
  const best = Math.max(previousBest ?? 0, run.score);
  saveBest(best);

  return { earned: STICKER_ORDER.filter((k) => earned.includes(k)), previousBest, best };
}
