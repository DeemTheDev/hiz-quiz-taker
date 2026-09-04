import type { ReactNode } from "react";

/**
 * Page chrome for /admin: soft lavender page, slate text, mobile-first padding.
 * `centered` is used for the login / not-configured cards.
 */
export function AdminShell({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[#F6F3FF] font-sans text-slate-800 antialiased">
      <main
        className={
          centered
            ? "flex flex-1 items-center justify-center px-4 py-10 sm:px-6"
            : "mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10"
        }
      >
        {children}
      </main>
    </div>
  );
}

/** White card with rounded corners and a soft violet shadow. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(88,72,160,0.08)] ring-1 ring-[#EAE5FB] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-slate-800 sm:text-lg">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

const TILE_TONES = {
  lavender: "bg-[#EEE9FF] text-[#5B4BC4]",
  mint: "bg-[#E3F7EF] text-[#1F7A5A]",
  peach: "bg-[#FFF1E6] text-[#B45309]",
  rose: "bg-[#FDE8EF] text-[#9F1D4A]",
} as const;

export type TileTone = keyof typeof TILE_TONES;

export function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: TileTone;
}) {
  return (
    <div className={`rounded-2xl p-4 shadow-[0_8px_30px_rgba(88,72,160,0.06)] sm:p-5 ${TILE_TONES[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-800 sm:text-4xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
