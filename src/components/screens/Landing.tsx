"use client";

import { useEffect, useState } from "react";
import { m } from "motion/react";
import { ArrowRight, ListChecks, ShieldCheck, Timer } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import Pip from "@/components/Pip";
import { Sticker } from "@/components/ui/Sticker";
import { COPY } from "@/lib/copy";
import { SITE } from "@/lib/config";
import type { Stats } from "@/lib/types";
import { MIN_PARTICIPANTS_FOR_STATS } from "@/lib/types";
import { useSettings } from "@/hooks/useSettings";
import { unlockAudio } from "@/lib/sound";
import { HAPTIC } from "@/lib/haptics";
import { loadBest, loadStickers } from "@/lib/stickers";

interface Props {
  onStart: () => void;
  stats: Stats | null;
}

const ORBIT = ["🛡️", "🧪", "💊", "🩹"];
const nf = new Intl.NumberFormat("en-ZA");

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0, 0, 1] as const } },
};

/** Counts from 0 to `value` over 800 ms (instant under reduced motion). */
function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  const { reduceMotion } = useSettings();
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    const start = performance.now();
    const dur = 800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduceMotion]);
  return <span className="tabular">{nf.format(reduceMotion ? value : n)}</span>;
}

export default function Landing({ onStart, stats }: Props) {
  const { reduceMotion } = useSettings();
  const [orbitStopped, setOrbitStopped] = useState(false);
  const [bubble, setBubble] = useState<string>(COPY.landing.bubbleReady);
  // Landing only renders on the client (after hydration), so reading storage here is safe.
  const [best] = useState<number | null>(() => loadBest());
  const [stickerCount] = useState<number>(() => loadStickers().size);

  useEffect(() => {
    const t = setTimeout(() => setBubble(COPY.landing.bubbleNoPressure), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const stop = () => setOrbitStopped(true);
    window.addEventListener("pointerdown", stop, { once: true, passive: true });
    return () => window.removeEventListener("pointerdown", stop);
  }, []);

  const showStats = stats?.available && stats.total >= MIN_PARTICIPANTS_FOR_STATS;
  const motionOff = reduceMotion || orbitStopped;

  return (
    <m.main
      className="mx-auto grid min-h-svh w-full max-w-[430px] grid-rows-[auto_1fr_auto] px-4 sm:px-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <AppHeader />

      <div className="flex flex-col items-center justify-center gap-3 py-2 text-center">
        {/* Hero */}
        <m.div
          variants={item}
          className="relative grid h-[150px] w-[190px] place-items-center tall:h-[200px] tall:w-[230px]"
        >
          <svg
            aria-hidden="true"
            className={`absolute inset-0 size-full ${motionOff ? "" : "animate-spin-slow"}`}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="rgb(124 92 230 / 0.4)"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              strokeLinecap="round"
            />
          </svg>

          {/* Orbiting stickers */}
          <div aria-hidden="true" className={`absolute inset-0 ${motionOff ? "" : "animate-orbit"}`}>
            {ORBIT.map((e, i) => (
              <span
                key={e}
                className="absolute left-1/2 top-1/2 grid size-9 place-items-center rounded-full border-2 border-ink bg-gauze text-lg shadow-edge-ink"
                style={{
                  transform: `translate(-50%,-50%) rotate(${i * 90}deg) translateY(-86px) rotate(-${i * 90}deg)`,
                }}
              >
                {e}
              </span>
            ))}
          </div>

          <div className="relative">
            <div className="tall:hidden">
              <Pip mood="idle" size={120} reduceMotion={reduceMotion} />
            </div>
            <div className="hidden tall:block">
              <Pip mood="idle" size={140} reduceMotion={reduceMotion} />
            </div>
            <span
              aria-hidden="true"
              className="absolute -right-6 -top-2 whitespace-nowrap rounded-chip border-2 border-ink bg-gauze px-2.5 py-1 text-caption font-extrabold text-ink shadow-edge-ink"
            >
              {bubble}
            </span>
          </div>
        </m.div>

        {/* Title */}
        <m.h1 variants={item} className="font-display text-title font-bold text-ink">
          {COPY.landing.titleLead} <span className="highlighter">{COPY.landing.titleHighlight}</span>
        </m.h1>

        <m.p variants={item} className="max-w-[30ch] text-body-lg font-semibold text-ink">
          {COPY.landing.description}
        </m.p>

        {/* Badges */}
        <m.ul
          variants={item}
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="About this quiz"
        >
          <li className="chip gap-1 border-ink bg-sky px-2 text-ink">
            <ListChecks size={14} strokeWidth={2.5} aria-hidden="true" className="hidden min-[400px]:block" />
            {COPY.landing.badges.questions}
          </li>
          <li className="chip gap-1 border-ink bg-mint px-2 text-ink">
            <Timer size={14} strokeWidth={2.5} aria-hidden="true" className="hidden min-[400px]:block" />
            {COPY.landing.badges.time}
          </li>
          <li className="chip gap-1 border-ink bg-lavender px-2 text-ink">
            <ShieldCheck size={14} strokeWidth={2.5} aria-hidden="true" className="hidden min-[400px]:block" />
            {COPY.landing.badges.anon}
          </li>
        </m.ul>

        {/* Payoff preview */}
        <m.div
          variants={item}
          className="flex w-full items-center justify-between gap-3 rounded-card border-2 border-ink/10 bg-gauze/80 px-3 py-2 text-left"
        >
          <span
            aria-hidden="true"
            className="shrink-0 -rotate-6 rounded-chip border-2 border-dashed border-ink-lemon/60 bg-lemon/60 px-2 py-1 text-caption font-extrabold text-ink-lemon"
          >
            {best !== null ? `${best}/10` : "?/10"}
          </span>
          <span className="min-w-0 flex-1 text-caption font-bold text-plum">
            {best !== null
              ? COPY.landing.payoffReturning(best, stickerCount)
              : `${COPY.landing.payoffEmpty} · ${COPY.landing.payoffStickers}`}
          </span>
          <span aria-hidden="true" className="flex shrink-0 gap-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className={`size-2.5 rounded-full border ${i < stickerCount ? "border-ink bg-lemon" : "border-ink/30 bg-track"}`}
              />
            ))}
          </span>
        </m.div>

        {/* Live stats pill */}
        <m.div
          variants={item}
          className="chip h-auto min-h-8 whitespace-normal border-ink bg-lemon py-1 text-ink-lemon"
        >
          {showStats ? (
            <span>
              {COPY.landing.statsPillPrefix}<CountUp value={stats.total} />{COPY.landing.statsPillSuffix(stats.average)}
            </span>
          ) : (
            <span>{COPY.landing.statsFallback}</span>
          )}
        </m.div>
      </div>

      {/* Bottom */}
      <m.div variants={item} className="safe-bottom flex flex-col items-center gap-2.5 pt-2">
        <Sticker
          variant="primary"
          size="xl"
          full
          haptic={HAPTIC.tap}
          className={reduceMotion ? "" : "shimmer"}
          onClick={() => {
            unlockAudio();
            onStart();
          }}
        >
          {COPY.landing.cta}
          <ArrowRight size={22} strokeWidth={2.75} aria-hidden="true" />
        </Sticker>
        <p className="text-center text-caption font-semibold text-plum">{COPY.landing.privacy}</p>
        <p className="text-center text-caption text-plum/90">
          {COPY.disclaimer}
          {SITE.resourcesUrl && (
            <>
              {" "}
              <a href={SITE.resourcesUrl} className="font-bold text-violet-700 underline">
                {COPY.resourcesLink}
              </a>
            </>
          )}
        </p>
      </m.div>
    </m.main>
  );
}
