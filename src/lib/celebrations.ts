"use client";

/**
 * Confetti recipes (canvas-confetti, dynamically imported so it never lands in
 * the first-load bundle) and the tier → celebration mapping.
 */

import type { Tier } from "@/data/questions";

const COLORS = ["#CFC2FF", "#BFF2D3", "#FFE7A3", "#BDE4FF", "#FFD1D6"];

type ConfettiFn = typeof import("canvas-confetti");
let confettiPromise: Promise<ConfettiFn> | null = null;

export function preloadConfetti(): Promise<ConfettiFn> {
  if (!confettiPromise) {
    confettiPromise = import("canvas-confetti").then((mod) => {
      // CommonJS module: the function may be the module itself or `.default`.
      const anyMod = mod as unknown as { default?: ConfettiFn };
      return (anyMod.default ?? (mod as unknown as ConfettiFn)) as ConfettiFn;
    });
  }
  return confettiPromise;
}

const base = {
  colors: COLORS,
  disableForReducedMotion: true,
  useWorker: true,
  zIndex: 60,
} as const;

async function fire(opts: Record<string, unknown>) {
  try {
    const confetti = await preloadConfetti();
    void confetti({ ...base, ...opts });
  } catch {
    /* confetti is decorative; ignore failures */
  }
}

export function confettiStreak3() {
  void fire({ particleCount: 40, spread: 70, origin: { y: 0.7 }, scalar: 0.9 });
}

export function confettiStreak5() {
  void fire({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.75 } });
  void fire({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.75 } });
}

/** Results celebration scaled to the tier. */
export function confettiForTier(tier: Tier["key"]) {
  switch (tier) {
    case "champion": {
      const shot = () => fire({ particleCount: 150, spread: 180, startVelocity: 45, origin: { y: 0.5 } });
      void shot();
      setTimeout(shot, 500);
      setTimeout(shot, 1000);
      break;
    }
    case "pro": {
      const total = 200;
      const realistic = (ratio: number, o: Record<string, unknown>) =>
        fire({ particleCount: Math.floor(total * ratio), origin: { y: 0.6 }, ...o });
      void realistic(0.25, { spread: 26, startVelocity: 55 });
      void realistic(0.2, { spread: 60 });
      void realistic(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      void realistic(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      void realistic(0.1, { spread: 120, startVelocity: 45 });
      break;
    }
    case "getting-there":
      void fire({ particleCount: 40, spread: 60, origin: { y: 0.55 }, scalar: 0.9 });
      break;
    default:
      // Beginner: Pip celebrates anyway; no confetti.
      break;
  }
}
