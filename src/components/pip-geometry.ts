/**
 * Pip geometry — the single source of truth for the mascot's shapes.
 *
 * Both renderers consume this module so they can never drift:
 *  - `Pip.tsx` turns the node tree into React elements (colours become CSS
 *    variables with hex fallbacks; moods are driven by CSS on `data-mood`).
 *  - `pip-svg.ts` serialises the same tree to a standalone SVG string with a
 *    mood "frozen" in (hex colours only, poses baked into `transform` attrs).
 *
 * Coordinate space: viewBox 0 0 120 120. See docs/DESIGN.md §"Mascot: Pip".
 */

export type PipMood =
  | "idle"
  | "thinking"
  | "correct"
  | "curious"
  | "encouraging"
  | "celebrating"
  | "peek";

export interface PipKit {
  badge?: boolean;
  stetho?: boolean;
  goggles?: boolean;
  hat?: boolean;
}

/** Palette hex fallbacks (docs/DESIGN.md §2.1). */
export const HEX = {
  lavender: "#CFC2FF",
  ink: "#1F1740",
  mint: "#BFF2D3",
  gauze: "#FFFDF8",
  blush: "#FFD1D6",
  lemon: "#FFE7A3",
  sky: "#BDE4FF",
  violetEdge: "#7C5CE6",
  track: "#E6DFFB",
  white: "#FFFFFF",
} as const;

export type PipTok = keyof typeof HEX;

/** Tailwind theme custom properties backing each token (white has none). */
export const CSS_VAR: Partial<Record<PipTok, string>> = {
  lavender: "--color-lavender",
  ink: "--color-ink",
  mint: "--color-mint",
  gauze: "--color-gauze",
  blush: "--color-blush",
  lemon: "--color-lemon",
  sky: "--color-sky",
  violetEdge: "--color-violet-edge",
  track: "--color-track",
};

/** Attribute bag. Keys use React's camelCase (`strokeWidth`); colour values are `$token`. */
export type PipAttrs = Record<string, string | number>;

export interface PipNode {
  tag: "g" | "path" | "circle" | "ellipse" | "rect" | "clipPath";
  a: PipAttrs;
  /** Logical class hook(s), space separated. Mapped to CSS-module classes by Pip.tsx. */
  cls?: string;
  kids?: PipNode[];
}

/** Which toggle-able parts are visible for each mood (mirrors Pip.module.css). */
export const FACE: Record<PipMood, readonly string[]> = {
  idle: ["eyeL", "eyeR", "mouthSmile"],
  thinking: ["eyeL", "eyeR", "brow", "mouthFlat", "dot"],
  correct: ["hapL", "hapR", "mouthGrin", "sparkle"],
  curious: ["eyeL", "eyeR", "mouthO", "bulb"],
  encouraging: ["eyeL", "hapR", "mouthSmile", "thumb"],
  celebrating: ["starL", "starR", "mouthGrin"],
  peek: ["eyeL", "eyeR", "brow", "mouthFlat"],
};

/** Static body poses per mood in degrees (mirrors Pip.module.css). */
export const POSE: Record<PipMood, { armL: number; armR: number; tilt: number }> = {
  idle: { armL: 0, armR: 0, tilt: 0 },
  thinking: { armL: 0, armR: 0, tilt: 4 },
  correct: { armL: 120, armR: -120, tilt: 0 },
  curious: { armL: 0, armR: 0, tilt: 6 },
  encouraging: { armL: 0, armR: -90, tilt: 0 },
  celebrating: { armL: 120, armR: -120, tilt: 0 },
  peek: { armL: 0, armR: 0, tilt: 0 },
};

/** Transform pivots in user units (mirrors `transform-origin` in Pip.module.css). */
export const PIVOT = {
  armL: [18, 74],
  armR: [102, 74],
  tilt: [60, 84],
  fig: [60, 108],
  bulb: [96, 38],
} as const;

/* ---------- shape constants ---------- */

/** Smooth pudding-shaped blob, slightly wider than tall, no bumps. */
const BODY =
  "M60 24C82 24 106 40 106 68 106 94 88 108 60 108 32 108 14 94 14 68 14 40 38 24 60 24Z";
/** Medic headband, gently wrapping the head; clipped to the body. */
const BAND = "M-4 42Q60 22 124 42L124 56Q60 36 -4 56Z";
/** White lab coat: the bottom of the blob with a V-notch collar; clipped to the body. */
const COAT = "M4 90Q30 90 53 93L60 100L67 93Q90 90 116 90V112H4Z";
const HAPPY_L = "M39 63q7-8 14 0";
const HAPPY_R = "M67 63q7-8 14 0";
const STAR5 =
  "M0 -8 2 -2.8 7.6 -2.5 3.2 1.1 4.7 6.5 0 3.4 -4.7 6.5 -3.2 1.1 -7.6 -2.5 -2 -2.8Z";
const STAR4 = "M0 -5Q0 0 5 0Q0 0 0 5Q0 0 -5 0Q0 0 0 -5Z";
const BROW_R = "M70 49q6-3 12 0";
const MOUTH_SMILE = "M50 80q10 8 20 0";
const MOUTH_GRIN = "M48 78q12 16 24 0z";
const MOUTH_FLAT = "M54 81h12";
const RAYS = "M96 19V15M89.5 21.5l-2.5-2.5M102.5 21.5l2.5-2.5M87.5 28h-3.5M104.5 28h3.5";
const HAT = "M46 26L64 5 74 26Q60 22 46 26Z";
const LANYARD = "M53 92.5Q50 92 49.5 95";
const TUBE = "M84 84C90 94 82 102 72 102";

/* ---------- tiny constructors ---------- */

const g = (kids: PipNode[], a: PipAttrs = {}, cls?: string): PipNode =>
  cls ? { tag: "g", a, kids, cls } : { tag: "g", a, kids };
const path = (d: string, a: PipAttrs): PipNode => ({ tag: "path", a: { d, ...a } });
const circle = (cx: number, cy: number, r: number, a: PipAttrs): PipNode => ({
  tag: "circle",
  a: { cx, cy, r, ...a },
});
const ellipse = (cx: number, cy: number, rx: number, ry: number, a: PipAttrs): PipNode => ({
  tag: "ellipse",
  a: { cx, cy, rx, ry, ...a },
});
const rect = (x: number, y: number, w: number, h: number, rx: number, a: PipAttrs): PipNode => ({
  tag: "rect",
  a: { x, y, width: w, height: h, rx, ...a },
});

/** Ink outline stroke for a filled shape. */
const ink = (w: number): PipAttrs => ({ stroke: "$ink", strokeWidth: w, strokeLinejoin: "round" });
/** Open ink line with round caps. */
const line = (w: number, stroke = "$ink"): PipAttrs => ({
  fill: "none",
  stroke,
  strokeWidth: w,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export interface PipTreeOptions {
  kit?: PipKit;
  /** Unique id for the body clipPath (React instances use `useId`). */
  clipId: string;
  /**
   * When set, the tree is "frozen" for static output: hidden face parts are
   * omitted and the mood's poses are baked into `transform` attributes.
   * When omitted, every part is emitted and CSS drives visibility/poses.
   */
  frozen?: PipMood;
}

/** Build Pip as a list of nodes (children of `<svg viewBox="0 0 120 120">`). */
export function pipTree({ kit = {}, clipId, frozen }: PipTreeOptions): PipNode[] {
  const on = (part: string) => !frozen || FACE[frozen].includes(part);
  const pose = frozen ? POSE[frozen] : POSE.idle;
  const rot = (deg: number, [cx, cy]: readonly [number, number]): PipAttrs =>
    frozen && deg ? { transform: `rotate(${deg} ${cx} ${cy})` } : {};

  // Bead eyes: curious widens them (ry 7), thinking/peek glance up-right.
  const eyeRy = frozen === "curious" ? 7 : 6;
  const eyeShift: PipAttrs =
    frozen === "thinking" || frozen === "peek" ? { transform: "translate(3 -3)" } : {};
  const eye = (cx: number, cls: string): PipNode =>
    g(
      [ellipse(cx, 62, 5, eyeRy, { fill: "$ink" }), circle(cx - 1.5, 60 - (eyeRy - 6), 1.8, { fill: "$white" })],
      eyeShift,
      cls,
    );

  const armCore = [path("M0 0V17", line(9)), path("M0 0V17", line(5.5, "$lavender"))];

  const armL = g(
    [
      g([...armCore, rect(-5, 10, 10, 5, 2, { fill: "$blush", ...ink(1.5) })], {
        transform: "translate(18 74) rotate(20)",
      }),
    ],
    rot(pose.armL, PIVOT.armL),
    "armL",
  );

  const thumb = on("thumb")
    ? [g([path("M0 15.5l4 1.5", line(6)), path("M0 15.5l4 1.5", line(2.5, "$lavender"))], {}, "thumb")]
    : [];
  const armR = g(
    [g([...armCore, ...thumb], { transform: "translate(102 74) rotate(-20)" })],
    rot(pose.armR, PIVOT.armR),
    "armR",
  );

  // Face parts. Each is a toggle-able layer named by its class hook.
  const face: PipNode[] = [];
  const add = (cls: string, n: PipNode) => {
    if (on(cls)) face.push({ ...n, cls });
  };
  add("eyeL", eye(46, "eyeL"));
  add("eyeR", eye(74, "eyeR"));
  add("hapL", path(HAPPY_L, line(4)));
  add("hapR", path(HAPPY_R, line(4)));
  add("starL", path(STAR5, { transform: "translate(46 62)", fill: "$lemon", ...ink(2) }));
  add("starR", path(STAR5, { transform: "translate(74 62)", fill: "$lemon", ...ink(2) }));
  add("brow", path(BROW_R, line(3)));
  add("mouthSmile", path(MOUTH_SMILE, line(4)));
  add("mouthGrin", g([path(MOUTH_GRIN, { fill: "$ink" }), ellipse(60, 84, 4, 2, { fill: "$blush" })]));
  add("mouthO", circle(60, 82, 3.5, line(3)));
  add("mouthFlat", path(MOUTH_FLAT, line(3)));

  const kitParts: PipNode[] = [];
  if (kit.badge)
    kitParts.push(
      g(
        [
          path(LANYARD, line(1.5)),
          rect(45, 95, 9, 10, 1.5, { fill: "$sky", ...ink(1.5) }),
          path("M47.5 99h4M47.5 101.5h2.5", line(1.2)),
        ],
        {},
        "kit",
      ),
    );
  if (kit.stetho)
    kitParts.push(
      g(
        [
          path(TUBE, line(2.5)),
          circle(68, 102, 4, { fill: "$violetEdge", ...ink(1.5) }),
          circle(68, 102, 1.5, { fill: "$gauze" }),
        ],
        {},
        "kit",
      ),
    );
  const goggles: PipNode[] = kit.goggles
    ? [
        g(
          [
            circle(44, 38, 7, { fill: "$sky", ...ink(2.5) }),
            circle(76, 38, 7, { fill: "$sky", ...ink(2.5) }),
            circle(44, 38, 4.8, line(2, "$lavender")),
            circle(76, 38, 4.8, line(2, "$lavender")),
          ],
          {},
          "kit",
        ),
      ]
    : [];
  const hat: PipNode[] = kit.hat
    ? [
        g(
          [
            path(HAT, { fill: "$blush", ...ink(2.5) }),
            circle(57, 20, 1.8, { fill: "$lemon" }),
            circle(66, 21, 1.8, { fill: "$lemon" }),
            circle(62, 12, 1.8, { fill: "$lemon" }),
            circle(64, 5, 4.5, { fill: "$lemon", ...ink(2) }),
          ],
          {},
          "kit",
        ),
      ]
    : [];

  const sparkles = on("sparkle")
    ? [
        g(
          [
            [14, 38],
            [108, 44],
            [94, 104],
          ].map(([x, y]) =>
            g([path(STAR4, { fill: "$lemon", ...ink(1.5) })], { transform: `translate(${x} ${y})` }, "sparkle"),
          ),
        ),
      ]
    : [];
  const dots = on("dot")
    ? [
        g(
          [
            circle(105, 50, 1.8, { fill: "$ink" }),
            circle(111, 42, 2.4, { fill: "$ink" }),
            circle(116, 33, 3, { fill: "$ink" }),
          ].map((c) => ({ ...c, cls: "dot", a: frozen ? { ...c.a, opacity: 0.45 } : c.a })),
        ),
      ]
    : [];
  const bulb = on("bulb")
    ? [
        g(
          [
            path(RAYS, line(2)),
            rect(93, 33.5, 6, 4, 1, { fill: "$gauze", ...ink(1.5) }),
            circle(96, 28, 6.5, { fill: "$lemon", ...ink(2) }),
          ],
          {},
          "bulb",
        ),
      ]
    : [];

  const figure = g(
    [
      g(
        [
          // body
          path(BODY, { fill: "$lavender", ...ink(3) }),
          // interior highlights, headband and lab coat, clipped to the body
          g(
            [
              ellipse(30, 57, 6.5, 4.5, { fill: "$track" }),
              ellipse(91, 53, 5, 3.5, { fill: "$track" }),
              path(BAND, { fill: "$mint", ...ink(3) }),
              rect(58.5, 34, 3, 10, 0, { fill: "$white" }),
              rect(55, 37.5, 10, 3, 0, { fill: "$white" }),
              path(COAT, { fill: "$gauze", ...ink(2.5) }),
            ],
            { clipPath: `url(#${clipId})` },
          ),
          // restore the outline where band/coat meet the edge
          path(BODY, { fill: "none", ...ink(3) }),
          // blush
          circle(36, 74, 6, { fill: "$blush", opacity: 0.8 }),
          circle(84, 74, 6, { fill: "$blush", opacity: 0.8 }),
          ...kitParts,
          ...face,
          ...goggles,
          ...hat,
          armL,
          armR,
        ],
        rot(pose.tilt, PIVOT.tilt),
        "tilt",
      ),
    ],
    {},
    "fig",
  );

  return [
    { tag: "clipPath", a: { id: clipId }, kids: [path(BODY, {})] },
    figure,
    ...bulb,
    ...sparkles,
    ...dots,
  ];
}
