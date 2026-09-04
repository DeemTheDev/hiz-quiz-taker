"use client";

import { useCallback, useEffect, useMemo, useReducer, useSyncExternalStore } from "react";
import { QUESTION_COUNT } from "@/data/questions";
import {
  canonicalAnswers,
  currentQuestion,
  displayedOptions,
  durationMs,
  initialState,
  isLastQuestion,
  lastAnswer,
  quizReducer,
  score,
  type QuizState,
} from "@/lib/quiz-state";
import { randomSeed } from "@/lib/shuffle";

const STORAGE_KEY = "hq:quiz:v1";

/** Restore an in-progress attempt (in-app browsers love to reload pages). */
function loadPersisted(): QuizState | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizState;
    if (!parsed || typeof parsed !== "object" || !("phase" in parsed)) return null;
    if (parsed.phase === "landing") return null;
    if (!Array.isArray(parsed.displayOrders) || parsed.displayOrders.length !== QUESTION_COUNT) return null;
    // Re-arm the question timer so the speed bonus isn't unfairly lost/gained.
    return {
      ...parsed,
      questionShownAt: parsed.phase === "question" ? Date.now() : parsed.questionShownAt,
    };
  } catch {
    return null;
  }
}

function persist(state: QuizState) {
  try {
    if (state.phase === "landing") sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

const noopSubscribe = () => () => {};
/** false during SSR + hydration, true afterwards — without a setState-in-effect. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useQuiz() {
  const hydrated = useIsClient();
  const [state, dispatch] = useReducer(quizReducer, undefined, () => loadPersisted() ?? initialState(1));

  useEffect(() => {
    if (hydrated) persist(state);
  }, [state, hydrated]);

  const start = useCallback(() => dispatch({ type: "start", seed: randomSeed(), now: Date.now() }), []);
  const answer = useCallback((position: number) => dispatch({ type: "answer", position, now: Date.now() }), []);
  const next = useCallback(() => dispatch({ type: "next", now: Date.now() }), []);
  const retake = useCallback(() => dispatch({ type: "retake", seed: randomSeed(), now: Date.now() }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const derived = useMemo(
    () => ({
      question: currentQuestion(state),
      options: displayedOptions(state),
      last: lastAnswer(state),
      score: score(state),
      total: QUESTION_COUNT,
      isLast: isLastQuestion(state),
      canonical: canonicalAnswers(state),
      duration: durationMs(state),
    }),
    [state],
  );

  return { state, hydrated, ...derived, start, answer, next, retake, reset };
}

export type UseQuiz = ReturnType<typeof useQuiz>;
