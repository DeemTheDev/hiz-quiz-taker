/**
 * Public, non-secret site configuration. Values come from NEXT_PUBLIC_* env
 * vars so the same build can be pointed at different handles/domains.
 *
 * TODO (client): set NEXT_PUBLIC_INSTAGRAM_URL, NEXT_PUBLIC_TIKTOK_URL and
 * NEXT_PUBLIC_SITE_URL in Vercel → Settings → Environment Variables.
 */

function clean(v: string | undefined): string | undefined {
  const t = v?.trim();
  return t ? t.replace(/\/+$/, "") : undefined;
}

export const SITE = {
  /** Canonical origin, e.g. https://quiz.example.org (no trailing slash). */
  url: clean(process.env.NEXT_PUBLIC_SITE_URL),
  // Defaults are the client's profiles (tracking query params stripped); env vars override.
  instagramUrl: clean(process.env.NEXT_PUBLIC_INSTAGRAM_URL) ?? "https://www.instagram.com/the_status.quo/",
  tiktokUrl: clean(process.env.NEXT_PUBLIC_TIKTOK_URL) ?? "https://www.tiktok.com/@the_status_quo",
  /** Optional "find services near you" link shown in the footer disclaimer. */
  resourcesUrl: clean(process.env.NEXT_PUBLIC_RESOURCES_URL),
  /** Optional organisation name for the footer. Neutral by default for discretion. */
  orgName: clean(process.env.NEXT_PUBLIC_ORG_NAME),
} as const;

/** Parsed canonical origin, or undefined when unset/invalid (never throws at module scope). */
export function siteUrlObject(): URL | undefined {
  if (!SITE.url) return undefined;
  try {
    return new URL(SITE.url);
  } catch {
    return undefined;
  }
}

export const FLAGS = {
  /** Kit unlock toasts on Q3/Q6/Q8/Q10 */
  kitUnlocks: true,
  /** "X% of players knew this" line under feedback */
  socialProof: true,
  /** Achievement stickers persisted in localStorage */
  stickerBook: true,
  /** Story card (1080×1920 PNG) generation */
  storyCard: true,
} as const;
