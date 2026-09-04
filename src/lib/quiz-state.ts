/**
 * Quiz state machine (pure, framework-agnostic, fully unit-testable).
 *
 * Phases:
 *   landing  → start()      → question (answering)
 *   question → answer(i)    → feedback (locked; shows explanation)
 *   feedback → next()       → question | results
 *   results  → retake()     → question (fresh seed)
 */

import { QUESTIONS, QUESTION_COUNT, type OptionIndex } from "@/data/questions";
import { buildDisplayOrders } from "@/lib/shuffle";

/* ----------------------------- Gamification ----------------------------- */

export const GAME = {
  /** XP for a correct answer */
  xpCorrect: 100,
  /** XP awarded even when wrong (learning something counts) */
  xpWrong: 10,
  /** Bonus when the answer is given within `speedWindowMs` */
  xpSpeedBonus: 50,
  speedWindowMs: 15_000,
  /** Streak multipliers: streak length → multiplier on xpCorrect */
  streakMultiplier: (streak: number) => (streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1),
  /** Streak length at which the "on fire" state begins */
  streakFireAt: 3,
} as const;

/* -------------------------------- Types --------------------------------- */

export type Phase = "landing" | "question" | "feedback" | "results";

export interface AnswerRecord {
  /** canonical option index (0 = correct) */
  canonical: OptionIndex;
  correct: boolean;
  /** ms from question shown → answer tapped */
  timeMs: number;
  xpEarned: number;
  /** streak length after this answer */
  streakAfter: number;
}

export interface QuizState {
  phase: Phase;
  seed: number;
  /** displayOrders[q][position] = canonical option index */
  displayOrders: number[][];
  index: number; // current question index (0-based)
  answers: AnswerRecord[]; // one per answered question, in order
  streak: number;
  bestStreak: number;
  xp: number;
  /** epoch ms when the current question was shown (for speed bonus) */
  questionShownAt: number | null;
  /** epoch ms when the first question was shown */
  startedAt: number | null;
  /** epoch ms when the last answer was given */
  finishedAt: number | null;
  /** how many attempts have been made this session (for retake copy) */
  attempt: number;
}

export type QuizAction =
  | { type: "start"; seed: number; now: number }
  | { type: "answer"; position: number; now: number }
  | { type: "next"; now: number }
  | { type: "retake"; seed: number; now: number }
  | { type: "restore"; state: QuizState }
  | { type: "reset" };

/* ------------------------------ Selectors ------------------------------- */

export function initialState(seed = 1): QuizState {
  return {
    phase: "landing",
    seed,
    displayOrders: buildDisplayOrders(QUESTION_COUNT, seed),
    index: 0,
    answers: [],
    streak: 0,
    bestStreak: 0,
    xp: 0,
    questionShownAt: null,
    startedAt: null,
    finishedAt: null,
    attempt: 0,
  };
}

export function currentQuestion(state: QuizState) {
  return QUESTIONS[Math.min(state.index, QUESTION_COUNT - 1)];
}

/** Options for the current question in display order, with canonical mapping. */
export function displayedOptions(state: QuizState) {
  const q = currentQuestion(state);
  const order = state.displayOrders[state.index] ?? [0, 1, 2, 3];
  return order.map((canonical, position) => ({
    position,
    canonical: canonical as OptionIndex,
    text: q.options[canonical],
    isCorrect: canonical === q.correctIndex,
  }));
}

export function lastAnswer(state: QuizState): AnswerRecord | undefined {
  return state.answers[state.index];
}

export function score(state: QuizState): number {
  return state.answers.filter((a) => a.correct).length;
}

export function canonicalAnswers(state: QuizState): OptionIndex[] {
  return state.answers.map((a) => a.canonical);
}

export function durationMs(state: QuizState): number | undefined {
  if (state.startedAt == null || state.finishedAt == null) return undefined;
  return Math.max(0, state.finishedAt - state.startedAt);
}

export function isLastQuestion(state: QuizState): boolean {
  return state.index >= QUESTION_COUNT - 1;
}

/* -------------------------------- Reducer ------------------------------- */

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "start":
    case "retake": {
      if (action.type === "start" && state.phase !== "landing") return state;
      if (action.type === "retake" && state.phase !== "results") return state;
      const fresh = initialState(action.seed);
      return {
        ...fresh,
        phase: "question",
        questionShownAt: action.now,
        startedAt: action.now,
        attempt: state.attempt + 1,
      };
    }

    case "answer": {
      if (state.phase !== "question") return state; // locked: no changing answers
      const options = displayedOptions(state);
      const picked = options[action.position];
      if (!picked) return state;

      const timeMs = state.questionShownAt == null ? 0 : Math.max(0, action.now - state.questionShownAt);
      const correct = picked.isCorrect;
      const streak = correct ? state.streak + 1 : 0;

      let xpEarned: number = GAME.xpWrong;
      if (correct) {
        xpEarned = Math.round(GAME.xpCorrect * GAME.streakMultiplier(streak));
        if (timeMs <= GAME.speedWindowMs) xpEarned += GAME.xpSpeedBonus;
      }

      const record: AnswerRecord = {
        canonical: picked.canonical,
        correct,
        timeMs,
        xpEarned,
        streakAfter: streak,
      };

      const answers = state.answers.slice();
      answers[state.index] = record;

      return {
        ...state,
        phase: "feedback",
        answers,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        xp: state.xp + xpEarned,
        finishedAt: isLastQuestion(state) ? action.now : state.finishedAt,
      };
    }

    case "next": {
      if (state.phase !== "feedback") return state;
      if (isLastQuestion(state)) {
        return { ...state, phase: "results", questionShownAt: null };
      }
      return {
        ...state,
        phase: "question",
        index: state.index + 1,
        questionShownAt: action.now,
      };
    }

    case "restore": {
      // Restored from sessionStorage after a reload. Re-arm the question timer
      // so the speed bonus isn't unfairly lost/gained.
      const s = action.state;
      return {
        ...s,
        questionShownAt: s.phase === "question" ? Date.now() : s.questionShownAt,
      };
    }

    case "reset":
      return initialState(state.seed);

    default:
      return state;
  }
}
