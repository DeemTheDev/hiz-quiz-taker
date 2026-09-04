"use client";

import { Sparkles, Vibrate, VibrateOff, Volume2, VolumeX } from "lucide-react";
import { COPY } from "@/lib/copy";
import { useSettings } from "@/hooks/useSettings";
import { playOnGesture } from "@/lib/sound";
import { vibrate } from "@/lib/haptics";

interface Props {
  /** Replaces the brand chip (e.g. "Your result" eyebrow). */
  left?: React.ReactNode;
}

function IconButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="relative grid size-12 place-items-center rounded-chip text-ink/80 transition-colors hover:bg-gauze/70 active:scale-95"
    >
      <span className="grid size-11 place-items-center rounded-chip border-2 border-ink/15 bg-gauze/80">
        {children}
      </span>
    </button>
  );
}

export default function AppHeader({ left }: Props) {
  const s = useSettings();

  return (
    <header className="flex h-12 items-center justify-between gap-2">
      <div className="min-w-0">
        {left ?? (
          <span className="chip border-ink bg-gauze text-ink">
            <span aria-hidden="true">🧬</span>
            <span>Prevention Challenge</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          label={COPY.header.sound}
          pressed={s.sound}
          onClick={() => {
            const next = !s.sound;
            s.setSound(next);
            if (!next) vibrate(10);
          }}
        >
          {s.sound ? <Volume2 size={22} strokeWidth={2.25} /> : <VolumeX size={22} strokeWidth={2.25} />}
        </IconButton>

        <IconButton
          label={COPY.header.motion}
          pressed={!s.motion}
          onClick={() => {
            s.setMotion(!s.motion);
            playOnGesture("tap");
          }}
        >
          <span className="relative grid place-items-center">
            <Sparkles size={22} strokeWidth={2.25} className={s.motion ? "" : "opacity-50"} />
            {!s.motion && (
              <span
                aria-hidden="true"
                className="absolute h-[2.5px] w-7 -rotate-45 rounded-full bg-ink"
              />
            )}
          </span>
        </IconButton>

        {s.canVibrate && (
          <IconButton
            label={COPY.header.haptics}
            pressed={s.haptics}
            onClick={() => {
              const next = !s.haptics;
              s.setHaptics(next);
              if (next) vibrate(20);
            }}
          >
            {s.haptics ? <Vibrate size={22} strokeWidth={2.25} /> : <VibrateOff size={22} strokeWidth={2.25} />}
          </IconButton>
        )}
      </div>
    </header>
  );
}
