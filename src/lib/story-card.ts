/**
 * Story card (DESIGN.md §9.5): a 1080×1920 PNG drawn on a <canvas> for
 * Instagram / TikTok / WhatsApp stories. Browser-only — call from a click
 * handler on the results screen.
 */

import { pipSvgString } from "@/components/pip-svg";

export interface StoryCardKit {
  badge?: boolean;
  stetho?: boolean;
  goggles?: boolean;
  hat?: boolean;
}

export interface StoryCardArgs {
  score: number;
  tierLabel: string;
  tierEmoji: string;
  /** Per-question correctness in display order (length 10). */
  correct: boolean[];
  kit?: StoryCardKit;
  /** e.g. "prevention-challenge.co.za" — printed at the bottom of the card. */
  siteHost: string;
}

export const STORY_CARD_WIDTH = 1080;
export const STORY_CARD_HEIGHT = 1920;

const C = {
  lilac: "#F6F1FF",
  mint: "#BFF2D3",
  sky: "#BDE4FF",
  lemon: "#FFE7A3",
  gold: "#F7D774",
  track: "#E6DFFB",
  ink: "#1F1740",
  plum: "#3F3A5C",
  inkMint: "#14532D",
  mintEdge: "#2F9E62",
} as const;

const DISPLAY = '"Fredoka", system-ui, -apple-system, "Segoe UI", sans-serif';
const BODY = '"Nunito", system-ui, -apple-system, "Segoe UI", sans-serif';

/** Renders the story card and resolves with a PNG Blob. */
export async function renderStoryCard(args: StoryCardArgs): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("renderStoryCard must run in the browser");
  }

  const score = Math.max(0, Math.min(10, Math.round(args.score)));
  const correct = Array.from({ length: 10 }, (_, i) => Boolean(args.correct[i]));

  // Fonts first (fall back silently to system-ui if they never arrive).
  await loadFonts();

  // Pip as an <img> from an SVG data URI (same SVG as the UI, with kit).
  const pip = await loadPip(args.kit);

  const canvas = document.createElement("canvas");
  canvas.width = STORY_CARD_WIDTH;
  canvas.height = STORY_CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  const W = STORY_CARD_WIDTH;
  const cx = W / 2;

  // Ground + soft gradient dishes.
  ctx.fillStyle = C.lilac;
  ctx.fillRect(0, 0, W, STORY_CARD_HEIGHT);
  dish(ctx, 180, 260, 520, C.mint);
  dish(ctx, 940, 760, 560, C.sky);
  dish(ctx, 200, 1500, 600, C.lemon);
  dish(ctx, 900, 1760, 460, C.mint);

  // Layout keeps everything inside the story "safe zone" (clear of the
  // ~250 px top and ~340 px bottom UI overlays in Instagram/TikTok stories).

  // Pip (320 px), centred.
  if (pip) {
    ctx.drawImage(pip, cx - 160, 260, 320, 320);
  }

  // Score — Fredoka 700 320 px.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = C.ink;
  ctx.font = `700 320px ${DISPLAY}`;
  const scoreText = String(score);
  const scoreWidth = ctx.measureText(scoreText).width;
  ctx.font = `700 150px ${DISPLAY}`;
  const denomWidth = ctx.measureText("/10").width;
  const gap = 14;
  const totalWidth = scoreWidth + gap + denomWidth;
  const scoreBaseline = 920;
  ctx.textAlign = "left";
  ctx.font = `700 320px ${DISPLAY}`;
  ctx.fillText(scoreText, cx - totalWidth / 2, scoreBaseline);
  ctx.font = `700 150px ${DISPLAY}`;
  ctx.fillText("/10", cx - totalWidth / 2 + scoreWidth + gap, scoreBaseline);

  // Tier stamp, rotated -6°.
  drawStamp(ctx, cx, 1085, `${args.tierEmoji} ${args.tierLabel}`, score >= 9 ? C.gold : C.lemon);

  // 2×5 grid: mint + dark check for correct, track for the rest.
  drawGrid(ctx, cx, 1235, correct);

  // Caption.
  ctx.textAlign = "center";
  ctx.fillStyle = C.plum;
  ctx.font = `600 40px ${BODY}`;
  ctx.fillText("10 questions · 100% anonymous", cx, 1565);

  // Wordmark + host at the bottom (above the story reply bar).
  ctx.fillStyle = C.ink;
  ctx.font = `700 64px ${DISPLAY}`;
  ctx.fillText("Prevention Challenge", cx, 1665);
  ctx.fillStyle = C.plum;
  ctx.font = `700 40px ${BODY}`;
  ctx.fillText(args.siteHost, cx, 1725);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas.toBlob returned null"));
    }, "image/png");
  });
}

/**
 * Shares the PNG through the Web Share API when files are supported.
 * Returns "fallback" when the caller should show the PNG in a modal instead
 * ("Long-press to save"). A user-dismissed share sheet (AbortError) resolves
 * "shared" — the user made a choice; do not pop a modal on top of it.
 */
export async function shareStoryCard(blob: Blob, text: string): Promise<"shared" | "fallback"> {
  try {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      return "fallback";
    }
    const file = new File([blob], "prevention-challenge.png", { type: "image/png" });
    const files = [file];
    if (!navigator.canShare?.({ files })) return "fallback";
    await navigator.share({ files, text });
    return "shared";
  } catch (err) {
    if (isAbortError(err)) return "shared";
    return "fallback";
  }
}

// ---------------------------------------------------------------------------

async function loadFonts(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const wanted = [
    "700 320px Fredoka",
    "700 64px Fredoka",
    "600 40px Nunito",
    "700 40px Nunito",
  ];
  try {
    await Promise.race([
      Promise.all(wanted.map((f) => document.fonts.load(f).catch(() => []))),
      new Promise<void>((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    // system-ui fallback is already in the font stacks
  }
}

function loadPip(kit: StoryCardKit | undefined): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    try {
      const svg = pipSvgString({ mood: "celebrating", kit, size: 320 });
      const img = new Image(320, 320);
      img.decoding = "sync";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    } catch {
      resolve(null);
    }
  });
}

function dish(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, hex: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, withAlpha(hex, 0.55));
  g.addColorStop(0.55, withAlpha(hex, 0.28));
  g.addColorStop(1, withAlpha(hex, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  fill: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-6 * Math.PI) / 180);
  ctx.font = `700 60px ${DISPLAY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const textWidth = ctx.measureText(label).width;
  const padX = 52;
  const h = 128;
  const w = Math.min(textWidth + padX * 2, STORY_CARD_WIDTH - 80);
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.fillText(label, 0, 4, w - padX);
  ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D, cx: number, top: number, correct: boolean[]) {
  const cell = 112;
  const gapPx = 20;
  const rowWidth = cell * 5 + gapPx * 4;
  const x0 = cx - rowWidth / 2;
  for (let i = 0; i < 10; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = x0 + col * (cell + gapPx);
    const y = top + row * (cell + gapPx);
    const ok = correct[i];
    roundRect(ctx, x, y, cell, cell, 28);
    ctx.fillStyle = ok ? C.mint : C.track;
    ctx.fill();
    if (ok) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = C.mintEdge;
      ctx.stroke();
      // Check mark.
      ctx.beginPath();
      ctx.moveTo(x + cell * 0.26, y + cell * 0.52);
      ctx.lineTo(x + cell * 0.43, y + cell * 0.69);
      ctx.lineTo(x + cell * 0.76, y + cell * 0.33);
      ctx.lineWidth = 11;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = C.inkMint;
      ctx.stroke();
    }
  }
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name?: unknown }).name === "AbortError"
  );
}
