/**
 * Framework-free Pip renderer for Canvas / OG images.
 *
 * Returns a standalone `<svg xmlns=...>` string of the same Pip drawn by
 * `Pip.tsx` (shared geometry in `pip-geometry.ts`) with one mood's face and
 * pose baked in: no CSS, no animation, hex colours only — safe as a
 * `data:image/svg+xml` source on a `<canvas>` and inside Satori/ImageResponse.
 */

import { HEX, pipTree, type PipKit, type PipMood, type PipNode, type PipTok } from "./pip-geometry";

export type { PipKit, PipMood } from "./pip-geometry";

export interface PipSvgOptions {
  mood?: PipMood;
  kit?: PipKit;
  /** Width/height attribute in px. Default 120. */
  size?: number;
}

const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

function serialize(node: PipNode): string {
  let attrs = "";
  for (const [k, v] of Object.entries(node.a)) {
    const val = typeof v === "string" && v.charCodeAt(0) === 36 /* $ */ ? HEX[v.slice(1) as PipTok] : v;
    attrs += ` ${kebab(k)}="${val}"`;
  }
  if (!node.kids?.length) return `<${node.tag}${attrs}/>`;
  return `<${node.tag}${attrs}>${node.kids.map(serialize).join("")}</${node.tag}>`;
}

export function pipSvgString({ mood = "idle", kit, size = 120 }: PipSvgOptions = {}): string {
  const body = pipTree({ kit, clipId: "pipBody", frozen: mood }).map(serialize).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">` +
    body +
    "</svg>"
  );
}

/** Convenience: the same SVG as a `data:` URL for `<img src>` / `Image.src`. */
export function pipDataUrl(opts: PipSvgOptions = {}): string {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(pipSvgString(opts));
}
