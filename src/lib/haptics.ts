"use client";

/**
 * Tiny haptics helper. Android Chrome supports navigator.vibrate; iOS Safari
 * (and in-app browsers on iOS) do not — calls are silently ignored there.
 */

type Pattern = number | number[];

export const HAPTIC = {
  tap: 10,
  select: 15,
  correct: [20, 40, 30],
  wrong: [60, 40, 60],
  streak: [15, 30, 15, 30, 40],
  finish: [30, 50, 30, 50, 30, 50, 120],
} as const satisfies Record<string, Pattern>;

let enabled = true;

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

export function vibrate(pattern: Pattern): void {
  if (!enabled) return;
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & { vibrate?: (p: Pattern) => boolean };
  if (typeof nav.vibrate !== "function") return;
  try {
    nav.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
