"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, m } from "motion/react";
import { ChevronDown, CircleCheck, CircleX, Lightbulb } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import FactCard from "@/components/FactCard";
import Pip, { type PipKit, type PipMood } from "@/components/Pip";
import { Sticker } from "@/components/ui/Sticker";
import { useLiveStatus } from "@/components/ui/LiveStatus";
import { useToast } from "@/components/ui/Toasts";
import { useSettings } from "@/hooks/useSettings";
import type { UseQuiz } from "@/hooks/useQuiz";
import { QUESTION_COUNT } from "@/data/questions";
import { COPY } from "@/lib/copy";
import { FLAGS } from "@/lib/config";
import { GAME } from "@/lib/quiz-state";
import { HAPTIC, vibrate } from "@/lib/haptics";
import { play, playOnGesture } from "@/lib/sound";
import { confettiStreak3, confettiStreak5, preloadConfetti } from "@/lib/celebrations";
import type { Stats } from "@/lib/types";

interface Props {
  quiz: UseQuiz;
  stats: Stats | null;
  kit: PipKit;
  /** Called from the "Reveal my result" tap, before the phase changes. */
  onFinish: () => void;
}

type Stage = "idle" | "locked" | "revealed" | "sheet" | "settled";

const LETTERS = ["A", "B", "C", "D"];
const SOCIAL_PROOF_MIN = 50;

const snap = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } as const;
const bouncy = { type: "spring", stiffness: 500, damping: 18, mass: 0.7 } as const;
const sheetSpring = { type: "spring", stiffness: 320, damping: 34 } as const;

/* ------------------------------------------------------------------------ */
/* Header pieces                                                             */
/* ------------------------------------------------------------------------ */

function ProgressBar({ index, lit }: { index: number; lit: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={QUESTION_COUNT}
      aria-valuenow={index + 1}
      aria-valuetext={COPY.question.progressLabel(index + 1, QUESTION_COUNT)}
      className="flex h-2.5 gap-1"
    >
      {Array.from({ length: QUESTION_COUNT }).map((_, i) => {
        const on = i < lit;
        const finalStretch = i >= 7;
        const current = i === index;
        return (
          <div key={i} className="relative h-full flex-1 overflow-hidden rounded-[5px] bg-track">
            <m.div
              className={[
                "absolute inset-0 origin-left rounded-[5px]",
                on ? (finalStretch ? "border border-ink-lemon/40 bg-lemon" : "bg-violet-edge") : "",
                on && current && finalStretch ? "animate-pulse-soft" : "",
              ].join(" ")}
              initial={false}
              animate={{ scaleX: on ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            />
          </div>
        );
      })}
    </div>
  );
}

function XpChip({ xp, streak, bounceBack }: { xp: number; streak: number; bounceBack: boolean }) {
  const [shown, setShown] = useState(xp);
  const prev = useRef(xp);
  const { reduceMotion } = useSettings();

  useEffect(() => {
    if (xp === prev.current) return;
    const from = prev.current;
    prev.current = xp;
    if (reduceMotion) return;
    let lastTick = -1;
    const controls = animate(from, xp, {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        setShown(Math.round(v));
        const step = Math.floor((v - from) / Math.max(1, (xp - from) / 10));
        if (step !== lastTick) {
          lastTick = step;
          play("tick");
        }
      },
    });
    // Safety net: if frames are throttled (background tab), still land on the final value.
    const settle = setTimeout(() => setShown(xp), 600);
    return () => {
      controls.stop();
      clearTimeout(settle);
    };
  }, [xp, reduceMotion]);

  const value = reduceMotion ? xp : shown;
  const label = bounceBack
    ? COPY.streak.bounceBack
    : streak >= 2
      ? COPY.question.xpChipStreak(value, streak)
      : COPY.question.xpChip(value);

  return (
    <m.span
      aria-live="off"
      className={`chip border-ink ${streak >= GAME.streakFireAt ? "bg-peach text-ink-peach" : "bg-lavender text-ink"}`}
      animate={{ scale: streak >= 3 ? 1.08 : 1 }}
      transition={snap}
    >
      <span className="tabular">{label}</span>
    </m.span>
  );
}

/* ------------------------------------------------------------------------ */
/* Per-question stage (remounts on every question via `key`)                 */
/* ------------------------------------------------------------------------ */

interface StageProps extends Props {
  /** Tell the header about reveals (for the bounce-back chip). */
  onReveal: (correct: boolean, prevStreak: number) => void;
  /** The sheet has settled: the header may now show the new XP/streak. */
  onSettled: () => void;
}

function QuestionStage({ quiz, stats, kit, onFinish, onReveal, onSettled }: StageProps) {
  const { state, question, options, last, isLast, next, answer } = quiz;
  const { reduceMotion } = useSettings();
  const { toast } = useToast();
  const { announce } = useLiveStatus();

  const index = state.index;
  const isFeedback = state.phase === "feedback";
  const correct = last?.correct ?? false;

  const [stage, setStage] = useState<Stage>(() => (isFeedback ? "settled" : "idle"));
  const [chosenPos, setChosenPos] = useState<number | null>(() =>
    isFeedback && last ? options.findIndex((o) => o.canonical === last.canonical) : null,
  );
  const [streakPaused, setStreakPaused] = useState(false);
  const [idleNudge, setIdleNudge] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const advancedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const verdictRef = useRef<HTMLHeadingElement>(null);
  const sheetBodyRef = useRef<HTMLDivElement>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  // Mount: focus, kit toast, confetti preload. Timers are cleaned on unmount.
  useEffect(() => {
    const timers = timersRef.current;
    headingRef.current?.focus({ preventScroll: true });

    if (FLAGS.kitUnlocks && !isFeedback) {
      const kitText =
        index === 2
          ? COPY.kit.badge
          : index === 5
            ? COPY.kit.stetho
            : index === 7
              ? COPY.kit.goggles
              : index === 9
                ? COPY.kit.hat
                : null;
      if (kitText) {
        timers.push(
          setTimeout(() => {
            toast({ text: kitText, variant: "lemon", priority: 2, key: `kit-${index}` });
            play("kit");
          }, 350),
        );
      }
    }
    if (index === 7) void preloadConfetti();
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Idle nudge after 12 s without an answer
  useEffect(() => {
    if (stage !== "idle") return;
    const t = setTimeout(() => setIdleNudge(true), 12_000);
    return () => clearTimeout(t);
  }, [stage]);

  // "more" affordance when the sheet body overflows
  useEffect(() => {
    if (stage !== "sheet" && stage !== "settled") return;
    const el = sheetBodyRef.current;
    if (!el) return;
    const check = () => setShowMore(el.scrollHeight > el.clientHeight + 8 && el.scrollTop < 8);
    const raf = requestAnimationFrame(check);
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [stage]);

  const onPick = (position: number) => {
    if (stage !== "idle") return;
    const picked = options[position];
    if (!picked) return;

    const prevStreak = state.streak;
    const willBeCorrect = picked.isCorrect;
    const newStreak = willBeCorrect ? prevStreak + 1 : 0;

    playOnGesture("select");
    vibrate(HAPTIC.select);
    setChosenPos(position);
    setStage("locked");
    if (!willBeCorrect && prevStreak >= 2) setStreakPaused(true);
    answer(position); // phase → feedback (locked; no take-backs)

    const t = reduceMotion
      ? { reveal: 40, sheet: 120, focus: 400, chips: 450 }
      : { reveal: 180, sheet: 400, focus: 700, chips: 750 };

    later(() => {
      setStage("revealed");
      onReveal(willBeCorrect, prevStreak);
      if (willBeCorrect) {
        play("correct");
        vibrate(HAPTIC.correct);
        // Short cue now; the verdict heading (focused at t=700) carries the explanation via aria-describedby.
        announce(COPY.feedback.ariaCorrectShort, { force: true });
        if (newStreak === 3) {
          later(() => {
            toast({ text: COPY.streak.toast3, variant: "lemon", priority: 3, key: "streak3" });
            confettiStreak3();
            play("streak");
          }, 500);
        } else if (newStreak === 5) {
          later(() => {
            toast({ text: COPY.streak.banner5, variant: "lemon", priority: 5, banner: true, key: "streak5" });
            confettiStreak5();
            play("streak");
            vibrate(HAPTIC.streak);
          }, 500);
        }
      } else {
        play("wrong");
        vibrate(HAPTIC.wrong);
        announce(COPY.feedback.ariaWrongShort(question.options[question.correctIndex]), { force: true });
      }
    }, t.reveal);

    later(() => setStage("sheet"), t.sheet);
    later(() => verdictRef.current?.focus({ preventScroll: true }), t.focus);
    later(() => {
      setStage("settled");
      onSettled();
    }, t.chips);
  };

  const onNext = () => {
    if (advancedRef.current) return; // double-tap guard
    advancedRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (isLast) onFinish();
    next();
  };

  /* ---------------------------------- derived ---------------------------------- */

  const pipMood: PipMood = !isFeedback ? "peek" : stage === "locked" ? "thinking" : correct ? "correct" : "curious";

  const proofLine = useMemo(() => {
    if (!FLAGS.socialProof || !isFeedback) return null;
    if (!stats || !stats.available) return null;
    if (question.socialProof === false) return null;
    if (stats.total < SOCIAL_PROOF_MIN) return COPY.feedback.proofFallback;
    const pct = stats.questionCorrectPct[index] ?? 0;
    if (correct) return COPY.feedback.proofKnew(pct);
    return pct < 50 ? COPY.feedback.proofMostMissed : COPY.feedback.proofNowYouKnow(pct);
  }, [stats, question, index, correct, isFeedback]);

  const xpChips = useMemo(() => {
    if (!last) return [];
    if (!last.correct) return [COPY.feedback.xpLearned];
    const chips: string[] = [];
    const mult = GAME.streakMultiplier(last.streakAfter);
    chips.push(COPY.feedback.xpGain(Math.round(GAME.xpCorrect * mult)));
    if (last.timeMs <= GAME.speedWindowMs) chips.push(COPY.feedback.quickBonus);
    if (mult > 1) chips.push(COPY.feedback.multiplier(mult));
    return chips;
  }, [last]);

  const revealed = stage === "revealed" || stage === "sheet" || stage === "settled";
  const collapsed = stage === "sheet" || stage === "settled";
  const explanationId = `feedback-explanation-${index}`;

  /* ---------------------------------- render ----------------------------------- */

  return (
    <>
      {/* Question card */}
      <section
        aria-labelledby="question-heading"
        className={[
          "relative rounded-card border-2 border-ink bg-gauze shadow-edge-lg transition-[padding] duration-200 short:p-2.5",
          collapsed ? "px-3.5 py-2.5" : "p-3.5",
        ].join(" ")}
      >
        {!collapsed && <span className="eyebrow text-violet-edge">{question.topic}</span>}
        <h2
          id="question-heading"
          ref={headingRef}
          tabIndex={-1}
          className={[
            "rounded-chip transition-[font-size,color] duration-200",
            collapsed
              ? "text-body font-semibold text-plum"
              : "mt-0.5 pr-14 font-display text-prompt font-semibold text-ink short:text-[1.0625rem]",
          ].join(" ")}
        >
          {question.prompt}
        </h2>
        {!collapsed && (
          <div aria-hidden="true" className="absolute -top-3 right-3">
            <Pip mood={pipMood} kit={kit} size={56} reduceMotion={reduceMotion} />
            {idleNudge && stage === "idle" && (
              <span className="absolute -left-7 top-2 rounded-chip border-2 border-ink bg-gauze px-1.5 py-0.5 text-caption font-extrabold">
                {COPY.question.idleBubble}
              </span>
            )}
          </div>
        )}
      </section>

      {/* Options / evidence chips (buttons stay in the a11y tree as the record of the answer) */}
      <fieldset
        className={[
          "m-0 flex min-h-0 flex-col border-0 p-0",
          collapsed ? "gap-2 pt-3" : "flex-1 justify-center gap-2.5 py-3 short:gap-2",
        ].join(" ")}
        aria-disabled={stage !== "idle"}
      >
        <legend className="sr-only-live">{question.prompt}</legend>
        <AnimatePresence initial={false}>
          {options.map((opt) => {
            const isChosen = chosenPos === opt.position;
            const showAsCorrect = revealed && opt.isCorrect;
            const showAsWrong = revealed && isChosen && !opt.isCorrect;
            const keep = !collapsed || showAsCorrect || showAsWrong;
            if (!keep) return null;

            const face = showAsCorrect ? "bg-mint" : showAsWrong ? "bg-blush" : "";
            const border = showAsCorrect
              ? "border-mint-edge shadow-edge-mint"
              : showAsWrong
                ? "border-blush-edge shadow-edge-blush"
                : "border-violet-edge shadow-edge";
            const dim = revealed && !showAsCorrect && !showAsWrong;

            return (
              <m.div
                key={opt.canonical}
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: dim ? 0.55 : 1,
                  y: 0,
                  scale: stage === "locked" && isChosen ? 0.97 : 1,
                  x: showAsWrong && stage === "revealed" && !reduceMotion ? [0, -6, 6, -4, 4, 0] : 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
                }}
                transition={{
                  ...snap,
                  delay: revealed ? 0 : opt.position * 0.045,
                  // Springs only support two keyframes: the shake is a tween.
                  x: { type: "tween", duration: 0.24, ease: [0.36, 0.07, 0.19, 0.97] },
                }}
                style={{ overflow: "hidden" }}
              >
                {collapsed && (
                  <span
                    className={`eyebrow mb-1 flex items-center gap-1 ${showAsCorrect ? "text-ink-mint" : "text-ink-blush"}`}
                  >
                    {showAsCorrect ? (
                      <CircleCheck size={16} strokeWidth={2.75} aria-hidden="true" />
                    ) : (
                      <CircleX size={16} strokeWidth={2.75} aria-hidden="true" />
                    )}
                    {showAsCorrect ? COPY.feedback.correctChip : COPY.feedback.yourAnswerChip}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onPick(opt.position)}
                  aria-disabled={stage !== "idle"}
                  aria-pressed={isChosen || undefined}
                  tabIndex={stage === "idle" ? 0 : -1}
                  className={[
                    "sticker relative flex w-full items-center gap-3 overflow-hidden text-left",
                    collapsed ? "min-h-12 rounded-chip px-3 py-2" : "min-h-14 px-3.5 py-3 short:min-h-12 short:py-2",
                    border,
                    stage !== "idle" ? "cursor-default" : "",
                  ].join(" ")}
                >
                  {(showAsCorrect || showAsWrong) && (
                    <m.span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 ${face}`}
                      initial={{ clipPath: "inset(0 100% 0 0)" }}
                      animate={{ clipPath: "inset(0 0% 0 0)" }}
                      transition={{
                        duration: reduceMotion ? 0.12 : 0.22,
                        ease: [0.2, 0, 0, 1],
                        delay: showAsCorrect && !isChosen ? 0.08 : 0,
                      }}
                    />
                  )}
                  {!collapsed && (
                    <span
                      aria-hidden="true"
                      className={[
                        "relative grid size-8 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-bold",
                        showAsCorrect
                          ? "border-mint-edge bg-mint text-ink-mint"
                          : showAsWrong
                            ? "border-blush-edge bg-blush text-ink-blush"
                            : "border-ink/15 bg-lavender text-ink",
                      ].join(" ")}
                    >
                      {showAsCorrect ? (
                        <m.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={bouncy}>
                          <CircleCheck size={20} strokeWidth={2.75} />
                        </m.span>
                      ) : showAsWrong ? (
                        <m.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={bouncy}>
                          <CircleX size={20} strokeWidth={2.75} />
                        </m.span>
                      ) : (
                        LETTERS[opt.position]
                      )}
                    </span>
                  )}
                  <span className={`relative font-bold leading-snug ${collapsed ? "text-body" : "text-option"}`}>
                    {opt.text}
                  </span>
                </button>
              </m.div>
            );
          })}
        </AnimatePresence>
      </fieldset>

      {/* Ghost hint (Q1–Q2, and after an idle nudge) */}
      {!isFeedback && (index < 2 || idleNudge) && (
        <p className="pb-2 text-center text-caption font-semibold text-plum short:hidden">
          {COPY.question.ghostHint}
        </p>
      )}

      {/* Feedback sheet */}
      <AnimatePresence>
        {collapsed && last && (
          <m.section
            key="sheet"
            role="region"
            aria-label={COPY.feedback.regionLabel}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            transition={reduceMotion ? { duration: 0.15 } : sheetSpring}
            className="relative -mx-4 mt-1 flex min-h-0 flex-1 flex-col rounded-t-sheet border-2 border-b-0 border-ink bg-gauze shadow-sheet sm:-mx-5"
            style={{ willChange: "transform" }}
          >
            <div aria-hidden="true" className="absolute -top-9 right-5">
              <Pip mood={correct ? "correct" : "curious"} kit={kit} size={64} reduceMotion={reduceMotion} />
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col">
              {/* Verdict strip */}
              <h3
                ref={verdictRef}
                tabIndex={-1}
                aria-describedby={explanationId}
                className={[
                  "mx-4 mt-3 flex min-h-11 items-center gap-2 rounded-chip border-2 px-3 py-2 font-display text-verdict font-bold",
                  correct ? "border-mint-edge bg-mint text-ink-mint" : "border-blush-edge bg-blush text-ink-blush",
                ].join(" ")}
              >
                {correct ? (
                  <CircleCheck size={24} strokeWidth={2.75} aria-hidden="true" className="shrink-0" />
                ) : (
                  <Lightbulb size={24} strokeWidth={2.75} aria-hidden="true" className="shrink-0" />
                )}
                <span>
                  {correct ? COPY.feedback.correctHeader : COPY.feedback.wrongHeader}{" "}
                  <span aria-hidden="true">{correct ? COPY.feedback.correctHeaderEmoji : COPY.feedback.wrongHeaderEmoji}</span>
                </span>
              </h3>

              {/* Scrollable body (focusable so keyboard users can scroll it) */}
              <div
                ref={sheetBodyRef}
                tabIndex={0}
                className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto rounded-chip px-4 pb-2 pt-3 [overscroll-behavior:contain]"
              >
                <p id={explanationId} className="text-body-lg font-semibold text-ink">
                  {correct ? question.correctFeedback : question.incorrectFeedback}
                </p>
                <div className="mt-3">
                  <FactCard fact={question.fact} rare={question.rareFact} />
                </div>

                {stage === "settled" && (
                  <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={snap} className="mt-3 space-y-2">
                    {proofLine && <p className="text-caption font-semibold text-plum">{proofLine}</p>}
                    <div role="group" className="flex flex-wrap gap-1.5" aria-label={COPY.feedback.pointsLabel}>
                      {xpChips.map((c, i) => (
                        <m.span
                          key={c}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...snap, delay: i * 0.06 }}
                          className="chip border-ink bg-lemon text-ink-lemon"
                        >
                          {c}
                        </m.span>
                      ))}
                      {streakPaused && <span className="chip border-ink/30 bg-gauze text-plum">{COPY.streak.paused}</span>}
                    </div>
                  </m.div>
                )}
              </div>

              {/* "more" affordance */}
              <AnimatePresence>
                {showMore && (
                  <m.button
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => sheetBodyRef.current?.scrollBy({ top: 160, behavior: "smooth" })}
                    className="absolute bottom-[4.75rem] left-1/2 -translate-x-1/2 rounded-chip border-2 border-ink bg-gauze px-3 py-1 text-caption font-extrabold text-ink shadow-toast"
                    aria-label={COPY.feedback.moreAria}
                  >
                    <span className="inline-flex items-center gap-1">
                      <ChevronDown size={14} strokeWidth={3} aria-hidden="true" /> more
                    </span>
                  </m.button>
                )}
              </AnimatePresence>

              {/* Next */}
              <div className="safe-bottom border-t-2 border-ink/10 bg-gauze px-4 pt-2.5">
                <Sticker variant="primary" size="lg" full onClick={onNext} className="min-h-14">
                  {isLast ? COPY.feedback.reveal : COPY.feedback.next}{" "}
                  <span aria-hidden="true">{isLast ? COPY.feedback.revealGlyph : COPY.feedback.nextGlyph}</span>
                </Sticker>
              </div>
            </div>
          </m.section>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Screen shell: header + progress + animated per-question stage             */
/* ------------------------------------------------------------------------ */

export default function QuestionScreen(props: Props) {
  const { quiz } = props;
  const { state } = quiz;
  const index = state.index;

  // The header lags the reducer: XP/streak update only once the sheet has settled,
  // so the chip never spoils the verdict and the tick sounds never overlap the reveal cue.
  const [header, setHeader] = useState({ xp: state.xp, streak: state.streak });
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const onSettled = useCallback(() => {
    setHeader({ xp: stateRef.current.xp, streak: stateRef.current.streak });
  }, []);

  const [bounceBack, setBounceBack] = useState(false);
  const brokeRef = useRef(false);
  const onReveal = useCallback((correct: boolean, prevStreak: number) => {
    if (correct) {
      if (brokeRef.current) {
        brokeRef.current = false;
        setBounceBack(true);
        setTimeout(() => setBounceBack(false), 900);
      }
    } else if (prevStreak >= 2) {
      brokeRef.current = true;
    }
  }, []);

  const remaining = QUESTION_COUNT - (index + 1);
  const countdown = index >= 6 ? COPY.question.countdown(remaining) : null;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col px-4 sm:px-5">
      <AppHeader
        left={
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={countdown ?? `q-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="eyebrow block truncate text-plum"
            >
              {countdown ?? COPY.question.eyebrow(index + 1, QUESTION_COUNT)}
            </m.span>
          </AnimatePresence>
        }
      />
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <ProgressBar index={index} lit={index + 1} />
        </div>
        <XpChip xp={header.xp} streak={header.streak} bounceBack={bounceBack} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={index}
          className="flex min-h-0 flex-1 flex-col pt-3"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -48, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
          transition={snap}
        >
          <QuestionStage {...props} onReveal={onReveal} onSettled={onSettled} />
        </m.div>
      </AnimatePresence>
    </main>
  );
}
