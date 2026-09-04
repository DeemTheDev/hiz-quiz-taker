/**
 * The 10 HIV prevention questions, verbatim from the content owner.
 *
 * `options[0]` is ALWAYS the correct answer in this canonical form.
 * The quiz UI shuffles the display order per attempt so "A" is not always
 * right, but everything recorded in stats uses these canonical indices
 * (0 = correct), so per-option analytics stay meaningful.
 */

export type OptionIndex = 0 | 1 | 2 | 3;

export interface Question {
  /** 1-based question number */
  id: number;
  /** Short topic label, e.g. "Condoms" */
  topic: string;
  /** Emoji used as the topic badge */
  emoji: string;
  prompt: string;
  /** Canonical order: options[0] is correct. */
  options: readonly [string, string, string, string];
  correctIndex: OptionIndex;
  /** Shown when the user answers correctly (header "Correct!" is rendered separately). */
  correctFeedback: string;
  /** Shown when the user answers incorrectly (header "Not quite!" is rendered separately). */
  incorrectFeedback: string;
  /** Short educational fact, always shown. May contain newlines. */
  fact: string;
  /** Set false to never show "X% of players knew this" for this question. */
  socialProof?: boolean;
  /** Highlight the fact card as a "rare fact". */
  rareFact?: boolean;
}

export const QUESTIONS: readonly Question[] = [
  {
    id: 1,
    topic: "Condoms",
    emoji: "🛡️",
    prompt: "Which of the following can reduce the risk of HIV transmission during sex?",
    options: [
      "Using condoms correctly and consistently",
      "Taking antibiotics after sex",
      "Avoiding HIV testing",
      "Having multiple sexual partners",
    ],
    correctIndex: 0,
    correctFeedback:
      "Using condoms correctly and consistently can significantly reduce the risk of sexual transmission of HIV. Condoms also help protect against many other STIs and unintended pregnancy.",
    incorrectFeedback:
      "Using condoms correctly and consistently is an effective way to reduce the risk of sexual HIV transmission. Antibiotics and avoiding testing do not prevent HIV.",
    fact:
      "Did you know? Condoms are one of several effective HIV-prevention options. They can be combined with other strategies such as HIV testing, PrEP and effective HIV treatment.",
  },
  {
    id: 2,
    topic: "HIV Testing",
    emoji: "🧪",
    prompt: "When should sexually active people consider getting tested for HIV?",
    options: [
      "Regularly, depending on their individual circumstances and risk",
      "Only once in their lifetime",
      "Only when they develop symptoms",
      "Only if their partner has symptoms",
    ],
    correctIndex: 0,
    correctFeedback:
      "Regular HIV testing helps people know their status and make informed decisions about their health and HIV prevention.",
    incorrectFeedback:
      "HIV can be present without obvious symptoms, so waiting until you feel sick is not a reliable way to know your HIV status. Testing frequency should depend on individual circumstances and risk.",
    fact:
      "Remember: You don't have to wait until you feel sick to test for HIV. Knowing your status allows you to access prevention or treatment when needed.",
  },
  {
    id: 3,
    topic: "U=U",
    emoji: "💊",
    prompt:
      "A person living with HIV is taking treatment and has an undetectable viral load. Can they sexually transmit HIV?",
    options: [
      "No, if they maintain an undetectable viral load",
      "Yes, but only if they have no symptoms",
      "Yes, always",
      "Only if their partner does not use condoms",
    ],
    correctIndex: 0,
    correctFeedback:
      "When a person living with HIV maintains an undetectable viral load through effective treatment, they do not sexually transmit HIV. This is known as U=U: Undetectable = Untransmittable.",
    incorrectFeedback:
      "Effective HIV treatment can reduce the amount of virus in the blood to an undetectable level. When the viral load is maintained at an undetectable level, HIV is not sexually transmitted.",
    fact:
      "U=U: A person living with HIV who maintains an undetectable viral load through effective treatment does not sexually transmit HIV. This is an important fact for both HIV prevention and reducing HIV-related stigma.",
    // Don't broadcast how many people hold a stigma-loaded misconception.
    socialProof: false,
    rareFact: true,
  },
  {
    id: 4,
    topic: "PrEP",
    emoji: "🔒",
    prompt: "What is PrEP?",
    options: [
      "Medication taken by HIV-negative people to reduce their risk of acquiring HIV",
      "Medication used to cure HIV after infection",
      "Medication taken after a possible exposure to HIV",
      "A test used to diagnose HIV",
    ],
    correctIndex: 0,
    correctFeedback:
      "PrEP stands for pre-exposure prophylaxis. It is medication used by people who are HIV-negative to reduce their risk of acquiring HIV.",
    incorrectFeedback:
      "PrEP is taken before potential exposure to HIV by HIV-negative people to reduce their risk of acquiring HIV. Medication used after a possible exposure is called PEP.",
    fact:
      "Remember the difference:\nPrEP = Pre-Exposure Prophylaxis → prevention before exposure.\nPEP = Post-Exposure Prophylaxis → emergency prevention after a possible exposure.",
  },
  {
    id: 5,
    topic: "PEP",
    emoji: "⏱️",
    prompt: "When should PEP ideally be started after a possible exposure to HIV?",
    options: [
      "As soon as possible, and no later than 72 hours after exposure",
      "One week after exposure",
      "Only after symptoms develop",
      "After receiving an HIV test several weeks later",
    ],
    correctIndex: 0,
    correctFeedback:
      "PEP is time-sensitive. It should be started as soon as possible after a possible HIV exposure and no later than 72 hours.",
    incorrectFeedback:
      "PEP works best when started as soon as possible after a possible HIV exposure and should not be started later than 72 hours.",
    fact:
      "🚨 PEP is an emergency prevention option. If someone has a possible exposure to HIV, they should seek medical care immediately rather than waiting for symptoms or a later HIV test.",
  },
  {
    id: 6,
    topic: "Getting Tested",
    emoji: "🩸",
    prompt: "What is HIV testing at a healthcare facility generally like?",
    options: [
      "A quick test that can use a small blood sample and may provide results during the same visit",
      "A lengthy procedure requiring several days in hospital",
      "A test that can only be done after symptoms develop",
      "A procedure requiring surgery to collect a blood sample",
    ],
    correctIndex: 0,
    correctFeedback:
      "HIV testing can be quick and straightforward. Rapid HIV tests can use a small blood sample, such as a finger-prick, and results can be available during the same visit.",
    incorrectFeedback:
      "HIV testing does not usually require a lengthy procedure or hospital admission. Rapid testing can be performed using a small blood sample, with results available during the visit.",
    fact:
      "Good news: HIV testing can be quick, simple and confidential. A healthcare worker can perform a rapid test using a small sample, such as a finger-prick blood sample, and rapid tests can provide same-day results.\nYou don't need to be sick to get tested.",
    rareFact: true,
  },
  {
    id: 7,
    topic: "HIV Risk",
    emoji: "⚠️",
    prompt: "Which of the following can increase the risk of acquiring HIV?",
    options: [
      "Sex without a condom with a partner whose HIV status or viral suppression is unknown",
      "Regular HIV testing",
      "Taking PrEP as prescribed when appropriate",
      "Using condoms correctly and consistently",
    ],
    correctIndex: 0,
    correctFeedback:
      "Sex without a condom can increase HIV risk, particularly when a partner's HIV status or viral suppression is unknown.",
    incorrectFeedback:
      "HIV risk is related to exposure to HIV. Testing, PrEP and condoms are prevention strategies rather than factors that increase HIV risk.",
    fact:
      "HIV prevention is not one-size-fits-all. People can use different prevention methods depending on their circumstances, including condoms, HIV testing, PrEP, PEP and effective HIV treatment.",
  },
  {
    id: 8,
    topic: "Communication",
    emoji: "💬",
    prompt: "Why is it useful for sexual partners to discuss their HIV status?",
    options: [
      "It helps partners make informed decisions about HIV prevention",
      "It guarantees that neither partner has HIV",
      "It means condoms are no longer necessary",
      "It prevents all sexually transmitted infections",
    ],
    correctIndex: 0,
    correctFeedback:
      "Open communication can help partners make informed decisions about HIV testing and prevention.",
    incorrectFeedback:
      "Discussing HIV status does not guarantee that someone is HIV-negative. Testing is needed to know someone's HIV status.",
    fact:
      "Communication matters. Talking openly about HIV can help partners make decisions about testing and prevention options such as condoms and PrEP.",
  },
  {
    id: 9,
    topic: "Self-Testing",
    emoji: "🏠",
    prompt: "Which statement about HIV self-testing is TRUE?",
    options: [
      "A person can collect their own sample and perform a screening test themselves",
      "A healthcare worker must perform every HIV self-test",
      "A reactive self-test automatically confirms HIV infection",
      "HIV self-testing can only be done in a hospital",
    ],
    correctIndex: 0,
    correctFeedback:
      "HIV self-testing allows a person to collect their own sample and perform a screening test themselves, often in private. Self-testing is an additional option that can make HIV testing more convenient.",
    incorrectFeedback:
      "HIV self-testing allows people to collect their own sample and perform a screening test themselves. However, a reactive result must be followed by testing with a trained healthcare provider.",
    fact:
      "Did you know? HIV self-testing kits are available through approved channels in South Africa, including pharmacies. However, self-tests are screening tests, not final diagnoses. A reactive result must always be followed by confirmatory testing through the national HIV testing algorithm.\nImportant: Following the instructions correctly matters. Quality-assured HIV self-tests have high accuracy, but incorrect use or testing at the wrong time after exposure can affect the result.",
    rareFact: true,
  },
  {
    id: 10,
    topic: "Combination Prevention",
    emoji: "🧩",
    prompt: "Which of the following is an example of a good HIV-prevention approach?",
    options: [
      "Regular testing, condoms, PrEP when appropriate, and effective HIV treatment",
      "Avoiding HIV testing unless symptoms develop",
      "Relying on someone's appearance to determine whether they have HIV",
      "Taking antibiotics to prevent HIV",
    ],
    correctIndex: 0,
    correctFeedback:
      "HIV prevention involves a combination of effective strategies. Different people may use different prevention methods depending on their circumstances.",
    incorrectFeedback:
      "HIV prevention involves several effective strategies, including testing, condoms, PrEP, PEP and effective HIV treatment. Appearance and antibiotics cannot reliably prevent HIV.",
    fact:
      "There isn't just one way to prevent HIV. Combining appropriate prevention strategies gives people more options to protect themselves and their partners.",
  },
] as const;

export const QUESTION_COUNT = QUESTIONS.length;

/** Result tiers, from the content owner. */
export interface Tier {
  key: "beginner" | "getting-there" | "pro" | "champion";
  label: string;
  emoji: string;
  min: number;
  max: number;
}

export const TIERS: readonly Tier[] = [
  { key: "beginner", label: "HIV Prevention Beginner", emoji: "🌱", min: 0, max: 3 },
  { key: "getting-there", label: "Getting There", emoji: "📚", min: 4, max: 6 },
  { key: "pro", label: "Prevention Pro", emoji: "💪", min: 7, max: 8 },
  { key: "champion", label: "Prevention Champion", emoji: "🏆", min: 9, max: 10 },
];

export function tierForScore(score: number): Tier {
  const s = Math.max(0, Math.min(QUESTION_COUNT, Math.round(score)));
  return TIERS.find((t) => s >= t.min && s <= t.max) ?? TIERS[0];
}
