"use client";

import { createElement, useEffect, useId, useState, type ReactElement } from "react";
import styles from "./Pip.module.css";
import { CSS_VAR, HEX, pipTree, type PipKit, type PipMood, type PipNode, type PipTok } from "./pip-geometry";

export type { PipKit, PipMood } from "./pip-geometry";

export interface PipProps {
  /** Facial expression + body motion. Default `"idle"`. */
  mood?: PipMood;
  /** Accessories unlocked so far. Default none. */
  kit?: PipKit;
  /** Rendered width/height in px. Default 120. */
  size?: number;
  /**
   * Disable all body motion (face swaps still crossfade). The CSS also honours
   * `@media (prefers-reduced-motion: reduce)` on its own.
   */
  reduceMotion?: boolean;
  className?: string;
  /** Accessible name. When omitted the SVG is `aria-hidden`. */
  title?: string;
}

/** Theme token → `var(--color-x, #hex)`; tokens without a variable fall back to hex. */
function color(tok: string): string {
  const hex = HEX[tok as PipTok];
  const cssVar = CSS_VAR[tok as PipTok];
  return cssVar ? `var(${cssVar}, ${hex})` : hex;
}

function render(node: PipNode, key: number): ReactElement {
  const props: Record<string, unknown> = { key };
  for (const [k, v] of Object.entries(node.a)) {
    props[k] = typeof v === "string" && v.charCodeAt(0) === 36 /* $ */ ? color(v.slice(1)) : v;
  }
  if (node.cls) {
    props.className = node.cls
      .split(" ")
      .map((c) => styles[c])
      .join(" ");
  }
  return createElement(node.tag, props, node.kids?.map(render));
}

const CURIOUS_BEAT_MS = 500;

export default function Pip({
  mood = "idle",
  kit,
  size = 120,
  reduceMotion = false,
  className,
  title,
}: PipProps): ReactElement {
  // Unique clipPath id per instance (many Pips can share a page).
  const clipId = "pip" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // `curious` (wrong answer) auto-advances to the `encouraging` face after 500 ms.
  const [advanced, setAdvanced] = useState(false);
  useEffect(() => {
    if (mood !== "curious") return;
    const t = setTimeout(() => setAdvanced(true), CURIOUS_BEAT_MS);
    return () => {
      clearTimeout(t);
      setAdvanced(false);
    };
  }, [mood]);
  const shown: PipMood = mood === "curious" && advanced ? "encouraging" : mood;

  const tree = pipTree({ kit, clipId });

  return (
    <span
      className={className ? `${styles.pip} ${className}` : styles.pip}
      data-mood={shown}
      data-rm={reduceMotion ? "1" : undefined}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        focusable="false"
      >
        {tree.map(render)}
      </svg>
    </span>
  );
}
