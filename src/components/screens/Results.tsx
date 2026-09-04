"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, m } from "motion/react";
import { Check, ChevronDown, Circle, ImageDown, RotateCcw, Share2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import FactCard from "@/components/FactCard";
import Pip, { type PipKit } from "@/components/Pip";
import { StoryCardModal } from "@/components/StoryCardModal";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Sticker } from "@/components/ui/Sticker";
import { useLiveStatus } from "@/components/ui/LiveStatus";
import { useToast } from "@/components/ui/Toasts";
import { useSettings } from "@/hooks/useSettings";
import { useSubmitResult } from "@/hooks/useStats";
import type { UseQuiz } from "@/hooks/useQuiz";
import { QUESTIONS, QUESTION_COUNT, tierForScore } from "@/data/questions";
import { COPY, formatDuration } from "@/lib/copy";
import { FLAGS, SITE } from "@/lib/config";
import { confettiForTier } from "@/lib/celebrations";
import { HAPTIC, vibrate } from "@/lib/haptics";
import { play } from "@/lib/sound";
import { buildShareText, shareResult, shareUrl, whatsappUrl } from "@/lib/share";
import { renderStoryCard, shareStoryCard } from "@/lib/story-card";
import { STICKER_ORDER, loadBest, loadStickers, type RunResult } from "@/lib/stickers";
import { MIN_PARTICIPANTS_FOR_STATS, type Stats } from "@/lib/types";

interface Props {
  quiz: UseQuiz;
  stats: Stats | null;
  kit: PipKit;
  /** Sticker/best outcome computed when the user tapped "Reveal my result" (null after a reload). */
  run: RunResult | null;
  onRetake: () => void;
}

const snap = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } as const;
const bouncy = { type: "spring", stiffness: 500, damping: 18, mass: 0.7 } as const;
const stamp = { type: "spring", stiffness: 600, damping: 26 } as const;

/** Choreography beats (ms). */
const BEAT = { ring: 200, stamp: 1500, tiles: 1800, grid: 2100, buttons: 2400, stickers: 2600 } as const;
type Beat = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function Tile({ className, children, skeleton }: { className: string; children?: React.ReactNode; skeleton?: boolean }) {
  return (
    <div
      className={[
        "min-h-[5.25rem] rounded-card border-2 px-3 py-2.5 text-body font-bold",
        skeleton ? "animate-pulse-soft border-ink/10 bg-gauze" : className,
      ].join(" ")}
      aria-busy={skeleton || undefined}
    >
      {!skeleton && children}
    </div>
  );
}

export default function Results({ quiz, stats, kit, run, onRetake }: Props) {
  const { state, score, canonical, duration } = quiz;
  const { reduceMotion } = useSettings();
  const { toast } = useToast();
  const { announce } = useLiveStatus();
  const tier = tierForScore(score);
  const correctFlags = useMemo(() => state.answers.map((a) => a.correct), [state.answers]);

  const { result, settled } = useSubmitResult({
    active: true,
    seed: state.seed,
    answers: canonical,
    durationMs: duration,
  });
  // Prefer the fresh post-submit stats; fall back to the landing fetch when the submit failed.
  const liveStats: Stats | null = result?.stats ?? stats;
  const percentile = result?.percentile ?? null;

  const [beat, setBeat] = useState<Beat>(0);
  const [countValue, setCountValue] = useState(0);
  const [storyBlob, setStoryBlob] = useState<Blob | null>(null);
  const [storyBusy, setStoryBusy] = useState(false);
  // Results is client-only (rendered after hydration), so reading storage here is safe.
  const [have] = useState(() => loadStickers());
  const [storedBest] = useState(() => loadBest());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const countRef = useRef<ReturnType<typeof animate> | null>(null);
  const announcedScore = useRef(false);
  const stampedRef = useRef(false);
  const announcedStats = useRef(false);

  const earned = useMemo(() => run?.earned ?? [], [run]);
  const best = run?.best ?? storedBest;
  const hadPreviousBest = run ? run.previousBest !== null : storedBest !== null;
  const shownScore = reduceMotion ? score : countValue;
  const revealed = beat >= 6;

  /* ------------------------------ choreography ----------------------------- */
  const runBeat = useCallback(
    (b: Beat) => {
      setBeat((prev) => (b > prev ? b : prev));
      if (b >= 1 && !announcedScore.current) {
        announcedScore.current = true;
        announce(COPY.results.ariaScore(score, QUESTION_COUNT, tier.label), { force: true });
      }
      if (b >= 2 && !stampedRef.current) {
        stampedRef.current = true;
        vibrate([30, 40, 30]);
      }
    },
    [announce, score, tier.label],
  );

  // Runs exactly once per mount (toggling motion mid-reveal must not replay it).
  const mountArgs = useRef({ score, tierKey: tier.key, reduceMotion, runBeat });
  useEffect(() => {
    const { score: s, tierKey, reduceMotion: rm, runBeat: go } = mountArgs.current;
    const t = timers.current;
    if (rm) {
      t.push(setTimeout(() => go(6), 200));
      return () => t.forEach(clearTimeout);
    }
    t.push(
      setTimeout(() => {
        go(1);
        play("fanfare");
        let lastInt = 0;
        countRef.current = animate(0, s, {
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => {
            const r = Math.round(v);
            setCountValue(r);
            if (r !== lastInt) {
              lastInt = r;
              play("tick");
              if (r % 2 === 0) vibrate(10);
            }
          },
        });
      }, BEAT.ring),
    );
    t.push(
      setTimeout(() => {
        go(2);
        play("thud");
        confettiForTier(tierKey);
      }, BEAT.stamp),
    );
    t.push(setTimeout(() => go(3), BEAT.tiles));
    t.push(setTimeout(() => go(4), BEAT.grid));
    t.push(setTimeout(() => go(5), BEAT.buttons));
    t.push(setTimeout(() => go(6), BEAT.stickers));
    return () => {
      t.forEach(clearTimeout);
      countRef.current?.stop();
    };
  }, []);

  const skip = () => {
    if (revealed) return;
    timers.current.forEach(clearTimeout);
    countRef.current?.stop();
    setCountValue(score);
    runBeat(6);
  };

  // Sticker toasts after the choreography
  useEffect(() => {
    if (!revealed || earned.length === 0) return;
    const ts = earned.map((k, i) =>
      setTimeout(() => {
        toast({ text: COPY.results.newSticker(COPY.stickers[k].name), variant: "lemon", key: `sticker-${k}` });
        play("kit");
      }, i * 300),
    );
    return () => ts.forEach(clearTimeout);
  }, [revealed, earned, toast]);

  /* ------------------------------- stats tiles ----------------------------- */
  const statsReady = settled || (stats !== null && !stats.available);
  const showStatsRow = !(liveStats && !liveStats.available && liveStats.reason === "not_configured");

  const hardestTopic = useMemo(() => {
    if (!liveStats?.available) return null;
    let min = Infinity;
    let idx = -1;
    liveStats.questionCorrectPct.forEach((p, i) => {
      // Never single out questions we don't broadcast misconceptions about (e.g. U=U).
      if (QUESTIONS[i]?.socialProof === false) return;
      if (p < min) {
        min = p;
        idx = i;
      }
    });
    return idx >= 0 ? QUESTIONS[idx].topic : null;
  }, [liveStats]);

  // Announce the comparison once the tiles are visible and the numbers are final.
  useEffect(() => {
    if (announcedStats.current || beat < 3 || !statsReady) return;
    if (!liveStats?.available || liveStats.total < MIN_PARTICIPANTS_FOR_STATS) return;
    announcedStats.current = true;
    const parts = [COPY.results.average(liveStats.total, liveStats.average)];
    if (percentile !== null && percentile >= 50) parts.push(COPY.results.percentile(percentile));
    else if (score > liveStats.average) parts.push(COPY.results.aboveAverage(liveStats.average));
    announce(parts.join(". "), { force: true });
  }, [beat, statsReady, liveStats, percentile, score, announce]);

  const renderStats = () => {
    if (!statsReady) {
      return (
        <>
          <Tile className="" skeleton />
          <Tile className="" skeleton />
        </>
      );
    }
    if (!liveStats?.available) {
      return (
        <Tile className="col-span-2 border-ink/15 bg-gauze text-ink">
          <span className="block text-body-lg">{COPY.results.statsUnavailable}</span>
        </Tile>
      );
    }
    if (liveStats.total < MIN_PARTICIPANTS_FOR_STATS) {
      return (
        <Tile className="col-span-2 border-ink/15 bg-lavender text-ink">
          <span className="block text-body-lg">{COPY.results.firstPlayers}</span>
        </Tile>
      );
    }
    const avg = liveStats.average;
    let right: React.ReactNode;
    if (percentile !== null && percentile >= 50) {
      right = (
        <Tile className="border-mint-edge bg-mint text-ink-mint">
          <span className="block text-body-lg leading-snug">{COPY.results.percentile(percentile)}</span>
        </Tile>
      );
    } else if (score > avg) {
      right = (
        <Tile className="border-mint-edge bg-mint text-ink-mint">
          <span className="block text-body-lg leading-snug">{COPY.results.aboveAverage(avg)}</span>
        </Tile>
      );
    } else {
      right = (
        <Tile className="border-ink/15 bg-lavender text-ink">
          <span className="block text-body leading-snug">
            {hardestTopic ? COPY.results.beatAverageTopic(avg, hardestTopic) : COPY.results.beatAverage(avg)}
          </span>
        </Tile>
      );
    }
    return (
      <>
        <Tile className="border-ink/15 bg-sky text-ink-sky">
          <span className="block text-caption font-extrabold uppercase tracking-wide">{COPY.results.averageLabel}</span>
          <span className="block font-display text-badge font-bold tabular">{avg.toFixed(1)}/10</span>
          <span className="block text-caption font-semibold">{COPY.results.ofPlayers(liveStats.total)}</span>
        </Tile>
        {right}
      </>
    );
  };

  /* --------------------------------- share --------------------------------- */
  const url = shareUrl(score);
  const shareText = buildShareText({
    score,
    tierLabel: tier.label,
    tierEmoji: tier.emoji,
    correct: correctFlags,
    percentile,
    url,
  });

  const onShare = async () => {
    const outcome = await shareResult({ title: COPY.brand.ogTitle, text: shareText, url });
    if (outcome === "copied") toast({ text: COPY.results.copied, variant: "violet", duration: 2000, announce: "force" });
    else if (outcome === "failed")
      toast({ text: COPY.results.shareFailed, variant: "violet", duration: 2000, announce: "force" });
  };

  const onStoryCard = async () => {
    if (storyBusy) return;
    setStoryBusy(true);
    try {
      const blob = await renderStoryCard({
        score,
        tierLabel: tier.label,
        tierEmoji: tier.emoji,
        correct: correctFlags,
        kit,
        siteHost: (SITE.url ?? window.location.origin).replace(/^https?:\/\//, ""),
      });
      const outcome = await shareStoryCard(blob, shareText);
      if (outcome === "fallback") setStoryBlob(blob);
    } catch {
      toast({ text: COPY.results.shareFailed, variant: "violet", duration: 2000, announce: "force" });
    } finally {
      setStoryBusy(false);
    }
  };

  /* --------------------------------- render -------------------------------- */
  const stampBg = tier.key === "champion" ? "bg-gold" : "bg-lemon";
  const retakeLabel =
    hadPreviousBest && best !== null && best < QUESTION_COUNT ? COPY.results.retakeBest(best) : COPY.results.retake;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col px-4 sm:px-5">
      <AppHeader left={<span className="eyebrow text-plum">{COPY.results.eyebrow}</span>} />

      <main className="flex flex-1 flex-col gap-3 pb-24 pt-2">
        {/* Score ring */}
        <div className="relative mx-auto mt-1 grid size-[180px] place-items-center tall:size-[200px]">
          <svg viewBox="0 0 200 200" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
            <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-track)" strokeWidth="14" />
            <m.circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--color-violet-edge)"
              strokeWidth="14"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: beat >= 1 ? Math.max(0.001, score / QUESTION_COUNT) : 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="text-center">
            <div className="font-display text-score font-bold text-ink tabular" aria-hidden="true">
              {shownScore}
              <span className="text-[1.5rem] font-semibold text-plum">/{QUESTION_COUNT}</span>
            </div>
          </div>
          <div className="absolute -right-3 -top-2" aria-hidden="true">
            <m.div
              animate={beat === 0 && !reduceMotion ? { rotate: [0, -4, 4, -4, 4, 0] } : { rotate: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Pip mood={beat >= 2 ? "celebrating" : "thinking"} kit={kit} size={72} reduceMotion={reduceMotion} />
            </m.div>
          </div>
          <p className="sr-only-live">{COPY.results.scoreOf(score, QUESTION_COUNT)}</p>
        </div>

        {/* Title stamp + growth line */}
        <div className="min-h-[5.25rem] text-center">
          <AnimatePresence>
            {beat >= 2 && (
              <m.div
                initial={reduceMotion ? { opacity: 0 } : { scale: 1.8, rotate: -14, opacity: 0 }}
                animate={{ scale: 1, rotate: -6, opacity: 1 }}
                transition={reduceMotion ? { duration: 0.2 } : stamp}
                className={`inline-block rounded-chip border-[3px] border-ink ${stampBg} px-4 py-1.5 font-display text-badge font-bold text-ink shadow-edge-ink`}
              >
                <h1 className="m-0">
                  {tier.label} <span aria-hidden="true">{tier.emoji}</span>
                </h1>
              </m.div>
            )}
          </AnimatePresence>
          {beat >= 2 && (
            <m.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...snap, delay: 0.15 }}
              className="mt-2.5 text-body font-semibold text-ink"
            >
              {COPY.results.growth(score)}
            </m.p>
          )}
        </div>

        {/* Stats */}
        {showStatsRow && (
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={beat >= 3 ? { opacity: 1, y: 0 } : {}}
            transition={snap}
            className="grid grid-cols-2 gap-3"
            inert={beat < 3}
          >
            {renderStats()}
          </m.div>
        )}

        {/* Follow */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={beat >= 5 ? { opacity: 1, y: 0 } : {}}
          transition={snap}
          className="flex flex-col gap-2.5"
          inert={beat < 5}
        >
          <Sticker as="a" href={SITE.instagramUrl} rel="noopener" size="lg" full>
            <InstagramIcon />
            {COPY.results.followInstagram}
          </Sticker>
          <Sticker as="a" href={SITE.tiktokUrl} rel="noopener" size="lg" full>
            <TikTokIcon />
            {COPY.results.followTiktok}
          </Sticker>
        </m.div>

        {/* Answer grid + share row */}
        <m.section
          initial={{ opacity: 0, y: 16 }}
          animate={beat >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={snap}
          className="rounded-card border-2 border-ink/10 bg-gauze p-3.5"
          aria-label={COPY.results.gridLabel}
          inert={beat < 4}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
              {correctFlags.map((c, i) => (
                <m.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={beat >= 4 ? { scale: 1 } : {}}
                  transition={{ ...bouncy, delay: i * 0.04 }}
                  className={`grid size-6 place-items-center rounded-[6px] border ${c ? "border-mint-edge bg-mint text-ink-mint" : "border-ink/15 bg-track"}`}
                >
                  {c && <Check size={14} strokeWidth={3.5} />}
                </m.span>
              ))}
            </div>
            <p className="text-right text-caption font-bold text-plum">{COPY.results.correctCount(score, QUESTION_COUNT)}</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Sticker size="sm" onClick={onShare} className="text-caption" aria-label={COPY.results.share}>
              <Share2 size={16} strokeWidth={2.5} aria-hidden="true" />
              {COPY.results.shareShort}
            </Sticker>
            <Sticker as="a" href={whatsappUrl(shareText)} rel="noopener" size="sm" variant="mint" className="text-caption">
              <WhatsAppIcon size={16} />
              {COPY.results.whatsapp}
            </Sticker>
            {FLAGS.storyCard && (
              <Sticker
                size="sm"
                onClick={onStoryCard}
                disabled={storyBusy}
                className="text-caption"
                aria-label={COPY.results.storyCard}
              >
                <ImageDown size={16} strokeWidth={2.5} aria-hidden="true" />
                {storyBusy ? "…" : COPY.results.storyCardShort}
              </Sticker>
            )}
          </div>
        </m.section>

        {/* Sticker book */}
        {FLAGS.stickerBook && (
          <m.section
            initial={{ opacity: 0, y: 16 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={snap}
            className="rounded-card border-2 border-ink/10 bg-gauze p-3.5"
            aria-label={COPY.results.stickerBook(have.size)}
            inert={!revealed}
          >
            <p className="eyebrow mb-2.5 text-plum">{COPY.results.stickerBook(have.size)}</p>
            <ul className="grid grid-cols-6 gap-1.5">
              {STICKER_ORDER.map((k) => {
                const owned = have.has(k);
                const isNew = earned.includes(k);
                const s = COPY.stickers[k];
                return (
                  <li key={k} className="flex flex-col items-center gap-1 text-center">
                    <m.span
                      initial={isNew ? { scale: 1.3, rotate: -12 } : false}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={bouncy}
                      className={[
                        "grid size-11 place-items-center rounded-chip border-2 text-xl",
                        owned
                          ? `${k === "perfect" ? "bg-gold" : "bg-lemon"} border-ink shadow-edge-ink`
                          : "border-dashed border-ink/30 bg-track/60 opacity-60 grayscale",
                      ].join(" ")}
                      role="img"
                      aria-label={`${s.name}${owned ? "" : ` — locked: ${s.hint}`}`}
                    >
                      {s.emoji}
                    </m.span>
                    <span className="text-caption font-bold leading-tight text-plum">{owned ? s.name : s.hint}</span>
                  </li>
                );
              })}
            </ul>
          </m.section>
        )}

        {/* XP tile */}
        <m.section
          initial={{ opacity: 0, y: 16 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={snap}
          className="rounded-card border-2 border-ink/10 bg-lemon/70 px-3.5 py-3 text-ink-lemon"
          inert={!revealed}
        >
          <p className="text-body font-extrabold tabular">
            {COPY.results.xpTile(state.xp, state.bestStreak, formatDuration(duration))}
          </p>
          <p className="mt-0.5 text-caption font-semibold">{COPY.results.xpNote}</p>
        </m.section>

        {/* Review accordion */}
        <m.section
          initial={{ opacity: 0, y: 16 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={snap}
          className="rounded-card border-2 border-ink/10 bg-gauze p-3.5"
          inert={!revealed}
        >
          <h2 className="eyebrow mb-2 text-plum">{COPY.results.review}</h2>
          <ul className="divide-y divide-ink/10">
            {QUESTIONS.map((q, i) => {
              const ok = state.answers[i]?.correct ?? false;
              return (
                <li key={q.id}>
                  <details className="group py-1.5">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 text-body font-bold text-ink [&::-webkit-details-marker]:hidden">
                      {ok ? (
                        <Check size={20} strokeWidth={3} className="shrink-0 text-mint-edge" aria-label={COPY.results.reviewCorrect} />
                      ) : (
                        <Circle size={20} strokeWidth={2.5} className="shrink-0 text-blush-edge" aria-label={COPY.results.reviewWrong} />
                      )}
                      <span className="flex-1">
                        <span className="mr-1.5 text-plum">Q{q.id}</span>
                        {q.topic}
                      </span>
                      <ChevronDown
                        size={18}
                        strokeWidth={2.5}
                        className="shrink-0 text-plum transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="space-y-2 pb-2 pl-[1.9rem] pt-1">
                      <p className="text-body font-semibold text-ink">{q.prompt}</p>
                      <p className="rounded-chip border-2 border-mint-edge/60 bg-mint px-3 py-2 text-body font-bold text-ink-mint">
                        {q.options[q.correctIndex]}
                      </p>
                      <p className="text-body text-ink">{ok ? q.correctFeedback : q.incorrectFeedback}</p>
                      <FactCard fact={q.fact} rare={q.rareFact} compact />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </m.section>

        <footer className="space-y-1.5 pb-2 text-center text-caption text-plum">
          <p>{COPY.results.footer}</p>
          <p>
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
          {SITE.orgName && <p className="font-bold">{SITE.orgName}</p>}
        </footer>
      </main>

      {/* Sticky bottom bar */}
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={beat >= 5 ? { opacity: 1, y: 0 } : {}}
        transition={snap}
        className="safe-bottom sticky bottom-0 -mx-4 mt-auto flex gap-3 border-t-2 border-ink/10 bg-lilac/95 px-4 pt-3 backdrop-blur-sm sm:-mx-5 sm:px-5"
        inert={beat < 5}
      >
        <Sticker
          variant="primary"
          size="xl"
          className="min-h-14 flex-[3] text-[1.0625rem]"
          onClick={onRetake}
          haptic={HAPTIC.tap}
          aria-label={COPY.results.retake}
        >
          <RotateCcw size={20} strokeWidth={2.75} aria-hidden="true" />
          <span className="truncate">{retakeLabel}</span>
        </Sticker>
        <Sticker size="lg" className="min-h-14 flex-[2] text-violet-edge" onClick={onShare} aria-label={COPY.results.share}>
          <Share2 size={20} strokeWidth={2.75} aria-hidden="true" />
          {COPY.results.shareShort}
        </Sticker>
      </m.div>

      {/* Skip overlay: blocks taps on not-yet-revealed controls and offers an explicit skip. */}
      {!revealed && (
        <button
          type="button"
          onClick={skip}
          className="fixed inset-0 z-50 flex items-end justify-center bg-transparent pb-28 outline-none"
        >
          <span className="rounded-chip border-2 border-ink bg-gauze px-3 py-1.5 text-caption font-extrabold text-plum shadow-toast">
            {COPY.results.skipChoreo}
          </span>
        </button>
      )}

      <StoryCardModal open={storyBlob !== null} blob={storyBlob} onClose={() => setStoryBlob(null)} />
    </div>
  );
}
