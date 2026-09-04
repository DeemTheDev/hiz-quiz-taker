"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Fallback for browsers that cannot share files (DESIGN.md §9.5): shows the
 * rendered story-card PNG in an accessible modal with "Long-press the image
 * to save it". Never offers an <a download> — inert in in-app browsers.
 */
export function StoryCardModal({
  open,
  blob,
  onClose,
}: {
  open: boolean;
  blob: Blob | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  // Object URL for the PNG; revoked when the modal closes or the blob changes.
  useEffect(() => {
    if (!open || !blob) return;
    const objectUrl = URL.createObjectURL(blob);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL only exists once the blob is mounted; revoking needs the effect cleanup
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(null);
    };
  }, [open, blob]);

  // Focus management, Escape to close, scroll lock.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        // Single focusable control: keep focus inside the dialog.
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1740]/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100svh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-3xl border-2 border-[#7C5CE6] bg-[#FFFDF8] text-[#1F1740] shadow-[0_4px_0_#7C5CE6]"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <h2 id={titleId} className="text-lg font-bold leading-tight">
              Your story card
            </h2>
            <p id={descId} className="mt-1 text-[15px] font-semibold text-[#3F3A5C]">
              Long-press the image to save it
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#7C5CE6] bg-[#FFFDF8] text-2xl font-bold leading-none text-[#1F1740] shadow-[0_3px_0_#7C5CE6] outline-none transition-transform active:translate-y-[3px] active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#4C1D95]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob: URL rendered client-side; next/image cannot optimise it
            <img
              src={url}
              alt="Your story card: your score, tier stamp and answer grid"
              width={1080}
              height={1920}
              className="mx-auto h-auto w-full max-w-[280px] rounded-2xl border-2 border-[#E6DFFB]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="mx-auto aspect-[9/16] w-full max-w-[280px] animate-pulse rounded-2xl bg-[#E6DFFB]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
