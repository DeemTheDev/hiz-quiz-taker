"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionGlobalConfig, m } from "motion/react";
import type { PipKit } from "@/components/Pip";
import Landing from "@/components/screens/Landing";
import QuestionScreen from "@/components/screens/QuestionScreen";
import Results from "@/components/screens/Results";
import { LiveStatusProvider } from "@/components/ui/LiveStatus";
import { ToastProvider, useToast } from "@/components/ui/Toasts";
import { SettingsProvider } from "@/hooks/useSettings";
import { useQuiz } from "@/hooks/useQuiz";
import { useStats } from "@/hooks/useStats";
import { FLAGS } from "@/lib/config";
import { applyRun, type RunResult } from "@/lib/stickers";
import type { QuizState } from "@/lib/quiz-state";

function kitFor(state: QuizState): PipKit {
  if (!FLAGS.kitUnlocks) return {};
  const reached = state.phase === "results" ? 10 : state.index;
  return {
    badge: reached >= 2,
    stetho: reached >= 5,
    goggles: reached >= 7,
    hat: reached >= 9,
  };
}

function Shell() {
  const quiz = useQuiz();
  const stats = useStats(true);
  const { clearQueue } = useToast();
  const [run, setRun] = useState<RunResult | null>(null);

  const phase = quiz.state.phase;

  useEffect(() => {
    clearQueue();
  }, [phase, clearQueue]);

  // Test affordance: `localStorage.setItem("hq:skipAnimations", "1")` makes every
  // motion animation complete instantly (used by automated/browser tests).
  useEffect(() => {
    try {
      if (localStorage.getItem("hq:skipAnimations") === "1") MotionGlobalConfig.skipAnimations = true;
    } catch {
      /* ignore */
    }
  }, []);

  const kit = useMemo(() => kitFor(quiz.state), [quiz.state]);

  // Called from the "Reveal my result" click: persist stickers/best (device-only).
  const onFinish = useCallback(() => {
    if (!FLAGS.stickerBook) return;
    setRun(applyRun({ score: quiz.score, bestStreak: quiz.state.bestStreak }));
  }, [quiz.score, quiz.state.bestStreak]);

  const onRetake = useCallback(() => {
    setRun(null);
    quiz.retake();
  }, [quiz]);

  if (!quiz.hydrated) return <div className="min-h-svh" aria-busy="true" />;

  const screenKey = phase === "landing" ? "landing" : phase === "results" ? "results" : "quiz";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={screenKey}
        className="flex min-h-svh flex-col"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
      >
        {phase === "landing" && <Landing onStart={quiz.start} stats={stats} />}
        {(phase === "question" || phase === "feedback") && (
          <QuestionScreen quiz={quiz} stats={stats} kit={kit} onFinish={onFinish} />
        )}
        {phase === "results" && <Results quiz={quiz} stats={stats} kit={kit} run={run} onRetake={onRetake} />}
      </m.div>
    </AnimatePresence>
  );
}

export default function QuizApp() {
  return (
    <SettingsProvider>
      <LiveStatusProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </LiveStatusProvider>
    </SettingsProvider>
  );
}
