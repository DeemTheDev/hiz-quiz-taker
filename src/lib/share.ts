/**
 * Share mechanics — DESIGN.md §9.
 *
 * Plain TypeScript, no React, safe to import from client components.
 * Everything here is spoiler-free: share text never contains question text,
 * and the emoji grid never uses 🟥/❌ (colour-vision-safe; the number carries
 * the meaning).
 */

export const SHARE_TITLE = "HIV Prevention Challenge";

/** Max characters allowed in the share text (DESIGN.md §8). */
export const SHARE_TEXT_LIMIT = 280;

/**
 * Two rows of five: 🟩 for a correct answer, ⬜ otherwise, in display order
 * (questions 1–5 on row one, 6–10 on row two). Rows are joined with "\n".
 */
export function emojiGrid(correct: boolean[]): string {
  const cells = Array.from({ length: 10 }, (_, i) => (correct[i] ? "🟩" : "⬜"));
  return `${cells.slice(0, 5).join("")}\n${cells.slice(5, 10).join("")}`;
}

export interface ShareTextArgs {
  score: number;
  tierLabel: string;
  tierEmoji: string;
  correct: boolean[];
  /** Percent of other players who scored lower; null when not yet meaningful. */
  percentile: number | null;
  /** Fully-qualified share landing URL (see `shareUrl`). */
  url: string;
}

/**
 * Builds the share text exactly per the DESIGN.md §8 template:
 *
 *   HIV Prevention Challenge 🧬 {score}/10 {tierEmoji} {tierLabel}
 *   {row1}
 *   {row2}
 *   {percentile ≥ 50 ? "Higher than {pct}% of players. Can you beat me?" : "Think you can beat my score?"}
 *   {url}
 *
 * Kept ≤ 280 characters; the URL is never truncated.
 */
export function buildShareText(args: ShareTextArgs): string {
  const { score, tierLabel, tierEmoji, correct, percentile, url } = args;
  const headline = `${SHARE_TITLE} 🧬 ${clampScore(score)}/10 ${tierEmoji} ${tierLabel}`;
  const grid = emojiGrid(correct);
  const challenge =
    percentile !== null && Number.isFinite(percentile) && percentile >= 50
      ? `Higher than ${Math.round(percentile)}% of players. Can you beat me?`
      : "Think you can beat my score?";

  const full = [headline, grid, challenge, url].join("\n");
  if (full.length <= SHARE_TEXT_LIMIT) return full;

  // Over budget (only possible with an unusually long domain): drop to the
  // shorter challenge line first, then the headline's tier label.
  const shorter = [headline, grid, "Think you can beat my score?", url].join("\n");
  if (shorter.length <= SHARE_TEXT_LIMIT) return shorter;
  return [`${SHARE_TITLE} 🧬 ${clampScore(score)}/10 ${tierEmoji}`, grid, url].join("\n");
}

/**
 * Validates a `/s/[score]` path segment. Accepts only the canonical integers
 * "0"–"10" (no signs, spaces or leading zeros) so every score has one URL.
 */
export function parseScoreSegment(raw: string | undefined): number | null {
  if (typeof raw !== "string" || !/^(?:10|[0-9])$/.test(raw)) return null;
  return Number(raw);
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(10, Math.round(score)));
}

/**
 * The site origin without a trailing slash. Prefers `NEXT_PUBLIC_SITE_URL`
 * (inlined at build time), then the browser's origin; "" on the server when
 * neither is available (callers then get a root-relative URL).
 */
export function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  return "";
}

/** `https://{domain}/s/{score}?utm_source=share` */
export function shareUrl(score: number): string {
  return `${siteOrigin()}/s/${clampScore(score)}?utm_source=share`;
}

/**
 * Plain-anchor WhatsApp link (DESIGN.md §9.3). Phones get the wa.me deep link.
 * WhatsApp Desktop on Windows mis-decodes emoji and newlines in that deep
 * link, so desktop browsers are sent to WhatsApp Web, which decodes correctly.
 */
export function whatsappUrl(text: string): string {
  const encoded = encodeURIComponent(text);
  const desktop =
    typeof navigator !== "undefined" && !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  return desktop ? `https://web.whatsapp.com/send?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export type ShareOutcome = "shared" | "copied" | "failed" | "aborted";

export interface ShareResultArgs {
  title: string;
  text: string;
  url: string;
}

/**
 * The share chain from DESIGN.md §9 steps 1–2. MUST be called directly inside
 * the click handler, before any `await`, so `navigator.share` and the
 * clipboard write both run inside the user gesture.
 *
 * 1. Web Share (when available and `canShare` allows). The URL is appended to
 *    `text` as well, because share targets unpredictably drop `url`.
 *    AbortError → "aborted" (user dismissed the sheet; do nothing).
 *    Any other failure → step 2.
 * 2. `navigator.clipboard.writeText` (synchronously) → hidden textarea +
 *    `document.execCommand("copy")` → "copied".
 *
 * Never throws; "failed" when everything is unavailable or rejected.
 */
export async function shareResult(args: ShareResultArgs): Promise<ShareOutcome> {
  try {
    const { title, url } = args;
    const text = args.text.includes(url) ? args.text : `${args.text}\n${url}`;

    // Step 1 — Web Share, invoked synchronously inside the gesture.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      // The URL is already inside ; passing it twice makes some targets show it twice.
      const data: ShareData = { title, text };
      const allowed = typeof navigator.canShare !== "function" || safeCanShare(data);
      if (allowed) {
        let pending: Promise<void> | undefined;
        try {
          pending = navigator.share(data);
        } catch {
          pending = undefined; // synchronous throw (old WebViews) → fall through
        }
        if (pending) {
          try {
            await pending;
            return "shared";
          } catch (err) {
            if (isAbortError(err)) return "aborted";
            // NotAllowedError / DataError / anything else → clipboard.
          }
        }
      }
    }

    // Step 2 — Clipboard, invoked synchronously (no await before the call
    // when Web Share was unavailable).
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      try {
        await navigator.clipboard.writeText(text);
        return "copied";
      } catch {
        // e.g. "Document is not focused" in Android WebViews → legacy path.
      }
    }

    return legacyCopy(text) ? "copied" : "failed";
  } catch {
    return "failed";
  }
}

function safeCanShare(data: ShareData): boolean {
  try {
    return navigator.canShare(data);
  } catch {
    return false;
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

/** Hidden `<textarea>` + `document.execCommand("copy")`. */
function legacyCopy(text: string): boolean {
  if (typeof document === "undefined" || !document.body) return false;
  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.setAttribute("aria-hidden", "true");
    textarea.tabIndex = -1;
    Object.assign(textarea.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "1px",
      height: "1px",
      padding: "0",
      border: "0",
      opacity: "0",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(textarea);
    textarea.focus({ preventScroll: true });
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    if (textarea?.parentNode) textarea.parentNode.removeChild(textarea);
  }
}
