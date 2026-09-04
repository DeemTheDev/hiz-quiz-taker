/**
 * All user-facing strings live here (South African plain English, grade 6–8).
 * Keeping them in one place makes a later isiZulu/Sesotho version a copy job.
 */


const nf = new Intl.NumberFormat("en-ZA");

export const COPY = {
  brand: {
    chip: "🧬 Prevention Challenge",
    tabTitle: "Prevention Challenge",
    ogTitle: "HIV Prevention Challenge",
  },

  landing: {
    title: "HIV Prevention Challenge",
    titleLead: "HIV Prevention",
    titleHighlight: "Challenge",
    description:
      "How much do you know about HIV prevention? Take this 10-question challenge and find out!",
    badges: { questions: "10 questions", time: "~3 min", anon: "100% anonymous" },
    payoffEmpty: "Your title stamp goes here",
    payoffStickers: "6 stickers to collect",
    payoffReturning: (best: number, stickers: number) =>
      `Your best: ${best}/10 · ${stickers} of 6 stickers`,
    statsPill: (participants: number, avg: number) =>
      `★ ${nf.format(participants)} players · average ${avg.toFixed(1)}/10 — beat it?`,
    statsPillPrefix: "★ ",
    statsPillSuffix: (avg: number) => ` players · average ${avg.toFixed(1)}/10 — beat it?`,
    statsFallback: "Be one of the first players 🌟",
    bubbleReady: "Ready?",
    bubbleNoPressure: "No pressure 😌",
    cta: "Start Quiz",
    privacy: "Anonymous — we only store your score, answers and time. No name, no number, nothing personal.",
  },

  header: {
    /** Fixed toggle labels; state is conveyed by aria-pressed. */
    sound: "Sound",
    motion: "Reduce animations",
    haptics: "Vibration",
  },

  question: {
    eyebrow: (n: number, total: number) => `Question ${n} of ${total}`,
    /** From Q7 the eyebrow is replaced by a countdown to the title. */
    /** `remaining` = questions left AFTER the current one. */
    countdown: (remaining: number) =>
      remaining === 0
        ? "Last one!"
        : remaining === 1
          ? "1 to go — one more after this"
          : remaining === 2
            ? "2 to go — almost there"
            : remaining === 3
              ? "3 to go — your title is loading 🏆"
              : null,
    ghostHint: "Tap to lock in — no take-backs 🔒",
    idleBubble: "👀",
    xpChip: (xp: number) => `${nf.format(xp)} XP`,
    xpChipStreak: (xp: number, streak: number) => `${nf.format(xp)} XP · 🔥${streak}`,
    progressLabel: (n: number, total: number) => `Question ${n} of ${total}`,
  },

  feedback: {
    correctHeader: "Correct! You know your stuff",
    correctHeaderEmoji: "🎉",
    wrongHeader: "Not quite — here's the fact",
    wrongHeaderEmoji: "💡",
    correctChip: "Correct answer",
    yourAnswerChip: "Your answer",
    factEyebrow: "💡 Did you know?",
    rareFactEyebrow: "🔬 Rare fact",
    importantLabel: "Important",
    xpGain: (n: number) => `+${n} XP`,
    xpLearned: "+10 XP · learned it",
    quickBonus: "⚡ Quick +50",
    multiplier: (m: number) => `🔥 ×${m}`,
    proofKnew: (pct: number) => `You're with the ${pct}% who knew this 👀`,
    proofMostMissed: "Most players didn't know this yet — now you do 💡",
    proofNowYouKnow: (pct: number) => `${pct}% of players knew this — now you're one of them`,
    proofFallback: "You're one of the first players — no crowd to compare with yet.",
    more: "⌄ more",
    moreAria: "Scroll for more",
    pointsLabel: "Points earned",
    next: "Next Question",
    nextGlyph: "→",
    reveal: "Reveal my result",
    revealGlyph: "🎁",
    ariaCorrectShort: "Correct.",
    ariaWrongShort: (correctOption: string) => `Not quite. The answer is: ${correctOption}.`,
    ariaCorrect: (explanation: string) => `Correct. ${explanation}`,
    ariaWrong: (correctOption: string, explanation: string) =>
      `Not quite. The answer is: ${correctOption}. ${explanation}`,
    regionLabel: "Answer feedback",
  },

  streak: {
    toast3: "On a roll 🔥×3 — XP ×1.5",
    banner5: "On fire 🔥×5 — XP doubled",
    paused: "Streak paused 💡 Knowledge unlocked.",
    bounceBack: "Bounce back 💫",
  },

  kit: {
    badge: "Kit unlocked: ID badge 🪪",
    stetho: "Kit unlocked: stethoscope 🩺",
    goggles: "Kit unlocked: lab goggles 🥽",
    hat: "Kit unlocked: party hat 🎉 — last question!",
  },

  results: {
    eyebrow: "Your result",
    scoreOf: (score: number, total: number) => `${score}/${total}`,
    ariaScore: (score: number, total: number, tier: string) =>
      `You scored ${score} out of ${total}. ${tier}.`,
    /** Encouraging next-step line; the numbers adapt to the exact score. */
    growth: (score: number): string => {
      if (score <= 3) return "You just learned 10 things most people don't know. Round two?";
      if (score <= 6) return `Solid base. ${7 - score} more right and you're a Pro.`;
      if (score <= 8) return `You know the facts that keep people healthy. ${9 - score} away from Champion.`;
      if (score === 9) return "Champion! One away from a perfect run.";
      return "Flawless. Someone in your DMs needs these facts — share it.";
    },
    averageLabel: "Average",
    ofPlayers: (n: number) => `of ${nf.format(n)} players`,
    correctCount: (score: number, total: number) => `${score} of ${total} correct`,
    gridLabel: "Your answer grid",
    reviewCorrect: "Correct",
    reviewWrong: "Not quite",
    average: (participants: number, avg: number) =>
      `Average of ${nf.format(participants)} players · ${avg.toFixed(1)}/10`,
    percentile: (pct: number) => `You scored higher than ${pct}% of participants`,
    beatAverageTopic: (avg: number, topic: string) =>
      `Average is ${avg.toFixed(1)}/10 — most players miss the ${topic} question. Beat it?`,
    aboveAverage: (avg: number) => `You beat the average of ${avg.toFixed(1)}/10 🙌`,
    statsUnavailable: "Player stats aren't available right now — your score still counts.",
    beatAverage: (avg: number) => `Average is ${avg.toFixed(1)}/10 — think you can beat it?`,
    firstPlayers: "You're one of the first players — the average appears once 5 people finish.",
    statsLoading: "Comparing with other players…",
    retake: "Retake Quiz",
    retakeBest: (best: number) => `Retake Quiz · beat your best ${best}/10`,
    share: "Share result",
    shareShort: "Share",
    whatsapp: "WhatsApp",
    storyCard: "Save story card",
    storyCardShort: "Story card",
    followInstagram: "Follow us on Instagram",
    followTiktok: "Follow us on TikTok",
    xpTile: (xp: number, streak: number, mmss: string) =>
      `${nf.format(xp)} XP · Longest streak 🔥${streak} · ${mmss}`,
    xpNote: "XP and streaks are for fun — your score is the real one.",
    stickerBook: (n: number) => `Sticker book · ${n} of 6`,
    newSticker: (name: string) => `New sticker: ${name} 🎉`,
    review: "Review your answers",
    copied: "Copied! Paste it in WhatsApp or your story",
    shareFailed: "Couldn't open share — try WhatsApp below",
    footer:
      "Anonymous: we saved only your score, answers and time. Your stickers and personal best are saved on your device only.",
    skipChoreo: "Tap to skip",
  },

  stickers: {
    "first-run": { name: "First Run", hint: "Finish once", emoji: "🎟️" },
    pro: { name: "Prevention Pro", hint: "Score 7+", emoji: "💪" },
    champion: { name: "Champion", hint: "Score 9+", emoji: "🏆" },
    perfect: { name: "Perfect Run", hint: "Score 10/10", emoji: "✨" },
    "hot-streak": { name: "Hot Streak", hint: "5 in a row", emoji: "🔥" },
    comeback: { name: "Comeback", hint: "Beat your best", emoji: "💫" },
  },

  disclaimer:
    "This quiz is for education and is not medical advice. For testing, PrEP or PEP, visit your nearest clinic or pharmacy.",
  resourcesLink: "Find services near you",
} as const;

export type StickerKey = keyof typeof COPY.stickers;

export function formatDuration(ms: number | undefined): string {
  if (!ms || !Number.isFinite(ms)) return "–:––";
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
