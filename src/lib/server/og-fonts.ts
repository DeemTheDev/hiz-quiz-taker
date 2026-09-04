/**
 * Fonts for ImageResponse cards: Fredoka 700 + Nunito 600/800, fetched via the
 * Google Fonts CSS API (a non-browser UA is served TTF static instances, which
 * Satori can parse). Cached in module scope and by the Next data cache; failures
 * fall back to Satori's default font instead of breaking the image.
 */

export type OgFontWeight = 600 | 700 | 800;
export type OgFont = { name: string; data: ArrayBuffer; weight: OgFontWeight; style: "normal" };

const FONT_SPECS: ReadonlyArray<{ name: string; weight: OgFontWeight }> = [
  { name: "Fredoka", weight: 700 },
  { name: "Nunito", weight: 600 },
  { name: "Nunito", weight: 800 },
];

let fontsPromise: Promise<OgFont[]> | null = null;

async function fetchGoogleFontTtf(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
    // No browser User-Agent on purpose: browsers get woff2, which Satori cannot parse.
    const cssRes = await fetch(cssUrl, { headers: { "User-Agent": "node" }, cache: "force-cache" });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match =
      css.match(/src:\s*url\(([^)]+)\)\s*format\(['"](?:truetype|opentype)['"]\)/) ??
      css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]woff['"]\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1], { cache: "force-cache" });
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export function loadOgFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      FONT_SPECS.map(async (spec) => {
        const data = await fetchGoogleFontTtf(spec.name, spec.weight);
        return data ? ({ ...spec, data, style: "normal" } satisfies OgFont) : null;
      }),
    )
      .then((list) => {
        const fonts = list.filter((f): f is OgFont => f !== null);
        // Partial failure: serve what we have now, retry the rest next request.
        if (fonts.length < FONT_SPECS.length) fontsPromise = null;
        return fonts;
      })
      .catch(() => {
        fontsPromise = null;
        return [];
      });
  }
  return fontsPromise;
}

/** Shared pastel palette for the cards. */
export const OG_COLORS = {
  lilac: "#F6F1FF",
  gauze: "#FFFDF8",
  lavender: "#CFC2FF",
  mint: "#BFF2D3",
  sky: "#BDE4FF",
  lemon: "#FFE7A3",
  gold: "#F7D774",
  track: "#E6DFFB",
  ink: "#1F1740",
  plum: "#3F3A5C",
  inkMint: "#14532D",
  mintEdge: "#2F9E62",
  violetEdge: "#7C5CE6",
} as const;
