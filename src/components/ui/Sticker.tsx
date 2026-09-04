"use client";

import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { HAPTIC, vibrate } from "@/lib/haptics";
import { playOnGesture } from "@/lib/sound";

type Variant = "gauze" | "primary" | "mint" | "blush" | "ink" | "ghost";
type Size = "sm" | "md" | "lg" | "xl";

const variantClass: Record<Variant, string> = {
  gauze: "sticker",
  primary: "sticker sticker-primary",
  mint: "sticker sticker-mint",
  blush: "sticker sticker-blush",
  ink: "sticker sticker-ink",
  ghost: "sticker sticker-flat border-transparent bg-transparent",
};

const sizeClass: Record<Size, string> = {
  sm: "min-h-11 px-3 text-body font-bold",
  md: "min-h-12 px-4 text-body-lg font-extrabold",
  lg: "min-h-14 px-5 text-[1.0625rem] font-extrabold",
  xl: "min-h-[3.75rem] px-6 text-[1.1875rem] font-display font-bold",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  /** Sound cue on press; null for none. Defaults to a soft tap. */
  sound?: Parameters<typeof playOnGesture>[0] | null;
  /** Haptic pattern on press; null for none. */
  haptic?: number | number[] | null;
  full?: boolean;
  children?: ReactNode;
  className?: string;
}

export type StickerButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { as?: "button" };
export type StickerLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & { as: "a" };

export type StickerProps = StickerButtonProps | StickerLinkProps;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Die-cut sticker button/anchor with the 4px "edge" that collapses on press.
 * Plays the tap sound + haptic synchronously inside the gesture.
 */
export const Sticker = forwardRef<HTMLButtonElement | HTMLAnchorElement, StickerProps>(function Sticker(
  props,
  ref,
) {
  const {
    variant = "gauze",
    size = "md",
    sound = "tap",
    haptic = HAPTIC.tap,
    full,
    className,
    children,
    ...rest
  } = props;

  const classes = cx(
    "inline-flex items-center justify-center gap-2 text-center leading-tight",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    variantClass[variant],
    sizeClass[size],
    full && "w-full",
    className,
  );

  const feedback = () => {
    if (sound) playOnGesture(sound);
    if (haptic) vibrate(haptic);
  };

  if (rest.as === "a") {
    const { as: _as, onClick, ...anchor } = rest;
    void _as;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        onClick={(e) => {
          feedback();
          onClick?.(e);
        }}
        {...anchor}
      >
        {children}
      </a>
    );
  }

  const { as: _as, onClick, type, ...button } = rest as StickerButtonProps;
  void _as;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type ?? "button"}
      className={classes}
      onClick={(e) => {
        feedback();
        onClick?.(e);
      }}
      {...button}
    >
      {children}
    </button>
  );
});
