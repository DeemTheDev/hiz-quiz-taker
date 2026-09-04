# HIV Prevention Challenge — Final Design Spec (v1.0, 2026-09-03)

Base: Proposal 1 "Dopamine Arcade: Pip's Sticker Lab". Every weakness the three judges listed is fixed below, and the flagged ideas from "Clinical Cute" (guardrails, kit unlocks, lightbulb beat, wick reveal, stamp, a11y timing, full-width follow buttons, landing payoff preview) and "LOCK IT IN" (social-proof line, OG image + story card, review accordion, "paused"/"Bounce back" streak copy, ghost hint, copy.ts, completion stat, implementation guards) are grafted in. Stack: Next.js 16 App Router, TypeScript, Tailwind v4, `motion` 13 (`LazyMotion` + `m`, `domAnimation` only), `canvas-confetti`, `lucide-react` 1.x, Vercel. Everything visual is CSS, inline SVG, emoji or Web Audio.

**Decision log (what changed from Proposal 1 and why)**

| Change | Reason (judge) |
|---|---|
| Header reduced to progress bar + "Question 4 of 10" + one combined XP/streak chip | header overflow at 360px |
| Feedback readable by ~620 ms (collapse and sheet rise run in parallel from t=400) | 1.2 s was slowest of the three |
| Visible 8 s "quick" drain pill removed; speed bonus is silent (window 15 s) and revealed only in the sheet | time pressure on health copy rewards guessing |
| Run levels removed; XP stays as one number; kit unlocks (progress-based, Q3/6/8/10) replace level interstitials | seven parallel systems; low scorers never reached Lv3 |
| Collectible tier cards replaced by a Sticker Book of achievements that never require a low score | perverse incentive to score 0–6 |
| Screen shake removed; Pip goes tap → lightbulb → encouraging (no startled face) | heaviest failure signal of the three |
| Marquee removed; landing motion capped and stoppable | WCAG 2.2.2, discretion, readability |
| Social-proof line per question from `questionCorrectPct`, kindly phrased, gated n ≥ 50, off for U=U | most proven completion hook; never "got this wrong" |
| Full correct option text (wrapping) in the evidence chip and the sheet | 95-char options were ellipsised |
| Follow buttons: two full-width 56 px anchors with exact brief copy | half-width chips truncated required labels |
| OG image per score + 1080×1920 story card PNG | text-only share for an IG/TikTok audience |
| "Review your answers" accordion below the fold on results | calm second read; educational credibility |
| Percentile / average tiles reserve space and fill whenever the response lands | slow SA networks |
| Master gain 0.55 → 0.40, Start cue quietest | opened in taxis and classrooms |
| Interstitial queue: max one celebration per question, none blocks Next | stacked banners |
| Privacy footer adds "saved on your device only" for localStorage items | anonymity claim must survive scrutiny |
| Wick (clip-path) reveal, rubber-stamp result, fieldset/inert/aria-live-at-reveal | grafts from Proposal 2 |

---

## 1. Concept, tone and mascot

**Concept.** The site is a pastel arcade cabinet with a slight medical wink. Every element is a die-cut sticker: a 2 px Ink Indigo outline, a 4–6 px solid coloured bottom edge that collapses when pressed, 18–28 px corners, laid on a lilac ground with three slow radial "petri-dish" gradients. The player taps an answer, the answer "wicks" left-to-right into mint or blush like liquid on a lab strip, the other options collapse into evidence chips, and a bottom sheet rises with the verdict, the fact and a social-proof line — all inside 650 ms. Progress is a ten-segment bar that is already one-tenth lit when the first question appears. A lavender immune-cell mascot, **Pip**, wears a mint medic headband and reacts to every tap, and earns four pieces of kit on a fixed schedule so that every player — including someone who scores 2/10 — is rewarded inside the Q7–Q8 drop-off zone. The **0–10 score is the only number that decides the title**; XP and streaks exist to make each tap feel rewarding and are visibly subordinate (smaller type, secondary colour) to the score everywhere. The ending is a count-up, a rubber-stamped title, confetti scaled to the tier, a Wordle-style grid, a flattering-only percentile, a sticker book that drives retakes, and share paths built for WhatsApp and Stories.

**Tone.** Playful about the *game* and the player's knowledge; precise and dignified about HIV and people. UNAIDS 2024 terminology only: "people living with HIV", "acquiring HIV", "sex without a condom" / "condomless sex", "safer sex", "HIV test", "STI", never "infected", "clean", "risk group", "victim", "fight/battle". Wrong answers say "Not quite" and lead with the true statement. No 💀 🤡 😬 anywhere; no US slang on facts ("no cap", "the tea"). Three hard guardrails: (1) **never mimic rapid-test result semantics** — no "two lines = correct", no positive/negative visual language for answers; (2) **no medication imagery as a game counter** — no pill organiser, blister pack or capsule progress; (3) **no war metaphors** for Pip or the immune system ("defend", "attack", "fight") — Pip "helps", "checks", "knows". Gambling vocabulary (slot machine, jackpot, roulette) never appears in UI copy or sponsor material. Reading level grade 6–8, South African plain English; all strings live in `src/lib/copy.ts` so isiZulu/Sesotho can follow.

### Mascot: Pip

**Who.** Pip is a friendly immune cell (a helper cell, never named as a virus or germ) who "already tested" — a tiny finger-prick plaster on one arm makes testing normal without a word. Neutral and discreet: nothing about Pip signals "HIV app" to someone glancing at the phone.

**Silhouette fix (germ risk).** No protruding bumps. Pip is a smooth, slightly-wider-than-tall rounded blob with *interior* lighter highlights, a mint medic headband with a white "+" (not a red cross — protected emblem), a small white lab-coat collar at the base, two stubby arms, and bead eyes. Test the 44 px and 64 px renders with 5–10 people from the audience before launch; if anyone says "germ", enlarge the headband and collar.

**Construction** (`src/components/Pip.tsx`, one inline `<svg viewBox="0 0 120 120">`, ≤ 4 KB, `aria-hidden="true"`; parts are `<g>`s toggled by `data-mood` on the wrapper with 150 ms opacity crossfades — no path morphing):

- `#body`: `path` blob ≈ ellipse rx 46 ry 42 centred (60,66), fill `var(--color-lavender)`, stroke `var(--color-ink)` 3 px. Interior highlights (clipped to body): two ellipses fill `#E4DDFB` at (40,50) rx 10 ry 7 and (78,58) rx 7 ry 5.
- `#collar`: two rounded triangles fill `var(--color-gauze)` stroke ink 2.5 px meeting at (60,102), width 44, height 12 (lab-coat lapels).
- `#headband`: rounded rect 72×14 at (24,28) rx 7, fill `var(--color-mint)`, stroke ink 3 px; white plus = two rects 3×10 and 10×3 centred (60,35).
- `#eyes` variants: `eye-dot` two ellipses rx 5 ry 6 at (46,62) and (74,62) fill ink + highlight circle r 1.8 white at (−1.5,−2); `eye-happy` two arcs stroke ink 4 px round caps `M39 63 q7 -8 14 0` and mirrored; `eye-star` two 5-point stars r 8 fill `var(--color-lemon)` stroke ink 2 px; `eye-wink` = one `eye-dot` (left) + one `eye-happy` arc (right).
- `#brows`: two arcs stroke 3 px at y 50, hidden by default; `thinking` shows the right one raised 3 px.
- `#mouth` variants: `mouth-smile` arc stroke 4 px `M50 80 q10 8 20 0`; `mouth-grin` filled D `M48 78 q12 16 24 0 z` fill ink with a `var(--color-blush)` tongue ellipse; `mouth-o` circle r 3.5 stroke 3 px (curious, not sad); `mouth-flat` line 10 px stroke 3 px.
- `#blush`: two circles r 6 fill `var(--color-blush)` opacity .8 at (36,74) and (84,74).
- `#arms`: two rounded lines stroke ink 6 px from shoulders (18,74) and (102,74), length 18, `transform-origin` at each shoulder. `#plaster`: a 10×5 rounded rect fill `var(--color-blush)` stroke ink 1.5 px on the left arm ("already tested").
- `#bulb` (curious beat): lightbulb 16 px at (96,30) — circle r 6 fill `var(--color-lemon)` stroke ink 2 px, base rect 6×4, 4 radiating 3 px lines; hidden by default.
- `#kit` layers (hidden until unlocked): `#badge` (lanyard line + 10×14 sky card on the collar, Q3), `#stetho` (ink tube around the collar with a violet-edge bell r 4, Q6), `#goggles` (two lavender-outlined circles r 8 pushed up onto the headband, Q8), `#hat` (party hat triangle fill `var(--color-blush)` stroke ink, lemon pom-pom r 5, three lemon dots, Q10 — a plain cone, never a capsule).
- `#sparkles`: three 4-point stars r 5 fill `var(--color-lemon)` at (18,40), (104,48), (92,100), hidden by default.

**Moods**

| mood | face | body motion (disabled under reduced motion) |
|---|---|---|
| `idle` | eye-dot, mouth-smile | float y ±4 px 2.4 s ease-in-out; blink every 3.5 s (eyes scaleY 1→.1→1, 120 ms) |
| `thinking` | eye-dot shifted (+3,−3), right brow raised, mouth-flat | rotate 4°; after 3 s three faint dots pulse above the right shoulder (stagger 200 ms) |
| `correct` | eye-happy, mouth-grin, arms rotate ∓70° (up) | squash-stretch scaleY .88→1.08→1 320 ms `ease-back`, hop y −10 px; sparkles pop 0→1 stagger 60 ms, fade at 700 ms |
| `curious` (wrong) | eye-dot slightly wider (ry 7), mouth-o, `#bulb` pops (scale 0→1 spring) | head tilt +6° 160 ms; **auto-advances to `encouraging` at +500 ms** — never a frown, brows, tears or sweat |
| `encouraging` | eye-wink, mouth-smile, right arm rotate −90° (thumbs-up) | none |
| `celebrating` | eye-star, mouth-grin, `#hat` if unlocked, arms wave ±20° 240 ms loop for 1.2 s then hold | bounce y −14 px 480 ms `ease-back` ×3 then float |
| `peek` | `thinking` face, clipped to top 60 % | used on the question card corner, 56 px |

Sizes: landing 120 px (140 at ≥ 650 px viewport height), question card 56 px peek, sheet 64 px overlapping the sheet's top edge, results 72 px on the ring, story card 320 px.

---

## 2. Design tokens

All ratios computed with the WCAG 2.x relative-luminance formula against the hexes below (Tailwind v4 accepts hex in `@theme`; do not convert to OKLCH or re-verify if you do). AA text 4.5:1, large text 3:1, non-text UI 3:1.

### 2.1 Palette

| Token | Hex | Role | Text allowed on it (ratio) |
|---|---|---|---|
| `--color-lilac` | `#F6F1FF` | page background | Ink 15.1 · Plum 9.6 (secondary only) |
| `--color-gauze` | `#FFFDF8` | cards, option faces, sheet, tiles | Ink 16.5 · Plum 10.5 |
| `--color-lavender` | `#CFC2FF` | primary CTA face, letter badges, selected state, XP chip | Ink 10.2 (Plum 6.5 allowed ≥ 15 px) |
| `--color-mint` | `#BFF2D3` | correct option face, correct chip, correct sheet strip | Ink 13.4 · Ink-Mint 7.3 |
| `--color-blush` | `#FFD1D6` | chosen-wrong option face, "Your answer" chip, "Not quite" strip, Pip blush | Ink 12.2 · Ink-Blush 7.0 |
| `--color-lemon` | `#FFE7A3` | XP chips, streak toast/banner, title stamp, kit toast, Q8–10 "final stretch" segments | Ink 13.7 · Ink-Lemon 7.4 |
| `--color-sky` | `#BDE4FF` | "Did you know?" fact card, average tile, info chips | Ink 12.5 · Ink-Sky 7.1 |
| `--color-peach` | `#FFC9B0` | streak flame chip | Ink 11.3 · Ink-Peach 6.4 |
| `--color-gold` | `#F7D774` | Champion / Perfect Run sticker base | Ink 11.9 |
| `--color-track` | `#E6DFFB` | progress track, sheet grabber, Wordle empty cell | non-text only |
| `--color-ink` | `#1F1740` | all primary text, sticker outlines, icons | — |
| `--color-plum` | `#3F3A5C` | secondary text (≥ 13 px) on Lilac/Gauze/Lavender only | — |
| `--color-ink-mint` | `#14532D` | text on Mint | — |
| `--color-ink-blush` | `#881337` | text on Blush | — |
| `--color-ink-lemon` | `#78350F` | text on Lemon/Gold | — |
| `--color-ink-sky` | `#0C4A6E` | text on Sky | — |
| `--color-ink-peach` | `#7C2D12` | text on Peach | — |
| `--color-violet-edge` | `#7C5CE6` | CTA/option bottom edge and borders, progress fill, poll bar (at 18 % alpha), secondary button text | white on it 4.6 (avoid; use Ink faces) |
| `--color-mint-edge` | `#2F9E62` | edge/border of correct option and chip | — |
| `--color-blush-edge` | `#D9536B` | edge/border of chosen-wrong option and chip | — |
| `--color-violet-700` | `#5B37C9` | the only dark fill allowed under white text (toast, share toast) | white 7.4 |
| `--color-focus` | `#4C1D95` | focus ring | 9.9 on Lilac, 10.8 on Gauze |

Non-text checks (≥ 3:1): Violet Edge on Gauze 4.56, on Lilac 4.18, vs Track 3.60 (progress fill vs track passes); Mint Edge on Gauze 3.34; Blush Edge on Gauze 3.83. Facts to design around: Mint vs Blush faces are 1.10:1 and Lavender vs Gauze 1.61:1, so **state is never carried by the face colour alone** — every option/chip carries a 2 px outline in Ink or its edge colour, a 24 px icon and a word. Never white text on any pastel (1.02–1.64). Never gray-500-style text. `@media (prefers-contrast: more)`: Plum → Ink, all pastel borders → Ink, border width 2 → 3 px.

### 2.2 Tailwind v4 `@theme`

```css
@import "tailwindcss";
@theme {
  --color-lilac:#F6F1FF; --color-gauze:#FFFDF8; --color-lavender:#CFC2FF; --color-mint:#BFF2D3;
  --color-blush:#FFD1D6; --color-lemon:#FFE7A3; --color-sky:#BDE4FF; --color-peach:#FFC9B0;
  --color-gold:#F7D774; --color-track:#E6DFFB; --color-ink:#1F1740; --color-plum:#3F3A5C;
  --color-ink-mint:#14532D; --color-ink-blush:#881337; --color-ink-lemon:#78350F;
  --color-ink-sky:#0C4A6E; --color-ink-peach:#7C2D12; --color-violet-edge:#7C5CE6;
  --color-mint-edge:#2F9E62; --color-blush-edge:#D9536B; --color-violet-700:#5B37C9; --color-focus:#4C1D95;

  --radius-chip:0.875rem;   /* 14px chips, badges */
  --radius-sticker:1.125rem;/* 18px options, buttons */
  --radius-card:1.5rem;     /* 24px question card, tiles */
  --radius-sheet:1.75rem;   /* 28px sheet top corners */

  --shadow-edge:0 4px 0 var(--color-violet-edge);      /* default sticker edge */
  --shadow-edge-lg:0 6px 0 var(--color-violet-edge);   /* question card */
  --shadow-edge-mint:0 4px 0 var(--color-mint-edge);
  --shadow-edge-blush:0 4px 0 var(--color-blush-edge);
  --shadow-sheet:0 -8px 24px rgb(31 23 64 / 0.12);
  --shadow-toast:0 8px 20px rgb(31 23 64 / 0.18);

  --spacing:4px; /* scale: 4 8 12 16 20 24 32 40 48 56 64 */

  --text-caption:0.8125rem; /* 13 */
  --text-body:0.9375rem;    /* 15 */
  --text-body-lg:1rem;      /* 16 */
  --text-option:clamp(0.9375rem, 4vw, 1rem); /* 15–16, never below 15 */
  --text-prompt:clamp(1.125rem, 5vw, 1.3125rem); /* 18–21 */
  --text-verdict:1.375rem;  /* 22 */
  --text-badge:1.625rem;    /* 26 */
  --text-title:clamp(1.875rem, 8.5vw, 2.125rem); /* 30–34 */
  --text-score:clamp(4rem, 18vw, 4.5rem); /* 64–72 */

  --ease-emph:cubic-bezier(0.2,0,0,1);
  --ease-in-quick:cubic-bezier(0.4,0,1,1);
  --ease-back:cubic-bezier(0.34,1.56,0.64,1);
  --ease-expo-out:cubic-bezier(0.16,1,0.3,1);

  --animate-float: float 2.4s ease-in-out infinite;
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  --animate-shimmer: shimmer 2.8s linear 3; /* capped at 3 sweeps */
  @keyframes shimmer { 0%{transform:translateX(-120%) skewX(-12deg)} 100%{transform:translateX(220%) skewX(-12deg)} }
}
@theme inline { --font-sans: var(--font-nunito); --font-display: var(--font-fredoka); }
```

Sticker press recipe (every button):
```css
.sticker{background:var(--color-gauze);border:2px solid var(--color-violet-edge);border-radius:var(--radius-sticker);
  box-shadow:var(--shadow-edge);transition:transform 120ms var(--ease-back);touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;user-select:none}
.sticker:active{transform:translateY(4px);box-shadow:0 0 0 var(--color-violet-edge);transition-duration:0ms}
```
Animate `transform` only; the shadow is swapped, never tweened.

### 2.3 Type

Fonts via `next/font/google`, latin subset, `display:"swap"`, loaded once in `app/fonts.ts`:
- **Fredoka** (variable 300–700) → `--font-fredoka`. Used at 600 (question prompt, verdict) and 700 (title, score, stamp, CTA labels, letter badges).
- **Nunito** (variable 200–1000) → `--font-nunito`. Used at 600 (body, explanation, fact), 700 (option text), 800 (eyebrows, chip labels, uppercase tracking 0.06em).

Mobile scale (px @ 390): title 34/1.1 F700 · prompt 20/1.25 F600 (18 at 360) · verdict 22/1.2 F700 · score 72/1 F700 tabular · stamp 26/1.1 F700 · option 16/1.3 N700 (15 at 360, **never lower**) · explanation 16/1.45 N600 · fact 16/1.45 N600 · body 15/1.45 N600 · eyebrow/chip 13/1.2 N800 · caption 13/1.4 N600 Plum. All sizes in rem; minimum rendered 13 px. Counters use `font-variant-numeric: tabular-nums` plus per-digit `inline-block; min-width:.62em` cells. Facts contain `\n`: render with `whitespace-pre-line`; strip a leading "Did you know? " because the card eyebrow already says it. On the sheet, the explanation and fact are the largest text (16 px); XP chips are 13 px — the type hierarchy enforces "facts first".

---

## 3. Screen specs (390 px wide; budgets checked at 360×612 usable)

**Viewport targets.** iPhone 390×844 inside Instagram/TikTok WKWebView ≈ **390×700** usable. Android 360×740 inside Instagram WebView (status 24 + IG header 56 + IG footer 48) ≈ **360×612** — this is the no-scroll requirement. Legacy 360×640 ≈ 512 → compact mode (`@media (max-height:560px)`).

**Global shell.** `<html lang="en-ZA">`; `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`; `<meta name="format-detection" content="telephone=no">`; `<title>Prevention Challenge</title>`, favicon 🧬 (discreet). `<main class="grid grid-rows-[auto_1fr_auto] max-w-[430px] mx-auto px-4 sm:px-5" style="min-height:100vh;min-height:100svh">` with `padding-bottom:max(16px, env(safe-area-inset-bottom))`. No `position:fixed` bars on quiz screens — the third grid row is the bottom bar. Body: Lilac + three radial gradients (Mint, Sky, Lemon at 35 % alpha, 320–420 px) drifting via `background-position` over 20 s (`transform`-free, no `filter:blur`), paused under reduced motion. `overscroll-behavior-y:contain` on body. Header row (all screens): left brand chip "🧬 Prevention Challenge" (13 px N800), right two 44×44 icon buttons in 48 px hit areas: sound (`Volume2`/`VolumeX`, `aria-label="Sound on/off"`) and motion (`Sparkles` with slash overlay, `aria-label="Reduce animations"`, `aria-pressed`). Haptics toggle appears in a small popover from the sound button on Android only (`'vibrate' in navigator`).

### 3.1 Landing

Stack (top → bottom), heights at 360×612 / 390×700:

1. Header 48.
2. Hero 140 / 200: dashed "petri ring" (`stroke-dasharray 6 8`, Violet Edge 40 %, rotates 40 s), Pip `idle` 120/140 px inside, four emoji stickers 🛡️ 🧪 💊 🩹 (28 px, `aria-hidden`) on a 26 s orbit that **stops on first pointerdown** anywhere; speech bubble "Ready?" swaps to "No pressure 😌" after 4 s.
3. Title 66 / 76: "HIV Prevention Challenge", 2 lines, F700 30/34; "Challenge" sits on a skewed Lemon highlighter rect (−2°, 55 % height) drawn in 320 ms.
4. Description 67: "How much do you know about HIV prevention? Take this 10-question challenge and find out!" N600 16/1.4 Ink, max 30ch → 3 lines.
5. Badge chips 32: `[10 questions] [~3 min] [100% anonymous]` — 13 px N800 Ink on Sky / Mint / Lavender, 2 px Ink outline, `ListChecks` / `Timer` / `ShieldCheck` 16 px.
6. Payoff preview 44: Gauze strip "Your title stamp goes here" — an empty dashed Lemon stamp outline (rotated −6°) plus "6 stickers to collect" with six greyed sticker silhouettes; if `localStorage hq:best` exists, reads "Your best: 8/10 · 3 of 6 stickers".
7. Live stats pill 32 (only when `stats.available`): "★ 12,483 players · average 6.4/10 — beat it?" Lemon, Ink-Lemon; number counts up 800 ms. Otherwise "Be one of the first players 🌟". Never fabricated.
8. Gaps 5×12 = 60.
9. Bottom row: **Start Quiz** 60 px (Lavender face, Violet Edge 2 px border + 4 px edge, F700 19 Ink, `ArrowRight` 20 px), shimmer sweep max 3 times; privacy line 13 px Plum 2 lines: "Anonymous — we only store your score. No name, no number, nothing." + safe 16.

Total 48+140+66+67+32+44+32+60+60+34+16 = **599 ≤ 612** ✓; 390×700: 48+200+76+67+32+44+32+60+60+34+16 = 669 ✓. Nothing plays on the landing (autoplay policy and discretion).

### 3.2 Question

```
┌ header 56 ────────────────────────────────────────────────┐
│ ▮▮▮▮▯▯▯▯▯▯  10 segments, 10px tall, 4px gaps, rx 5        │
│ QUESTION 4 OF 10                    [ 620 XP · 🔥3 ]      │  eyebrow 13 N800 Plum · one Lavender chip, 28px
├ question card ≤124 ───────────────────────────────────────┤
│ PrEP                                        (Pip peek 56) │  topic tag 13 N800 Violet Edge · Gauze card, 2px Ink, 6px edge, r24, pad 14
│ What is PrEP?                                             │  prompt F600 18–21/1.25, ≤3 lines
├ options (1fr, flex column, justify-content:center, gap 10)┤
│ (A) Medication taken by HIV-negative people to reduce…    │  min-h 56, auto-grow, r18, Gauze, 2px+4px Violet Edge
│ (B) …                                                     │  letter badge 32px Lavender circle F700 14 Ink
│ (C) …                                                     │  text N700 15–16/1.3, left, padding 12/14
│ (D) …                                                     │
├ bottom 28 ────────────────────────────────────────────────┤
│ Tap to lock in — no take-backs 🔒   (Q1–Q2 only, 13 Plum) │
└───────────────────────────────────────────────────────────┘
```

Budget at 360×612 (text column 328 px; option text ≈ 258 px wide ≈ 34 chars/line at 15 px; worst verbatim option 92 chars = 3 lines = 79 px): 56 + 124 + 12 + (4×79 + 30) + 28 + 16 = **582 ≤ 612** ✓. Typical question (2-line options): 494, slack becomes `justify-content:center` air. At 390×700 with 16 px text: ≤ 600 ✓. Compact mode (≤ 560): header 48, card pad 10, prompt 17, option pad 8/12, gap 8, hint hidden → ≈ 500 ✓; text stays 15 px; `overflow-y:auto` on the options region is the last resort (header and card never scroll away). There is no Next button in this phase.

Progress bar semantics: segment `n` lit = question `n` reached; segment 1 lights on Start; advances on wrong answers; segments 8–10 turn Lemon from Q8 ("final stretch") with a 1.2 s opacity pulse on the current segment. From Q7 the eyebrow **is replaced** (not joined) by "3 to go — your title is loading 🏆" → "2 to go" → "Last one!".

Kit toast (Q3, Q6, Q8, Q10 mount): 1.2 s Lemon sticker toast top-right, "Kit unlocked: stethoscope 🩺", non-blocking, accessory drops onto Pip with a spring.

### 3.3 Feedback state ("collapse + rise", nothing pushed off-screen)

```
┌ header 56 (unchanged; XP chip ticks, flame pops) ─────────┐
├ collapsed card 60 ────────────────────────────────────────┤
│ What is PrEP?                     15 N600 Plum, ≤2 lines  │
├ evidence chips ───────────────────────────────────────────┤
│ ✓ CORRECT ANSWER                                          │  Mint, 2px Mint Edge, CircleCheck 24 Ink-Mint
│   Medication taken by HIV-negative people to reduce their │  15 N700 Ink, wraps ≤2 lines (≈75px)
│   risk of acquiring HIV                                   │
│ ✗ YOUR ANSWER  Medication used to cure HIV after…         │  Blush, CircleX 24 Ink-Blush, 1 line (only when wrong, ≈56px)
├ SHEET (fills remaining; min 46svh) r28 top, 2px Ink top border, Gauze ┤
│  (Pip 64, overlapping the edge, correct/encouraging)      │
│ ┃ Correct! You know your stuff 💪 ┃  Mint strip 44, CircleCheck 24 + F700 22 Ink-Mint
│   — or —  ┃ Not quite — here's the fact 💡 ┃ Blush strip, Lightbulb 24, Ink-Blush
│ PrEP stands for pre-exposure prophylaxis. It is…          │  explanation 16/1.45 Ink
│ ┌ 💡 DID YOU KNOW? ────────────────────────────────┐      │  Sky card r18, eyebrow 13 N800 Ink-Sky, text 16/1.45 Ink-Sky
│ │ Remember the difference: PrEP = … PEP = …        │      │  "🔬 RARE FACT" variant (Q3, Q6, Q9): Lavender card, 2px Violet Edge, subtle 3s conic border
│ │ ┃ Important: … ┃  (paragraphs starting "Important:" render as a Lemon inset block) │
│ └──────────────────────────────────────────────────┘      │
│ You're with the 32% who knew this 👀          13 N600 Plum │  social-proof line (rules §4.6)
│ [+150 XP] [⚡ Quick +50] [🔥 ×1.5]             13 N800 Lemon chips, 28px, stagger 60ms — LAST, below the fact
│ ⌄ more (only if the body overflows; hides once scrolled)  │
│ ████████ Next Question → ████████                          │  56 Lavender, pinned to sheet bottom + safe area
└───────────────────────────────────────────────────────────┘
```

Budget at 360×612: header 56 + card 60 + chips 75 (+56 when wrong) + gaps 16 → sheet gets 405 (349 when wrong). Typical sheet content (2-line explanation, 3-line fact, proof line, XP row, Next): 44+43+109+20+28+56+16+gaps 40 = 356 ✓. Long verbatim content (Q6, Q9: ~67–90-word fact + 31-word explanation) overflows by ~40–80 px → the sheet body (`overflow-y:auto; overscroll-behavior:contain`) scrolls internally with a **visible "⌄ more" chevron pill** at the fade edge that disappears on first scroll; the header strip and Next never move. Content owner to be asked for trims (≤ 35-word explanations, ≤ 40-word facts); the layout tolerates the current text either way. Chips are not buttons (answers are locked at tap).

### 3.4 Results (the only scrolling screen; bottom bar `position:sticky; bottom:0`)

First fold at 360×612:

1. Header 48 ("YOUR RESULT" eyebrow replaces the brand chip; toggles stay).
2. Score ring 180 (200 at ≥ 650): SVG r 80 stroke 14, track `--color-track`, fill Violet Edge, `pathLength` 0→score/10; centre "8" F700 64–72 tabular + "/10" 24 Plum; Pip `celebrating` 72 px sitting on the rim (top-right).
3. Title stamp 84: Lemon sticker (Gold for 9–10) 26 px F700 Ink, rotated −6°, 3 px Ink border — "Prevention Pro 💪" — plus growth line 15 N600 Ink, 2 lines.
4. Stats row 84: two tiles side by side, **slots reserved from t=0** (Gauze skeleton pulse), filled whenever the submit response lands — even after the choreography. Left Sky tile "Average of 12,483 players · 6.4/10". Right: Mint "You scored higher than 68% of participants" when `percentile ≥ 50`; Lavender "Average is 6.4/10 — think you can beat it?" when < 50; when `stats.available === false` one full-width Lavender tile "You're one of the first players — the average appears once 5 people finish." (`MIN_PARTICIPANTS_FOR_STATS = 5`). Never a red tile, never a rank.
5. Follow buttons: two **full-width** 56 px Gauze sticker anchors with inline SVG glyphs (lucide 1.x has no brand icons): "Follow us on Instagram", "Follow us on TikTok". Plain `<a href>`, same tab, `rel="noopener"`.
6. Sticky bottom bar 72 (56 + safe 16): **Retake Quiz** (Lavender primary, `RotateCcw`) 60 % width + **Share result** (Gauze, Violet Edge 2 px border, Violet Edge text, `Share2`) 40 %, gap 12.

Fold check: 48+180+12+84+12+84+12+56 (first follow button) = 488 + bar 72 = 560 ≤ 612 ✓ — both follow buttons fit at 612 (628 with the second minus overlap → the second peeks); both fully fit at 700.

Below the fold: **Wordle grid** tile (2×5 cells 24 px, 🟩 Mint+check / ⬜ Track) with `[Share result] [WhatsApp] [Save story card]` row · **Sticker Book** tile "3 of 6 stickers" with six 56 px sticker slots (earned = full colour with spring pop, locked = dashed Track outline + short hint) · XP/streak tile "1,450 XP · Longest streak 🔥5 · 2:41" with the 13 px line "XP and streaks are for fun — your score is the real one." · **Review your answers** accordion (10 rows: ✓/○ icon 20 px, topic, one-line fact; expands to the full explanation; the calm second read) · footer "Anonymous: we saved only your score, answers and time. Your stickers and personal best are saved on your device only."

---

## 4. Gamification system

**4.1 Score (primary, immutable).** Correct answers / 10. The only input to the title and to the share text. Largest number on every screen. Tiers: 0–3 "HIV Prevention Beginner 🌱", 4–6 "Getting There 📚", 7–8 "Prevention Pro 💪", 9–10 "Prevention Champion 🏆".

**4.2 XP (secondary, never affects score).** Constants in `GAME` (`src/lib/quiz-state.ts`):
- `xpCorrect = 100`; `xpWrong = 10` ("learned it" — the counter always ticks up).
- `xpQuick = 50` when `answeredAt − questionShownAt ≤ speedWindowMs`; **`speedWindowMs = 15000`** (change from 8000). **No visible timer, no drain UI, no countdown sound.** The bonus is revealed only after answering as a "⚡ Quick +50" chip in the sheet — a surprise, not a pressure.
- Streak multiplier on the correct-XP part only: `×1.5` at streak ≥ 3, `×2` at streak ≥ 5.
- Perfect fast run = 2,200 XP; typical 6/10 ≈ 750–850. Header chip counts up over 400 ms with ≤ 10 tick sounds, delayed until the sheet has settled (t ≥ 750 ms).
- Run levels: **removed**. XP is one number in one chip; totals appear on results.

**4.3 Streak (visible, loud, harmless).** Consecutive correct answers. Chip shows "🔥2" from 2. Increment: numeral scale 1→1.3→1 200 ms. Streak 3: chip grows to 1.15× and a Lemon toast "On a roll 🔥×3 — XP ×1.5" slides under the header for 900 ms + one confetti burst (40, spread 70, origin y .7) + `streak` sound. Streak 5: full-width Lemon banner "On fire 🔥×5 — XP doubled" 900 ms (pointer-events none, never covers Next) + two side cannons (angle 60/120, spread 55, 60 each) + haptic `[15,30,15,30,40]`. Break: flame puffs to 💨 (scale 1→1.4, opacity→0, 300 ms), caption **"Streak paused 💡 Knowledge unlocked."** (never "lost"/"reset"); the next correct answer shows **"Bounce back 💫"** in the chip for 900 ms before the count resumes at 1. Streak never changes the score.

**4.4 Kit unlocks (progress-based, every player earns all four).** Q3 ID badge 🪪, Q6 stethoscope 🩺, Q8 lab goggles 🥽 (deliberately in the drop-off zone), Q10 party hat 🎉 (on Q10 mount — anticipation). 1.2 s non-blocking toast + accessory spring-drop onto Pip. Kit persists for the session and appears on the results Pip and story card.

**4.5 Sticker Book (retake driver, no perverse incentive).** Six achievements, stored in `localStorage hq:stickers` (try/catch): First Run (finish once) · Prevention Pro (≥ 7) · Champion (≥ 9) · Perfect Run (10/10, gold foil) · Hot Streak (streak ≥ 5) · Comeback (beat your personal best `hq:best` on a retake). None requires scoring low. Results shows "3 of 6 stickers"; Retake copy "Beat your best 8/10". Results toast when a new sticker is earned (queued after the choreography).

**4.6 Per-question social proof.** Source: `PublicStats.questionCorrectPct[i]` and per-question answer count (extend `buildPublicStats` with `questionAnswers[i]` if missing). Show only when `stats.available && questionAnswers[i] ≥ 50` and `question.socialProof !== false` (set `false` on U=U to avoid broadcasting a stigma-loaded misconception). Copy: correct → "You're with the {pct}% who knew this 👀"; wrong and pct < 50 → "Most players didn't know this yet — now you do 💡"; wrong and pct ≥ 50 → "{pct}% of players knew this — now you're one of them". Never "got this wrong". Fallback when ungated: "You're one of the first players — no crowd to compare with yet." Optional phase 2: Violet Edge @ 18 % poll bars on the evidence chips from `hq:qopts` per-option counts.

**4.7 Completion stat (phase 2, optional).** `INCR hq:v1:starts` on Start; `completionPct = submissions / starts`. At Q8 the proof line becomes "Only {pct}% of players make it this far — you're in the top group 🏆" when available; fallback is the neutral eyebrow "2 to go" (no numberless claims about other players).

**4.8 Stats display.** Average shown as "Average of 12,483 players · 6.4/10" (one decimal, thousands separator). Percentile shown only when ≥ 50, rounded, brief's exact sentence "You scored higher than 68% of participants". Participant count from `stats.participants`. Under 5 participants → "first players" tile. Below-50 tile uses the derived hardest topic when available: "Average is 6.4/10 — most players miss {hardestTopic}. Beat it?" (topic = min `questionCorrectPct`), otherwise the numberless "Average is 6.4/10 — think you can beat it?".

**4.9 Interstitial queue.** One queue (`src/lib/celebrations.ts`): priority streak-5 banner > kit toast > streak-3 toast > sticker toast; **max one visual celebration per question**, others degrade to a chip pulse; all are `pointer-events:none`, auto-dismiss ≤ 1.2 s, and never delay the sheet, Next, or the aria-live announcement.

---

## 5. Motion spec

Motion primitives (`motion/react`, `LazyMotion features={domAnimation} strict`, `m.*`, `MotionConfig reducedMotion="user"`; no `layout`/`layoutId`/`drag` — collapses use explicit `animate={{height:0,opacity:0}}`): `snap = {type:"spring", stiffness:380, damping:30, mass:0.8}` · `bouncy = {stiffness:500, damping:18, mass:0.7}` · `sheet = {stiffness:320, damping:34}` · `stamp = {stiffness:600, damping:26}` · `press = {stiffness:600, damping:30}`. Tweens: `ease-emph` enters, `ease-in-quick` exits, `ease-back` pops, `ease-expo-out` bars/count-ups. RM = reduced motion (OS query or in-page toggle, persisted `hq:motion`); "crossfade" = opacity 150 ms, no transform.

| # | Animation | Trigger | Duration | Easing / spring | RM fallback |
|---|---|---|---|---|---|
| 1 | Button press | pointerdown / release | 0 ms down, 120 ms up | `ease-back` (transform only) | keep (no motion sickness risk) |
| 2 | Landing enter | mount | 300 ms, stagger 60 ms | `ease-emph`, y 16→0 | crossfade |
| 3 | Title highlighter draw | mount +200 ms | 320 ms | scaleX 0→1, `ease-emph` | appear |
| 4 | Pip idle float / blink | idle | 2.4 s loop / 120 ms every 3.5 s | ease-in-out | off / blink only |
| 5 | Orbit stickers | landing | 26 s linear loop | linear; stops on first pointerdown | hidden |
| 6 | Petri ring rotate | landing | 40 s linear | linear | static |
| 7 | CTA shimmer | landing | 2.8 s × 3 max | linear | off |
| 8 | Landing exit → Q1 enter | Start tap | 200 out / 280 in, options stagger 45 ms | exit opacity+scale .98 `ease-in-quick`; enter x 48→0 `snap` | crossfade |
| 9 | Segment fill | question mount | 300 ms | `ease-emph` scaleX (transform-origin left) | appear |
| 10 | Current segment pulse | Q8–Q10 | 1.2 s loop | opacity .7↔1 | off |
| 11 | Option lock | t=80 after tap | 120 ms / 150 ms | chosen scale .97→1 `press`; others opacity→.55 | opacity only |
| 12 | Wick reveal | t=180 | 220 ms | `::before` `clip-path: inset(0 100% 0 0)`→`inset(0)`, `ease-emph` | 120 ms opacity flip |
| 13 | Icon pop (CircleCheck/CircleX replaces letter) | t=180 | 200 ms | scale .6→1 `bouncy` | appear |
| 14 | Correct option pop | t=200 | 220 ms | scale 1→1.05→1 `ease-back` | none |
| 15 | Wrong option shake (chosen only) | t=180 | 240 ms | x [0,−6,6,−4,4,0] | none (icon+colour) |
| 16 | Correct option wick (after wrong) | t=260 | 220 ms | as #12 + Mint edge | opacity flip |
| 17 | "+150 XP" float label | t=200 | 500 ms | y 0→−24, opacity 1→0 `ease-emph` | none |
| 18 | XP header count-up | t≥750 | 400 ms | `ease-expo-out`, ≤10 ticks | final value |
| 19 | Flame chip pop / puff | reveal | 200 / 300 ms | scale 1→1.3→1 / scale→1.4 + opacity→0 | swap |
| 20 | Pip correct squash | t=180 | 320 ms | scaleY .88→1.08→1 `ease-back`, hop −10 | face swap only |
| 21 | Pip curious → encouraging | t=180 / +500 ms | 160 ms tilt, bulb `bouncy` | rotate +6° | face swap only |
| 22 | Options collapse | **t=400** | 200 ms (others) / 240 ms (chips) | height→0 + opacity `ease-in-quick`; chip morph `snap` | crossfade |
| 23 | Card shrink | t=400 | 200 ms | height/padding/font-size tween `ease-emph` | crossfade |
| 24 | Sheet rise | **t=400 (parallel with #22)** | ≈260 ms | y 100%→0 `sheet` spring | crossfade |
| 25 | Verdict strip kinetic type | t=520 | letters stagger 18 ms, ≤30 chars | opacity+y 6→0 | whole text |
| 26 | Proof line + XP chips | t=750 | stagger 60 ms | y 8→0 `snap` | appear |
| 27 | Rare-fact conic border | sheet open | 3 s loop, low contrast | `@property --angle` rotate | static border |
| 28 | Streak-3 toast | streak = 3 | 220 in, 900 hold, 180 out | y −24→0 `bouncy` | crossfade |
| 29 | Streak-5 banner | streak = 5 | 260 in, 900 hold, 200 out | y −40→0 `bouncy` | crossfade |
| 30 | Kit toast + accessory drop | Q3/6/8/10 mount | 1.2 s total | toast `bouncy`; accessory y −20→0 `snap` | appear |
| 31 | Next: sheet exit + stage exit | Next tap | 200 / 200 ms parallel | y 0→100% `ease-in-quick`; x 0→−48 opacity | crossfade |
| 32 | Next: new question enter | +200 ms | 280 ms, options stagger 45 ms | x 48→0 `snap`; options y 16→0 | crossfade |
| 33 | Eyebrow swap (Q7 "3 to go") | Q7–Q10 mount | 200 ms | y 8→0 + opacity | swap |
| 34 | Results crossfade | Reveal tap | 250 ms | opacity | keep |
| 35 | Pip drumroll wobble | 0–600 ms | 600 ms | rotate ±4°, 90 ms cycles | none |
| 36 | Score ring + count-up | 200–1400 ms | 1.2 s | `pathLength` + `animate(0,score)` `ease-expo-out`, ticks | final value at 200 ms |
| 37 | Title stamp | 1500 ms | ≈300 ms | scale 1.8→1, rotate −14→−6, opacity 0→1 `stamp`; ring dips y 3 px and back | fade 200 ms |
| 38 | Confetti tier | 1500 ms | ≤1.5 s | see §6 | off (`disableForReducedMotion`) |
| 39 | Stat tiles | 1800 ms, stagger 100 | 260 ms | y 24→0 `snap` (skeleton → content whenever data lands) | appear |
| 40 | Follow buttons + bottom bar | 2400 ms | 200 ms | y 16→0 opacity; Retake bounces 4 px once | appear |
| 41 | Wordle grid cells | 2100 ms | 40 ms stagger ×10 | scale 0→1 `bouncy` | appear |
| 42 | Sticker earned | after 2600 ms | 300 ms | rotate −12→0 scale 1.3→1 `bouncy` | appear |
| 43 | Retake | Retake tap | ring drain 300 ms, Q1 enter 280 | `ease-emph`, `snap` | crossfade |
| 44 | Toast (copied) | share fallback | 200 in, 2 s hold, 160 out | y 16→0 | crossfade |

Answer timeline summary: tap 0 → lock 80 → reveal + aria-live 180 → (wrong) correct wick 260 → collapse + sheet 400 → **readable ≈ 620–660 ms** → focus to verdict 700 → XP chips/ticks 750. Whole reveal-to-Next path never exceeds 1.1 s of visible motion; only the results choreography (≈ 2.6 s, tap to skip) is longer. `useReducedMotion()` is `null` on first render — never branch server markup on it; read the in-page toggle from localStorage in an effect.

---

## 6. Micro-interactions and haptics

Haptics: Android only (`'vibrate' in navigator`), called synchronously inside `click`/`pointerup` handlers (never `touchstart`), wrapped in try/catch, ≤ 200 ms total, governed by the haptics toggle (hidden on iOS; iOS has no Vibration API — never promise a buzz in copy).

| User action | Visual | Sound | Haptic |
|---|---|---|---|
| Any button press | translateY 4 px, edge collapses | `tap` | `vibrate(10)` |
| Start Quiz | AudioContext create/resume + silent buffer; #8, #9 | `tap` (quietest cue) | `vibrate(10)` |
| Tap option (t=0) | press + #11 | `select` | `vibrate(15)` |
| Correct reveal (t=180) | #12–#14, #17–#20, aria-live | `correct` | `vibrate([15,40,25])` |
| Wrong reveal (t=180) | #12, #13, #15, #16, #21, aria-live | `wrong` | `vibrate([40,60,40])` |
| Streak 3 / 5 | #28 / #29 + confetti | `streak` | `[15,30,15,30,40]` (streak 5 only) |
| Kit unlock | #30 | `streak` (short variant, 2 notes) | `vibrate(20)` |
| Next Question | #31–#33 | `tap` | `vibrate(10)` |
| Reveal my result | #34–#42 | `fanfare` under count-up; `thud` at stamp | `vibrate(10)` every other tick; `[30,40,30]` at stamp |
| Retake | #43 | `tap` | `vibrate(10)` |
| Share / WhatsApp / Save card | press; toast on clipboard fallback | `tap` | `vibrate(10)` |
| Sound toggle | icon crossfade 120 ms | one `tick` only when turning on | — |
| Motion toggle | icon crossfade; all motion → crossfades | — | — |
| Idle > 12 s on a question | Pip bubble "👀", ghost hint reappears once | — | — |

Confetti (canvas-confetti via `await import()` in the handler; `useWorker:true, disableForReducedMotion:true, zIndex:60` — below toasts at 70 and the sticky bar; `colors:['#CFC2FF','#BFF2D3','#FFE7A3','#BDE4FF','#FFD1D6']`): correct answer none · streak 3 one burst 40 · streak 5 two cannons 60 each · results 9–10 fireworks 150 ×3 at 0/500/1000 ms (`spread 180`) · 7–8 one "realistic" burst (5 calls at .25/.2/.35/.1/.1 of 200) · 4–6 one 40-particle pop from the stamp · 0–3 none (Pip celebrates anyway). Live particles < 300.

---

## 7. Sound design (Web Audio, synthesized — `src/lib/sound.ts`)

Architecture: one shared `AudioContext` created and `resume()`d inside the Start Quiz click, followed by a 1-sample silent buffer; `resume()` called defensively in every tap handler and on `visibilitychange`; master `GainNode` **0.40**; all cues from `OscillatorNode` + `GainNode` (+ one `BiquadFilterNode`, + a 1 s white-noise `AudioBuffer` generated once). ≥ 300 ms onset separation between distinct cues (scheduler drops a cue that would land inside the window, except `tick`). Success vs failure differ by pitch direction and timbre, never volume. **Default: sound on**, but silent until the Start tap; toggle `Volume2`/`VolumeX` 44 px top-right on every screen, persisted `hq:sound`. **iOS silent switch is respected** — do not set `navigator.audioSession.type='playback'` and do not use the silent-`<audio>` unmute hack; this link is opened in taxis and classrooms. Envelopes: linear attack, exponential release to 0.001.

| Cue | Recipe |
|---|---|
| `tap` | sine 520→660 Hz linear glide, 50 ms; attack 3 ms, release 40 ms; peak 0.18 |
| `select` | sine 1200 Hz 20 ms (attack 2, release 18) peak 0.12, layered with sine 180→120 Hz over 80 ms (low-pass 600 Hz) peak 0.16 — a light "lock" |
| `correct` | triangle C5 523 → E5 659 → G5 784 Hz, onsets 0/90/180 ms, each 120 ms (last 220), attack 5 ms, release 80 ms, peak 0.30; second oscillator +6 cents detune at 0.10; sine G6 1568 Hz sparkle at 180 ms, 220 ms, peak 0.08 |
| `wrong` | sine 330→196 Hz exponential glide 260 ms + triangle 165→110 Hz 300 ms through low-pass 800 Hz (Q .7); attack 15 ms, release 150 ms; peaks 0.26 / 0.10. Soft, low, informational — never a buzzer |
| `streak` | sines 880 / 1109 / 1319 / 1760 Hz, onsets every 60 ms, 140 ms each, attack 5 ms, release 90 ms, peak 0.18; noise shimmer high-passed 3 kHz 250 ms peak 0.04. Kit variant = first two notes only |
| `tick` | square 1200 Hz, 25 ms, attack 1 ms, release 20 ms, peak 0.06, throttled to one per 40 ms; used for XP and score count-ups |
| `whoosh` | white noise through band-pass sweeping 400→4000 Hz over 220 ms, peak 0.08; rare-fact cards and sheet rise (optional garnish) |
| `fanfare` | drumroll: sine 130→260 Hz over 1.2 s with gain LFO 12→30 Hz depth 0.5 at peak 0.12; resolves at 1.2 s into triangle C5 E5 G5 C6 staggered 120 ms, 280 ms each, peak 0.26, plus sine C7 shimmer 600 ms 0.06 and a held sine C6 900 ms 0.18 |
| `thud` (stamp) | white noise 60 ms through low-pass 300 Hz peak 0.30 + sine 110→70 Hz over 90 ms peak 0.26; attack 2 ms, release 80 ms |

---

## 8. Copy deck (`src/lib/copy.ts`)

**Brand / meta.** Tab title: "Prevention Challenge". Brand chip: "🧬 Prevention Challenge". OG title: "HIV Prevention Challenge".

**Landing.** Title: "HIV Prevention Challenge". Description: "How much do you know about HIV prevention? Take this 10-question challenge and find out!" Badges: "10 questions" · "~3 min" · "100% anonymous". Payoff preview: "Your title stamp goes here" · "6 stickers to collect" · returning: "Your best: {best}/10 · {n} of 6 stickers". Stats pill: "★ {participants} players · average {avg}/10 — beat it?" · fallback "Be one of the first players 🌟". Pip bubble: "Ready?" → "No pressure 😌". CTA: **"Start Quiz"**. Privacy: "Anonymous — we only store your score. No name, no number, nothing."

**Question.** Eyebrow: "Question {n} of 10". Q7–Q10 eyebrow: "3 to go — your title is loading 🏆" · "2 to go — almost there" · "Last one!" (Q9: "1 to go — one more after this"; Q10: "Last one!"). Ghost hint (Q1–Q2): "Tap to lock in — no take-backs 🔒". Idle bubble: "👀". XP chip: "{xp} XP" · with streak "{xp} XP · 🔥{n}".

**Feedback.** Correct header (single, no rotation): **"Correct! You know your stuff 💪"**. Not-quite header: **"Not quite — here's the fact 💡"**. Chip labels: "CORRECT ANSWER" · "YOUR ANSWER". Fact eyebrows: "💡 DID YOU KNOW?" · "🔬 RARE FACT". Important inset label: "Important". XP chips: "+{n} XP" · "⚡ Quick +50" · "🔥 ×1.5" · "🔥 ×2" · wrong: "+10 XP · learned it". Social proof: "You're with the {pct}% who knew this 👀" · "Most players didn't know this yet — now you do 💡" · "{pct}% of players knew this — now you're one of them" · fallback "You're one of the first players — no crowd to compare with yet." Q8 completion (if available): "Only {pct}% of players make it this far — you're in the top group 🏆". More affordance: "⌄ more". Next: **"Next Question →"** (Q1–Q9) · **"Reveal my result 🎁"** (Q10).

**Streak messages by length.** 2: chip "🔥2" (no toast) · 3: "On a roll 🔥×3 — XP ×1.5" · 4: chip "🔥4" · 5: "On fire 🔥×5 — XP doubled" · 6–9: chip only, "🔥{n}" · 10: handled by Champion fireworks; results tile "Perfect streak 🔥×10". Break: "Streak paused 💡 Knowledge unlocked." Next correct after a break: "Bounce back 💫".

**Kit toasts.** "Kit unlocked: ID badge 🪪" · "Kit unlocked: stethoscope 🩺" · "Kit unlocked: lab goggles 🥽" · "Kit unlocked: party hat 🎉 — last question!"

**Results.** Eyebrow "YOUR RESULT". Score "{score}/10". Tier stamps + growth lines:
- 0–3 **"HIV Prevention Beginner 🌱"** — "You just learned 10 things most people don't know. Round two?"
- 4–6 **"Getting There 📚"** — "Solid base. Two more right and you're a Pro."
- 7–8 **"Prevention Pro 💪"** — "You know the facts that keep people healthy. Two away from Champion."
- 9–10 **"Prevention Champion 🏆"** — "Flawless. Someone in your DMs needs these facts — share it."
Stats: "Average of {participants} players · {avg}/10" · "You scored higher than {pct}% of participants" (≥ 50 only) · "Average is {avg}/10 — most players miss {hardestTopic}. Beat it?" / "Average is {avg}/10 — think you can beat it?" · "You're one of the first players — the average appears once 5 people finish." Buttons: **"Retake Quiz"** · returning "Retake Quiz · beat your best {best}/10" (aria-label keeps "Retake Quiz") · "Share result" · "WhatsApp" · "Save story card" · **"Follow us on Instagram"** · **"Follow us on TikTok"**. Tiles: "{xp} XP · Longest streak 🔥{n} · {m:ss}" with "XP and streaks are for fun — your score is the real one." Sticker Book: "Sticker book · {n} of 6" · names: "First Run", "Prevention Pro", "Champion", "Perfect Run", "Hot Streak", "Comeback" · locked hints: "Finish once", "Score 7+", "Score 9+", "Score 10/10", "5 in a row", "Beat your best". New sticker toast: "New sticker: {name} 🎉". Review accordion: "Review your answers" · rows "{✓|○} {topic}" · expanded shows explanation + fact. Toast: "Copied! Paste it in WhatsApp or your story". Footer: "Anonymous: we saved only your score, answers and time. Your stickers and personal best are saved on your device only."

**Disclaimer (footer, all screens, 13 px Plum):** "This quiz is for education and is not medical advice. For testing, PrEP or PEP, visit your nearest clinic or pharmacy." (+ optional resource link, see §11.)

**Share text template** (≤ 280 chars, spoiler-free, colour-blind-safe):
```
HIV Prevention Challenge 🧬 {score}/10 {tierEmoji} {tierName}
{row1: 5 × 🟩/⬜}
{row2: 5 × 🟩/⬜}
{percentile ≥ 50 ? "Higher than {pct}% of players. Can you beat me?" : "Think you can beat my score?"}
https://{domain}/s/{score}?utm_source=share
```
Grid rows follow display order (question shown 1–5, 6–10). Never include question text.

---

## 9. Share mechanics (`src/lib/share.ts`)

1. **Web Share** — inside the click handler, before any `await`: `if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare({text,url}))) navigator.share({ title: 'HIV Prevention Challenge', text, url })`. `AbortError` → do nothing; `NotAllowedError`/other → step 2. Put the result *and* the link inside `text` (share targets unpredictably drop `url`).
2. **Clipboard** — `navigator.clipboard.writeText(text + '\n' + url)` called synchronously; catch → hidden `<textarea>` + `document.execCommand('copy')`; then toast "Copied! Paste it in WhatsApp or your story" 2 s. (Android WebView in IG/TikTok has no `navigator.share` and may throw "Document is not focused".)
3. **WhatsApp** — always rendered as a plain anchor `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}` (highest-value SA channel, zero API risk).
4. **Link preview** — route `app/s/[score]/page.tsx` (validates 0–10, sets metadata, redirects to `/`) + `app/s/[score]/opengraph-image.tsx` via `ImageResponse` (1200×630: Lilac ground, score "8/10", tier stamp, Wordle grid, "Prevention Challenge" wordmark, Pip drawn with the same SVG paths; **no "HIV" wording next to Pip**; score bucket only, no personal data). Fonts loaded from the same Google Fonts files at build.
5. **Story card** — "Save story card" renders a 1080×1920 `<canvas>` (Lilac ground, gradient dishes, Pip 320 px via `Image` from a `data:image/svg+xml` of the same SVG with kit, score 320 px Fredoka, stamp, grid, wordmark + domain; wait for `document.fonts.load('700 320px Fredoka')` first) → `toBlob` → `navigator.share({ files:[file] })` when `navigator.canShare?.({files})`; otherwise show the PNG in a modal with "Long-press to save". Never offer a `<a download>` (inert in in-app browsers).
6. **Emoji grid** — 🟩 for correct, ⬜ for not (never 🟥/❌), two rows of five, so it reads in narrow chat bubbles and for colour-vision deficiency; the numeric score carries the meaning.
7. Follow links — plain `<a href="https://www.instagram.com/{handle}/">` and `https://www.tiktok.com/@{handle}`, same tab, no `target="_blank"`, no `window.open`, no JS redirects (blank screens in Instagram iOS).

---

## 10. Accessibility and robustness checklist

**Semantics and focus**
- [ ] Question in `<h2 id="q">`; options are `<button>`s inside `<fieldset>` with a visually-hidden `<legend>` duplicating the question; letter badge `aria-hidden`; button name = option text.
- [ ] After tap: all options `aria-disabled="true"`, chosen `aria-pressed="true"`, the fieldset gets `inert`; chips are `<div>`s with `role="group" aria-label="Correct answer / Your answer"`.
- [ ] Focus order per question: heading (`tabIndex=-1`, `focus({preventScroll:true})`) → options A–D → toggles. Sheet open: focus to the verdict heading at t=700 → Next is the next Tab stop → more chevron (if present). After Next: focus to the new question heading.
- [ ] `:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 3px }` on every control (≥ 9.9:1).
- [ ] Sheet container `role="region" aria-label="Answer feedback"`. Streak/kit toasts are `aria-live="off"`; one shared visually-hidden `aria-live="polite"` status handles milestones, throttled to one message per 2 s.

**Live announcements (decoupled from motion)**
- [ ] At **t=180 ms** (reveal), before any collapse or sheet motion, the status region announces "Correct. {explanation}" or "Not quite. The answer is {correct option}. {explanation}"; the "Did you know?" text is available in the sheet, not announced.
- [ ] Results: "You scored {score} out of 10. {tierName}." announced at 200 ms; stats announced when they land.
- [ ] Progress: `<div role="progressbar" aria-valuemin="1" aria-valuemax="10" aria-valuenow="{n}" aria-valuetext="Question {n} of 10">`; XP chip `aria-live="off"`; Pip, stickers, confetti canvas, gradients `aria-hidden`.

**Colour independence and readability**
- [ ] Every state = tint + 24 px lucide icon + word (CircleCheck "Correct answer", CircleX "Your answer", Lightbulb "Not quite"). Wordle grid = filled-with-check vs empty.
- [ ] Ink on all surfaces ≥ 10:1; hue inks ≥ 6.3:1; Plum only on Lilac/Gauze/Lavender at ≥ 13 px; no white on pastels; `prefers-contrast: more` handled.
- [ ] Body ≥ 15 px, option text never below 15 px (compact mode shrinks padding, not text), captions 13 px min; rem units; `text-wrap: balance` on headings.
- [ ] Decorative emoji `aria-hidden`; meaningful ones `<span role="img" aria-label>`.

**Motion**
- [ ] `MotionConfig reducedMotion="user"` + in-page toggle (`hq:motion`), both mapping to the RM column in §5; confetti `disableForReducedMotion:true`; gradients/orbit/float/shimmer paused; sound stays available.
- [ ] Landing continuous motion: orbit stops on first pointerdown, shimmer capped at 3 sweeps, motion toggle labelled (`aria-label="Reduce animations"`, `aria-pressed`) — satisfies WCAG 2.2.2.
- [ ] `useReducedMotion()` is `null` on first render; never branch SSR markup on it.

**Layout and in-app browsers**
- [ ] `min-height:100vh; min-height:100svh` (no `dvh` on quiz screens — no reflow while toolbars animate); grid rows for bottom bars; results bar `position:sticky`.
- [ ] `viewport-fit=cover` + `padding-bottom:max(16px, env(safe-area-inset-bottom))` (inset is often 0 inside WKWebView).
- [ ] `format-detection telephone=no` (iOS auto-links "72" → hydration mismatch); `overscroll-behavior-y:contain`; `touch-action:manipulation`.
- [ ] Tap targets: options ≥ 56 px (auto-grow), CTAs 56–60 px, icon buttons 44 px glyph in 48 px hit area, 10–12 px gaps; primary actions in the bottom third.
- [ ] Follow buttons plain anchors; share chain share → clipboard → textarea → wa.me, all synchronous in the gesture; `navigator.share` absent in Android WebView.
- [ ] Haptics only inside click handlers with try/catch; toggle hidden on iOS.
- [ ] Audio: context created in Start click; `resume()` on every tap and `visibilitychange`; feature-detect everything; iOS mute switch respected.
- [ ] `QuizState` persisted to `sessionStorage` on every transition and restored on load (in-app reloads keep progress; reducer re-arms `questionShownAt`).
- [ ] `/api/submit` fires on the Reveal tap; results render from local state immediately; Redis failure or `available:false` never blocks the score; tiles are skeletons until data lands (no timeout cut-off).
- [ ] Prefetch the results route and dynamically import confetti at Q8.

**Performance (R20/GB users on $100–199 Androids)**
- [ ] First-load JS < 150 KB gz: `LazyMotion` + `m` (`domAnimation` only — no `layout`, `layoutId`, `drag`), confetti `await import()`, two `next/font` families latin subset, questions/copy inlined (no fetch to start), stats fetched once non-blocking.
- [ ] Zero raster images (OG/story card generated on demand); Pip ≤ 4 KB inline SVG; no `filter:blur`; animate only `transform`/`opacity`/`clip-path`; `will-change:transform` only on the sheet and active card while animating; profile the conic border on a low-end WebView before enabling.
- [ ] Phasing: ship score + streak + Pip (idle/thinking/correct/curious/encouraging/celebrating) + wick + collapse/sheet + results + share text first; kit unlocks, social-proof line, Sticker Book, OG image, story card, completion stat behind feature flags in `src/lib/flags.ts`.

---

## 11. Open questions / information needed from the client

1. **Instagram and TikTok handles** (exact profile URLs) for the two Follow buttons and the story-card footer.
2. **Organisation name and logo policy** — should the footer/OG card carry the organisation name, or stay neutral ("Prevention Challenge") for discretion? Any brand colour that must appear?
3. **Production domain** for share URLs (`https://{domain}/s/{score}`) and the story card footer.
4. **Content trims** — approve reducing explanations to ≤ 35 words and facts to ≤ 40 words (Q6 and Q9 currently force internal scrolling), and confirm the "Important:" paragraph in Q9 (reactive self-test needs confirmatory testing) may be rendered as a highlighted inset block.
5. **Social-proof opt-outs** — confirm U=U is excluded from the "{pct}% knew this" line and whether any other item should be.
6. **Local resources link** — an optional "Find testing, PrEP or PEP near you" link (e.g., the National Department of Health / B-Wise / Clicks–Dis-Chem self-test pages) for the footer disclaimer; and whether a helpline number should appear.
7. **Disclaimer wording sign-off** — "This quiz is for education and is not medical advice…" (any legal/medical review required?).
8. **Analytics stance** — confirm no third-party analytics SDK; only the anonymous submission (score, per-question choice, minute-bucketed timestamp) plus an optional `starts` counter for the completion stat.
9. **Sound default** — confirm "sound on by default, silent until the first tap, iOS mute switch respected", or prefer sound off by default.
10. **Mascot check** — a 10-minute silhouette test of Pip at 44/64 px with 5–10 people from the audience (does anyone read it as a germ?), and approval of the "already tested" plaster detail.
11. **Languages** — is an isiZulu/Sesotho version planned (affects `copy.ts` structure and option length budgets now)?
12. **Vercel/Upstash** — confirm Hobby vs Pro (non-commercial fair-use), the Upstash region matching the Vercel function region, and who owns the `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` secrets.
13. **Retake stats** — should retakes count toward the public average (recommended: count every completed run; note it in the admin view) or only first attempts (requires a device flag, which weakens the anonymity story)?