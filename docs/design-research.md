# UX research

# UX Research Findings: HIV Prevention Challenge (mobile quiz, SA youth via IG/TikTok bio links)

Research date: September 2026. Where a primary source was paywalled/blocked (Medium 403s for Kahoot/Duolingo posts), details come from search excerpts and are flagged "(secondary)". Contrast ratios in section 4 were computed by me with the WCAG 2.x formula (script in scratchpad) because no source published pastel-specific numbers.

---

## 1. What keeps people in a mobile quiz until question 10

**Format decisions backed by numbers**
- One question per screen beats all-at-once: Typeform reports completion up to **36% higher** with one-question-at-a-time; Rowform's aggregate data puts multi-step forms at **13.85%** completion vs **4.53%** for single-page. Caveat: a minority bounce on conversational forms because they can't see the whole thing, so show "10 questions, ~3 min" on the landing screen.
- BuzzFeed: **96%** of participants finish sponsored quizzes; **>75%** of its quiz traffic comes from social shares. The result screen is the share trigger, and the result works as an "identity badge" (your category names do this: Beginner / Getting There / Pro / Champion).
- Time budget: in a mobile quiz-app study (n=150, unsupervised, phones) people spent **14.55 s per item** on average (16.4 s in a lab). 10 items ≈ 2.5–3 min. Design the landing copy and the progress bar around "3 minutes".

**Progress visualisation**
- Goal-gradient / Zeigarnik: an incomplete bar creates pull toward 100%. Endowed-progress effect (Nunes & Drèze 2006): loyalty cards pre-stamped 2/10 finished at **34%** vs **19%** for 0/8 with identical effort. Application: use a **10-segment bar** (not a thin continuous one), and light segment 1 the instant "Start Quiz" is tapped so the user never sees an empty bar; label "Question 1 of 10" immediately.
- Duolingo's bar advances even on a wrong answer (progress is about position, not correctness) and animates fill with a **300 ms ease-out** width transition, **16 px** tall, fully rounded. Do the same: wrong answers still move you forward.

**Streaks / combos (in-quiz, not daily)**
- Kahoot Answer Streak (secondary, from Inside Kahoot!): a "snappy" streak animation fires at **2 correct in a row**; bonus was +100 at streak 2, +100 per level, capped at **500 after streak 5**, streak level uncapped. Kahoot found players "cared more about their streak than overall score" and shouted their streak number as a badge of honour. In **2020 Kahoot removed streak points** because they had an adverse effect on lower-performing students. Lesson for a health quiz: **show the streak as a visible flame counter (🔥×3) with escalating celebration, but do not let it change the score** (score stays an honest 0–10 knowledge measure; keeps educational credibility and avoids punishing learners).
- Duolingo combo bonus: XP tied to *longest* run of correct answers in a lesson (1–5 XP over 15 items). "Perfect lesson" ending: Duo head-explode animation, then **three stat cards slide up staggered** with count-up numbers and playful SFX. Streak research: users who reach a 7-day streak are **2.4x** likelier to return next day; lowering the streak barrier (one lesson, not full goal) gave **+3.3% 14-day retention**, +19% new-learner streaks. Principle: reward consistency, lower the bar, never make the user feel punished.
- Copy for the streak-break moment matters: Duolingo uses **"GOT IT"** (acknowledging) not "Wrong". Use "Not quite" / "Good guess" and immediately show the fact.

**Variable rewards ("one more" hooks)**
- If every action yields the same reward it becomes expected and ignored (Appcues; Hooked model). Vary intensity by tier: normal correct = small pop + tick sound; streak 3 = bigger burst + flame appears; streak 5 = "ON FIRE" full-width banner; 10/10 = fireworks. Make the "Did you know?" fact a variable reward too: most are standard 💡 cards, occasionally a visibly different "🔬 Rare fact" card (random ~1 in 4) so users keep pressing Next to see what's next.
- Duolingo's "treasure chest" style deferred reward: **+15%** lesson completion (secondary). Analogue: tease the result card ("Your title is 3 questions away 🏆") from question 7 onward.

**Immediate feedback design (learning evidence)**
- Retrieval practice with correct-answer feedback improves later retention; delaying feedback by as little as **12 s** measurably reduces learning. Feedback must appear within ~400 ms of the tap (Doherty), ideally the colour flip within 100 ms (Nielsen "instantaneous").
- Elaborated feedback vs correct-answer-only: the Frontiers 2021 mobile quiz-app study found **no learning difference** between "correct answer shown" (KCRF) and "correct answer + one extra sentence" (AIF); AIF just cost **~14% more time per item**. Implication: keep the explanation to **one sentence (≤ 20–25 words)** and the "Did you know?" to **≤ 25 words**; the fact is for engagement/credibility, not retention, so it can be optional-to-read. Don't stack two paragraphs behind the Next button.

**Share cards (Wordle pattern)**
- Wordle's growth came from the share format, not the puzzle: a spoiler-free emoji grid (30 squares, 3 colours) that "tells a story" in a matchbox, copied to clipboard with one tap; first line = game name + day + score. Heardle, Framed, Connections all copy the format. BuzzFeed: result = identity badge → sharing. See section 6 for the exact format.

**Social comparison (average + percentile)**
- Peers "similar or slightly better" raise effort; unfavourable comparison makes adolescents perceive and perform worse on the next attempt **unless there is a chance to self-repair** (retake), in which case competition becomes constructive. So: keep "Retake Quiz" as the first button, and **only show "You scored higher than X%" when X ≥ 50**; for lower scores show "Average is 6.4/10 — most people miss the same 2 questions. Retake and beat it?" Never show a red/negative percentile.

---

## 2. Duolingo-style juice: press feel, timing, haptics, confetti, sound

**Button press feel (Duolingo anatomy)**
- Primary button: flat top face + **4 px solid darker bottom edge** (box-shadow `0 4px 0 <darker>`), on :active the shadow collapses and the button moves **down 4 px** (`translateY(4px)`), optional `filter: brightness(.95)`. Animate the transform, not the box-shadow (shadow animation is expensive). Duolingo greens: `#58cc02` / edge `#58a700`; red `#ff4b4b`; orange streak `#ff9600`; yellow XP `#ffc800`; purple `#ce82ff`; blue `#1cb0f6`. For pastel, use the pastel as face and a 600–700 shade of the same hue as the edge.
- Answer options in Duolingo are white cards with a 2 px border + 4 px bottom edge; selected = blue border/tint; correct = green face; wrong = red face; the incorrect state adds a **gentle shake**.

**Timing (ms) to use**
- NN/g: simple feedback (checkbox/toggle) ≈ **100 ms** total; modal/bottom-sheet entry **200–300 ms**; exits slightly shorter than entries (300 in / 200–250 out); anything ≥ **500 ms** "starts to feel like a real drag". More frequent = shorter and subtler.
- Material 3: mobile baseline **300 ms**; enter **225 ms**, exit **195 ms**, complex up to **375 ms**; emphasized easing `cubic-bezier(0.2, 0, 0, 1)`; micro-interactions use standard easing.
- Doherty threshold **400 ms** (system response); Nielsen **0.1 s** = instantaneous, **1 s** keeps flow.
- Recommended answer sequence: t=0 tap → press-down (transform, 0 ms); t≈80 ms lock-in (selected option scale .97→1, others fade to 60%); t≈150–200 ms reveal colour + icon; wrong: shake ±4 px, 3 cycles ≈ **220 ms**; correct: option pop 1→1.04→1 ≈ 200 ms; sound + haptic exactly at reveal; feedback sheet slides up **240 ms ease-out** starting ~200 ms after reveal; confetti (if tier warrants) at reveal. Whole thing < 600 ms before the user can read. Next-question transition: card swipe/crossfade **250–300 ms**.
- Result screen: score count-up **1.2–2 s** (CountUp.js default is 2 s), category badge pops after count-up, three stat cards stagger **80–120 ms** apart (Duolingo pattern).

**Haptics (what actually works in 2026)**
- Android Chrome/Samsung/WebView: `navigator.vibrate()` works, including patterns, but is **blocked unless the frame has had a user gesture, and `touchstart` does not count — `click`/pointerup does**. Call it synchronously inside the click handler and wrap in try/catch. Patterns: tap/select `vibrate(10)`; correct `vibrate([15, 40, 25])` (short-pause-slightly longer = "confirm"); wrong `vibrate([40, 60, 40])` ("sharper double-tap" per Android guidance); streak milestone `vibrate([20, 30, 20, 30, 60])`. Keep everything ≤ ~200 ms total.
- iOS Safari/WKWebView: the Vibration API is **not implemented** (caniuse; W3C manual test failed on iOS 17.4.1; a single March 2026 GitHub report claims otherwise — unverified, treat as no). The `<input type="checkbox" switch>` Taptic trick (ios-haptics) worked programmatically on **iOS 17.4–26.4** but **Apple patched it in iOS 26.5**; post-patch, only a *real user tap landing on the switch element* produces a **single tick** (the @haptics/* library overlays an invisible switch on the button, `isTrusted` required, multi-segment patterns collapse to one tick). If you adopt it: overlay the switch inside the answer button, `aria-hidden="true" tabindex="-1"`, and accept one tick on tap only (no distinct correct/wrong haptic on iOS).
- Always offer a haptics/sound toggle; accessibility guidance warns intense/unexpected vibration overwhelms some users.

**Confetti restraint (canvas-confetti)**
- Defaults: `particleCount 50, angle 90, spread 45, startVelocity 45, decay 0.9, gravity 1, ticks 200, scalar 1, zIndex 100`. Set **`disableForReducedMotion: true`** (promise resolves immediately) and **`useWorker: true`**; in Next App Router `const confetti = (await import('canvas-confetti')).default` inside the handler.
- Budget: correct answer = **no confetti** (use the option pop + sound); streak 3 = 1 burst `particleCount 40, spread 70, origin {y: .7}`; streak 5 = two side cannons `angle 60/120, spread 55, particleCount 60` each; final result 9–10 = fireworks `particleCount 150, spread 180` fired 2–3 times over ~1.5 s; 7–8 = one "realistic" burst (README: fire 5 calls with ratios .25/.2/.35/.1/.1 of ~200 particles). Keep total live particles < ~300 on low-end Android. Use pastel `colors` array so it stays on-brand.

**Sound (Web Audio, synthesized)**
- Autoplay policy: an AudioContext created outside a gesture starts `suspended`; create or `resume()` it **inside the first click** (Start Quiz), keep **one shared context**, and call `resume()` defensively on every tap (there are reports of iOS re-suspending after ~5 s idle on 18.5). Sound must be opt-in-by-default-on but silent until the first tap anyway.
- iOS **mute switch silences Web Audio entirely** (WebKit bug 237322) while `<audio>` elements still play; the `unmute-ios-audio` trick plays a silent looping `<audio>` on first interaction to route Web Audio through the media channel. Decide whether you want to bypass the user's silent switch; for a bio-link site opened in public, I'd **respect the mute switch** and show a small 🔇/🔊 toggle.
- Earcon guidance: UI sounds **100–300 ms**; differentiate success vs error by **pitch direction, rhythm and timbre, not volume**; ≥ **300 ms** onset separation between consecutive sounds. Duolingo's correct cue is a bright two/three-note rising "ding-dilin". Recipes: correct = triangle/sine C5→E5→G5 (523/659/784 Hz), 3 × 70 ms, fast 10 ms attack, 120 ms release, gain ~-10 dB; wrong = triangle 220→165 Hz glide over 150 ms at -14 dB (soft, low, non-punitive); tap = 6 ms noise/click or 1200 Hz sine 20 ms; streak milestone = ascending arpeggio 4 notes × 60 ms; result reveal = rising tremolo during count-up ending on a major chord. Never use a buzzer-style error.

**Reduced motion**
- WCAG 2.3.3 / common practice: opacity crossfades are fine; remove parallax, zoom, spin, shake, confetti, count-up jitter. Use `useReducedMotion()` from motion: duration 0 or crossfade 150 ms; swap shake for a colour flip + icon; disable confetti via the library flag; keep sound optional. Provide an in-page "Reduce animations" toggle in addition to the OS query.

---

## 3. Mobile-first layout rules (360–430 px, in-app browsers)

**Tap targets and spacing**
- WCAG 2.5.8 (AA): **24×24 CSS px** minimum with no overlap; 2.5.5 (AAA) **44×44**; Apple HIG **44 pt**; Material **48 dp**. Finger pad ≈ 1.6–2 cm = **45–57 px**. Hoober's precision data: users need ~**42 px** at top of screen, **46 px** at bottom, 27 px in the centre. Above ~40 pt, *separation* affects error rate more than size.
- Spec: answer buttons **56–64 px tall**, full width minus 16–20 px gutters, **12 px** vertical gap; primary CTA **56 px**; icon controls (sound/motion) ≥ 44 px hit area even if the glyph is 24 px.

**Thumb zone**
- Primary actions in the bottom third; Start / Next / Retake / Share live in a bottom bar. Progress and question at top (read-only), options in the middle-lower area. Never put Next above the fold or require scrolling to reach it.

**Fitting question + 4 options + progress on one screen (no scroll)**
- Worst case is a 360×640 Android inside Instagram: subtract status bar (~24) + IG top bar (~56) + IG bottom bar (~48) → ~**512 px** of web viewport. Budget: progress/header 48 → question block max 3 lines at 18 px/1.3 + 16 px padding ≈ 100 → 4 × 56 options + 3 × 12 gaps = 260 → bottom CTA 56 + `max(16px, safe-area)` ≈ 80. Total ≈ **488 px**. So: **question ≤ ~90 characters**, **options ≤ ~40 characters** (1–2 lines at 16 px), option height `clamp(52px, 11dvh, 64px)`. Use `min-height: 100dvh; display:grid; grid-template-rows: auto 1fr auto` with options in the `1fr` region using `justify-content: space-evenly`. Feedback appears as a bottom sheet over the options (Duolingo) so the layout never grows.
- Typography: body 16 px min; question 18–20 px semibold; line-height 1.3–1.4. Reading level: NIH/AMA recommend **6th grade**, CDC **8th grade** for health materials; SA co-design participants asked for "straightforward English" and optional isiZulu/Sesotho.

**Viewport units and 100vh**
- `100vh` = large viewport (toolbars retracted) → overflow on load in Safari/Chrome mobile. Use **`100svh`** for a fixed, non-resizing screen (recommended here) or **`100dvh`** when you want it to follow the toolbar; dvh triggers reflow/repaint as the toolbar animates, so avoid dvh on layouts that also scroll. Write `height:100vh; height:100svh` (fallback first). Support: Safari iOS 15.4+, Chrome/WebView 108+.
- In-app browsers have "non-standard viewport behaviour" — test on real devices in IG and TikTok. Instagram iOS = **WKWebView** (no collapsing address bar, but its own header/footer); Instagram Android = **system WebView** (UA contains `Instagram <ver> Android` and `wv`); TikTok uses WKWebView on iOS (no "open in browser" button) and WebView on Android, where some sites load with **broken CSS/JS** (one documented case fixed by disabling a cache plugin's "guest optimization"; keep your build boring: no exotic loading tricks). Both apps inject JS (IG `pcm.js`; TikTok keystroke/tap monitoring) — irrelevant to layout but a reason not to collect anything. Detection helpers: inappdebugger.com, `inapp-spy` npm.
- Safe areas: need `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`; `env(safe-area-inset-bottom)` can be **0 inside WKWebView in-app browsers**, so use `padding-bottom: max(16px, env(safe-area-inset-bottom))`. Once you opt into viewport-fit=cover you own all insets.
- iOS auto-links numbers ("72", phone-like strings) and can cause React hydration mismatches inside Instagram's WKWebView → add `<meta name="format-detection" content="telephone=no">`.
- Instagram iOS quirks: `window.open()` can show a blank white screen; hidden/programmatic link clicks are ignored; `location.href` redirects only work inside a user gesture. Make "Follow on Instagram/TikTok" plain `<a href="https://www.instagram.com/…">` / `https://www.tiktok.com/@…` anchors (universal links open the native app), no JS redirects, no `target=_blank` tricks.

**Audio/autoplay and Share in webviews** (details in §2 and §6)
- No audio without a tap; iOS mute switch kills Web Audio.
- `navigator.share` is present in iOS WKWebView (Safari 12.2+), **absent in Android WebView** (caniuse: not supported through WebView 152; react-native-webview issue) → IG/TikTok Android users need the clipboard/WhatsApp fallback.
- `navigator.clipboard.writeText` in Android WebView can throw "Document is not focused"/NotAllowedError; also fails if you `await` anything before calling it (gesture expires). Call it first, synchronously in the click handler; fall back to a hidden `<textarea>` + `document.execCommand('copy')`.

**Performance constraints (South Africa)**
- Android ≈ **67%** of SA smartphone revenue share (≈85% unit share Africa-wide); **42%** of units sold are $100–199 devices; 1 GB prepaid ≈ **R20.50** avg (R79 at MTN/Vodacom prepaid), SA ranks 67/100 on data cost. Users literally "fight over data" (Soweto co-design). Budget: first-load JS **< ~150 KB gz**; use `m` + `LazyMotion` (≈**4.6 KB** vs **34 KB** for full `motion`), `useAnimate` mini (2.3 KB) where possible; 2 font families max via `next/font` with `display: swap` and latin subsets; no video; confetti dynamically imported.

---

## 4. Pastel palettes that still pass WCAG AA

Computed contrast ratios (WCAG 2.x). AA text = 4.5:1 (3:1 for ≥ 24 px or ≥ 18.66 px bold); non-text UI (1.4.11) = 3:1.

**Rule 1 — ink on pastel: use 900/800-level darks; never white; never gray-500.**
On Tailwind-style 200-level pastels (pink-200 `#FBCFE8`, sky-200 `#BAE6FD`, indigo-200 `#C7D2FE`, violet-200 `#DDD6FE`, purple-200 `#E9D5FF`, green-200 `#BBF7D0`, teal-200 `#99F6E4`, amber-100 `#FEF3C7`, cream `#FFF7ED`):
- `#0F172A` slate-900: **12.0–16.8:1** (AAA everywhere) → default body/question ink
- `#1F2937` gray-800: 9.8–13.8:1
- `#334155` slate-700: **6.9–9.8:1** → secondary text
- `#475569` slate-600: 5.1–7.1:1 → AA only; weakest on indigo-200 (5.08)
- `#64748B` slate-500: **3.2–4.5:1 → FAILS AA** for body text on every pastel; only usable as large text
- White `#FFFFFF`: 1.1–1.5:1 → never on pastel
- Hue-matched deep inks pass AAA and look "designed": pink-900 `#831843` on pink-200 = 6.98; violet-900 `#4C1D95` on violet-200 = 7.89; green-900 `#14532D` on green-200 = 7.52; sky-900 `#0C4A6E` on sky-200 = 7.13; orange-900 `#7C2D12` on peach `#FFE5B4` = 7.64.

**Rule 2 — 300-level "mid pastels" (pink-300 `#F9A8D4`, sky-300 `#7DD3FC`, violet-300 `#C4B5FD`, orange-300 `#FDBA74`, green-300 `#86EFAC`)**: slate-900 still 9.6–12.7:1; slate-700 5.6–7.4 (AA); slate-600 **fails** on violet-300 (4.10) and pink-300 (4.18). Use ≥ 700 inks here.

**Rule 3 — buttons: pastel face + dark ink, or 600-shade fill + white.** White text fails on almost every 500-level fill you'd instinctively pick: green-500 `#22C55E` 2.28, emerald-500 2.54, sky-500 `#0EA5E9` 2.77, amber-500 2.15, orange-500 2.80, teal-500 2.49, pink-500 `#EC4899` 3.53 (large text only). Passing white-text fills: violet-600 `#7C3AED` **5.70**, red-600 `#DC2626` 4.83, pink-600 `#DB2777` 4.60, indigo-500 `#6366F1` 4.47, violet-500 4.23, sky-600 `#0284C7` 4.10. Best "pastel-native" CTA: dark ink on a bright pastel (slate-900 on green-300 = 12.7; on pink-300 = 9.8) with a 600-shade bottom edge.

**Rule 4 — semantic feedback tints (AA/AAA verified):** correct = green-800 `#166534` on green-100 `#DCFCE7` (6.49) or green-900 on green-200 (7.52); wrong = red-800 `#991B1B` on red-100 `#FEE2E2` (6.80) or red-900 on red-200 (6.93); fact card = amber-900 `#78350F` on amber-100 (8.15); info = sky-800 `#075985` on sky-100 (6.59); streak = violet-800 `#5B21B6` on violet-100 (7.57). Pair colour with an icon + word ("Correct ✓"/"Not quite") — never colour alone (also helps the ~8% of men with red-green deficiency).

**Rule 5 — non-text UI 3:1:** progress fill vs track and card borders: pink-500 on cream = 3.32 (pass), sky-500 = 2.61 (fail), green-500 = 2.15 (fail) → use 600 shades or a dark track outline for meaningful UI elements.

Notes: Tailwind v4 defines its palette in OKLCH; the hexes above are v3-equivalents, so re-check final tokens with a contrast checker (InclusiveColors / accessibility.build). Consider `@media (prefers-contrast: more)` to swap 700 → 900 inks and thicken borders. Reference systems: Headspace (peach/orange pastels + dark ink), Calm (deep blue + lavender), Duolingo (saturated accents on white, dark text), Gen-Z "functional maximalism"/"brain rot" aesthetic (layered shapes, stickers, kinetic type, jarring combos) — take the energy (motion, emoji stickers, blobs, marquee) but keep one type system and compliant inks.

---

## 5. Keeping dignity and credibility (tone + UNAIDS 2024 terminology)

**UNAIDS Terminology Guidelines 2024 — exact do/don't (from the PDF tables):**
- Say **"people living with HIV"** (or "person living with HIV"); never HIV-infected, AIDS patient/sufferer/victim/carrier, transmitter.
- **"acquiring HIV" / "acquire HIV"**, not catch/contract/get infected; "risk of acquiring HIV" or "risk of exposure to HIV", not "risk of AIDS".
- **"HIV test"**, not "AIDS test"; "HIV" not "HIV virus"/"AIDS virus"; **"HIV and AIDS"**, not "HIV/AIDS".
- **"condomless sex"** is now preferred over "unprotected sex" — because PrEP, ART and contraception also "protect", the old term is confusing. (If you must be colloquial: "sex without a condom".)
- **"safer sex"**, not "safe sex"; **"sexually transmitted infection (STI)"**, not disease/venereal.
- "HIV-positive/HIV-negative" are fine **for test results**, but describe people as "living with HIV"; "many people feel 'being HIV-positive' reduces them to a viral infection". Unknown status = "having unknown HIV status".
- Never "risk groups", "high-risk groups", "most-at-risk"; describe the **behaviour and context** instead ("sex without a condom with a partner whose status you don't know"). Use "key populations"/"young key populations" only where needed.
- "sex worker" not prostitute; "sterile" not "clean" equipment (and by extension never call an HIV-negative person "clean"); avoid the abbreviation **MSM** in prose ("gay men and other men who have sex with men").
- Avoid combat metaphors (fight, battle, war on AIDS) → "HIV response", "ending AIDS as a public health threat". Avoid "eliminate/eradicate HIV".
- Definitions to quote for credibility: **U=U** — a person living with HIV *cannot* transmit HIV when their viral load is undetectable and they keep taking treatment as prescribed. **PrEP** — antiretrovirals taken *before* possible exposure, effective in all populations when taken as prescribed. **PEP** — antiretrovirals taken *after* possible exposure "within a few days"; WHO/SA guidance: as soon as possible, within **72 hours**, for 28 days.

**How SA young people want to be addressed (co-design, Soweto, n=40, median age 20; 88% own phones, 72.5% internet):**
- "Needs to be colourful and appealing", with animation and motion — pastel + playful is aligned with what they asked for.
- Plain, direct English; they removed jargon ("penetrative", "orgy") and reworded "Have you tested?" to **"When was the last time you tested?"** (assumes testing is normal). Requested isiZulu/Sesotho options.
- **Discretion**: "if my mom sees that [HIV app], she will be curious" — they wanted a neutral logo/name. Implication: keep the browser tab title/favicon and the share card wording non-alarming (e.g., 🧬 "Prevention Challenge" badge art), and no autoplay sound on the landing.
- **Privacy**: "as soon as I leave the app, the data should be gone"; no names/DOB. Say it on screen: "Anonymous — we only store your score, no personal data" (a trust signal, not legalese).
- Race-based risk questions were called "offensive"; frame advice without shame: "condomise, fewer partners, go to your nearest clinic".
- Data cost anxiety ("people fight a lot when it comes to data") → lightweight, no video.

**Edutainment evidence:** MTV Shuga (SA/Nigeria): complex, relatable, non-judgemental, youth-centred storylines raise knowledge and reduce stigma; exposed youth in Eastern Cape had higher awareness of self-screening and PrEP. B-Wise (NDoH/PEPFAR, SA) uses relatable language, storytelling, WhatsApp, and explicitly "non-judgmental" services. REDXIR (gamified HIV-stigma course, n=241): 88% completed ≥1 mission, 4.16/5 satisfaction, 98.4% would continue; used heroic framing (students as a "task force" against stigma) and a **localised leaderboard (±5 ranks)** to avoid discouraging low performers.

**Tone rules for this quiz**
- Playful about the *game*, never about HIV or people. Celebrate knowledge ("You know your stuff 💪"), not "safety status". No 💀/🤡/😬 on wrong answers; use 💡 and "Not quite — here's the fact".
- Every wrong answer is a "myth busted" moment, written as the true statement first ("PEP works best within 72 hours") not the false one.
- Category copy: pair each tier with a growth line ("Beginner 🌱 — you just learned 10 things most people don't know").
- Keep SA-specific, current facts to stay credible (as of Sep 2026): HIV self-test kits are on shelves at Clicks and Dis-Chem (e.g., OraQuick ≈ R199; First Health one-step ≈ R30–40, 15-minute result) and free at many clinics; oral PrEP is free at public clinics (≈ R300/month private); the 6-monthly lenacapavir injection launched at **360 public clinics on 5 June 2026** prioritising women 15–24; finger-prick rapid tests give results in ~15–20 min.
- Anonymous stats copy: "Average score of 12,483 players: 6.4/10". Round percentiles, never show rank.

---

## 6. Share mechanics from IG/TikTok bio-link traffic

**Channel reality in SA:** WhatsApp is the #1 app (≈ **94–96%** of SA internet users; favourite app for 34%, ahead of TikTok 23.8%). The share button's real job is "send to WhatsApp / paste into a story caption". Web pages cannot post to IG Stories/TikTok directly; treat "Follow us" as the IG/TikTok action and "Share" as WhatsApp/clipboard/system sheet.

**API facts**
- `navigator.share()` needs HTTPS + **transient activation** (call directly in the click handler, no awaits before it). Fields: `title`, `text`, `url`, `files`. `title` is usually ignored by mobile share sheets; whether targets show `text`, `url` or both is **unpredictable** (some open only the URL). So put the result *and* the link in `text`, and pass `url` too. Errors: `AbortError` = user cancelled (do nothing), `NotAllowedError` = no gesture/policy → fall back.
- Support: iOS Safari & WKWebView (Instagram/TikTok iOS) ✅ since 12.2; Chrome Android ✅; Samsung Internet ✅; **Android WebView ❌** (Instagram/TikTok Android in-app browsers) → `typeof navigator.share !== 'function'`.
- Clipboard: `navigator.clipboard.writeText()` first (synchronous in the gesture), catch → hidden textarea + `execCommand('copy')`; then toast "Copied! Paste it in WhatsApp or your story" for ~2 s. Android WebView commonly throws "Document is not focused".
- WhatsApp deep link works everywhere as a plain anchor: `https://wa.me/?text=<encodeURIComponent(shareText)>`.

**Recommended fallback chain (one "Share result" button + one explicit WhatsApp button):**
1. `navigator.share` available && `canShare({text,url})` → system sheet.
2. else copy to clipboard (+ execCommand fallback) → toast.
3. Always also render a WhatsApp button (wa.me) — highest-value channel, zero API risk.
4. Link preview: WhatsApp/IG DMs render OG images; generate a **dynamic OG image per score bucket** with Next.js `ImageResponse` (`/share/[score]/opengraph-image`) — no external assets needed, no personal data (score only). Share `url` should point at that route with UTM params so you can count shares.

**Share text format (Wordle grammar, ≤ 280 chars, spoiler-free, colour-blind-safe)**
```
HIV Prevention Challenge 🧬 8/10 💪 Prevention Pro
🟩🟩⬜🟩🟩
🟩🟩🟩⬜🟩
Higher than 68% of players. Can you beat me?
https://…/share/8?utm_source=share
```
- Use 🟩 vs ⬜ (not 🟩/🟥 or ✅/❌) so the grid is readable with colour-vision deficiency and looks Wordle-familiar; the numeric score carries the meaning anyway.
- Two rows of 5 so it reads on narrow chat bubbles; never include question text (keeps the quiz spoiler-free and the message discreet).
- Only include the percentile line when ≥ 50th percentile; otherwise "Average is 6.4 — think you can beat it?".
- Provide a second, image-based share for stories: a **"Save result card"** button rendering the score card to a PNG via `<canvas>` (`toBlob`) → `navigator.share({files})` when `canShare({files})` (iOS Safari/WKWebView, Chrome Android) — this is the only way to get a visual into an IG/TikTok story from the web; on Android WebView fall back to "long-press to save" on the rendered image.

---

## Implementation cheat-sheet (numbers to hard-code)
- Option button 56–64 px tall, 12 px gap, 16–20 px gutters; CTA 56 px in bottom bar with `padding-bottom: max(16px, env(safe-area-inset-bottom))`.
- Screen: `min-height: 100svh` (fallback 100vh), grid `auto 1fr auto`, question ≤ 90 chars, options ≤ 40 chars, explanation ≤ 25 words, fact ≤ 25 words.
- Motion: press 0 ms translateY(4px); reveal ≤ 150–200 ms after tap; shake 220 ms; sheet 240 ms ease-out in / 180 ms out; page transition 250–300 ms; count-up 1.5 s; stagger 100 ms; nothing ≥ 500 ms except celebration sequences.
- Haptics: Android `vibrate(10)` tap, `[15,40,25]` correct, `[40,60,40]` wrong, on `click` only; iOS: none (or single-tick switch overlay).
- Sound: one AudioContext, resume() in every tap, 70–150 ms earcons, rising for correct / low descending for wrong, ≥ 300 ms between sounds, toggle visible.
- Confetti tiers: none / streak-3 (40) / streak-5 (2×60) / final 9–10 (3×150), `disableForReducedMotion: true, useWorker: true`.
- Colour: slate-900 ink on 200-level pastels; 800/900 hue inks for tinted text; CTAs dark-on-pastel or 600-fill + white; feedback tints listed above; no gray-500 body text; re-verify OKLCH tokens.
- Progress: 10 segments, segment 1 lit on Start, advances on wrong answers too, 300 ms ease-out.
- Streak: visible flame counter, celebrations at 3/5/10, zero effect on score.
- Copy: UNAIDS terms (people living with HIV, acquire, condomless/without a condom, safer sex, HIV test, STI); "Not quite" not "Wrong"; percentile only ≥ 50%; anonymity statement on landing and result.
- Share: share() → clipboard → wa.me; 🟩⬜ grid + score text; dynamic OG image per score; PNG card via canShare({files}) for stories.
- Bundle: `m` + LazyMotion (~4.6 KB), dynamic-import confetti, 2 fonts via next/font (e.g., Fredoka/Baloo 2 display + Nunito body), no video; target < 150 KB gz first load for R20/GB users on $100–199 Androids.

# Stack research

# Frontend scaffold research — as of 2026-09-03

## 1. Exact versions (npm registry `latest` tags checked today)

| Package | Latest | Notes |
|---|---|---|
| `next` | **16.3.4** (2026-08-31) | 16.0.0 shipped 2025-10-22; 16.3.0 2026-08-03; `canary` = 16.4.0-canary.15; `backport` = 15.5.25. `engines.node >= 20.9.0` |
| `react` / `react-dom` | **19.2.8** | create-next-app pins exactly `"19.2.8"` (App Router actually runs a bundled React canary; keep them declared) |
| `@types/react` / `@types/react-dom` | 19.2.18 / 19.2.7 | |
| `tailwindcss` / `@tailwindcss/postcss` | **4.3.3** (2026-07-16) | 4.3.0 released 2026-05-08. `postcss` 8.5.28 |
| `motion` | **13.2.0** (2026-09-02) | 13.0.0 2026-08-05. Depends on `framer-motion ^13.2.0` + `motion-dom ^13.2.0`; peer `react ^18 \|\| ^19` |
| `canvas-confetti` / `@types/canvas-confetti` | **1.9.4** / **1.9.0** | types last touched 2025-08 |
| `lucide-react` | **1.40.0** (2026-09-03) | 1.0.0 shipped 2026-03-23; peer `react ^16.5.1 \|\| ^17 \|\| ^18 \|\| ^19` |
| `@upstash/redis` | **1.38.3** | `next` tag 1.35.0-canary; canary 1.39.0-canary |
| `typescript` | **7.0.2** (2026-07-08) | Go-native "tsgo". `5.9.3` (2025-09-30) is the last 5.x; 6.0.0 exists. **create-next-app still pins `^5`** — see gotcha below |
| `eslint` / `eslint-config-next` | 10.9.1 / **16.3.4** | CNA pins `eslint ^9` (9.39.5). `eslint-config-next` peer `eslint >=9`; it depends on `typescript-eslint ^8.46.0` whose peer is `typescript >=4.8.4 <6.1.0` |
| `babel-plugin-react-compiler` | **1.0.0** | CNA pins `"1.0.0"` |
| `@types/node` | 26.4.1 latest; **24.13.3** for Node 24 | CNA pins `^20`; Vercel default runtime is **24.x** → pin `@types/node@^24` |
| `@biomejs/biome` | 2.4.2 (CNA pin, only if you pick Biome) | |

Recommended devDependency pins for this project: `typescript ^5.9.3`, `@types/node ^24`, `eslint ^9.39.5` (ESLint 10 also works: typescript-eslint 8 peers `^8.57 || ^9 || ^10`).

## 2. `create-next-app@latest` (16.3.4) — what it scaffolds now

Command: `npx create-next-app@latest hiv-quiz --yes` (skips prompts). First prompt is "Would you like to use the recommended Next.js defaults? — TypeScript, ESLint, Tailwind CSS, App Router, AGENTS.md". "Customize settings" asks, in order: TypeScript, linter (ESLint/Biome/None), **React Compiler (No/Yes)**, Tailwind, `src/`, App Router, import alias (`@/*`), AGENTS.md.

Flags: `--ts --tailwind --eslint|--biome|--no-linter --app --api --src-dir --react-compiler --turbopack (default) --webpack --import-alias "@/*" --empty --use-pnpm|--use-npm --skip-install --disable-git --agents-md --yes`.

Generated files (TS+Tailwind+ESLint template):
- `next.config.ts` — literally `const nextConfig: NextConfig = { /* config options here */ }`; **no** `cacheComponents`, `reactCompiler`, or `turbopack` keys. Turbopack is default via CLI, not config.
- `postcss.config.mjs` — `const config = { plugins: { "@tailwindcss/postcss": {} } }; export default config;`
- `eslint.config.mjs` — `import { defineConfig, globalIgnores } from "eslint/config"; import nextVitals from "eslint-config-next/core-web-vitals"; import nextTs from "eslint-config-next/typescript"; export default defineConfig([...nextVitals, ...nextTs, globalIgnores([".next/**","out/**","build/**","next-env.d.ts"])])`
- `tsconfig.json` — `target ES2017`, `module esnext`, `moduleResolution bundler`, `jsx react-jsx`, `strict`, `paths {"@/*":["./*"]}` (**no `baseUrl`**, which is TS7-compatible), `plugins [{name:"next"}]`, include has `next-env.d.ts`, `.next/types/**/*.ts`, `.next/dev/types/**/*.ts`, `**/*.mts`.
- `app/globals.css` — `@import "tailwindcss"; :root{--background;--foreground} @theme inline { --color-background: var(--background); --color-foreground: var(--foreground); --font-sans: var(--font-geist-sans); --font-mono: var(--font-geist-mono); } @media (prefers-color-scheme: dark){...} body{...}` — delete the dark-mode block since dark mode is not needed.
- `app/layout.tsx` — `Geist` + `Geist_Mono` from `next/font/google` with `variable: "--font-geist-sans" / "--font-geist-mono"`, applied on `<html className={\`${geistSans.variable} ${geistMono.variable} h-full antialiased\`}>`, `<body className="min-h-full flex flex-col">`.
- `AGENTS.md` + `CLAUDE.md` (referencing it); `next dev` rewrites the managed block pointing at `node_modules/next/dist/docs/` (version-matched docs; 16.2+).
- Scripts: `"dev": "next dev", "build": "next build", "start": "next start", "lint": "eslint"`. **No `proxy.ts`/`middleware.ts` is generated.** `next lint` no longer exists and `next build` does not lint.

## 3. Next.js 16.x breaking changes / gotchas you will actually hit

- **Async request APIs — sync access fully removed in 16.** `const c = await cookies()`, `await headers()`, `const { id } = await params`, `const q = await searchParams`. Route handler signature: `export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> })`. Global generated helpers (no import): `PageProps<'/quiz/[slug]'>`, `LayoutProps`, `RouteContext<'/api/x/[id]'>` (generated by `next dev`/`next build`/`next typegen`).
- **`middleware.ts` → `proxy.ts`** (deprecated, not removed). `export function proxy(request: NextRequest) {}` (or default export), `export const config = { matcher: ['/admin/:path*'] }`. Proxy runs on **Node.js runtime only**; setting `runtime` in it throws. `NextProxy` type from `next/server`. `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`. Codemod: `npx @next/codemod@canary middleware-to-proxy .` Not needed for this app unless you want early redirects for `/admin`.
- **Turbopack is default for `next dev` and `next build`.** `next dev` writes to `.next/dev` (dev and build can run concurrently; lockfile prevents duplicate dev servers). FS cache is on by default for dev and build. A custom `webpack()` config makes `next build` fail; use `--webpack` to opt out. Config is top-level `turbopack: {}`.
- **React Compiler**: stable but **off by default**. Enable with `reactCompiler: true` in `next.config.ts` + `npm i -D babel-plugin-react-compiler@1.0.0`. Expect slower dev/build (Babel). 16.3 adds experimental Rust path: `experimental.turbopackRustReactCompiler: true`. Fine to skip for a small quiz.
- **Caching API changes**: `revalidateTag('x')` now requires a 2nd arg (`revalidateTag('x', 'max')`); `updateTag()` and `refresh()` (Server Actions only); `cacheLife`/`cacheTag` lost `unstable_` prefix. `experimental.ppr`, `dynamicIO`, `useCache` removed → `cacheComponents: true`. **If you enable `cacheComponents`, the `dynamic`, `dynamicParams`, `revalidate`, `fetchCache` segment exports are removed** and `cookies()` outside `<Suspense>` blocks prerendering. For this app: leave `cacheComponents` off.
- **Route Handlers** (`app/api/*/route.ts`): `GET` is **dynamic by default since v15** (no caching unless `export const revalidate = N` or `dynamic = 'force-static'`). Defaults: `runtime = 'nodejs'` (`'edge'` is **deprecated**), `preferredRegion` deprecated, `maxDuration` set by platform. `export const dynamic = 'force-dynamic'` is still valid (without cacheComponents) and harmless as an explicit marker. Return `Response.json(...)`; read body with `await request.json()`; query via `request.nextUrl.searchParams`. Set cookies with `(await cookies()).set(...)` (allowed in Route Handlers and Server Functions only, never during Server Component render).
- 16.3 additions worth knowing: Instant Navigations are **opt-in** (`cacheComponents: true, partialPrefetching: true`); custom error boundaries via `catchError` from `next/error`; `import.meta.glob` (Turbopack only); `next/root-params`; `experimental.useOffline`. Prefetches are now bundled (fewer requests). Web streams replaced by Node streams server-side (no code changes).
- Other removals: `serverRuntimeConfig`/`publicRuntimeConfig` (use env vars; `NEXT_PUBLIC_` for client), AMP, `next lint`, `eslint` key in next.config, `devIndicators.*` sub-options. `next/image` defaults changed (`minimumCacheTTL` 4h, `qualities: [75]`, `maximumRedirects: 3`, local `?query` needs `images.localPatterns.search`). Parallel route slots need `default.tsx`. `scroll-behavior: smooth` no longer overridden unless `<html data-scroll-behavior="smooth">`.
- Min versions: Node 20.9, TypeScript 5.1, browsers Chrome/Edge/Firefox 111+, Safari 16.4+.

### TypeScript 7 gotcha (important for this scaffold)
- TS 7.0 (Go port) **ships no JavaScript compiler API until 7.1 (~Oct 2026)**. `typescript-eslint@8.x` peer is `<6.1.0` and the maintainers closed TS7 support as "not planned" for now → `eslint-config-next/typescript` will break if you install `typescript@7`. Next.js itself is fine: since 16.3 `next build` runs the project-local `tsc` CLI by default (`experimental.useTypeScriptCli`, default `true`) precisely to support TS 7; the IDE plugin (`plugins: [{name:'next'}]`) still requires the TS 5/6 JS API.
- TS 7 also removes `baseUrl` (CNA tsconfig already uses `paths` without it), `moduleResolution node10`, `target es5`; defaults `strict: true`, `types: []`, `rootDir: ./`, `module: esnext`.
- **Recommendation**: stay on `typescript@^5.9.3` (what CNA installs) for this project; or run both via `@typescript/typescript6` (`tsc6`) if you want TS7's speed. Do not `npm i -D typescript@latest`.

## 4. Tailwind CSS v4.3.3 with Next 16 / Turbopack

- Install (already done by CNA): `tailwindcss @tailwindcss/postcss postcss`. **Keep `@tailwindcss/postcss`** — the new `@tailwindcss/webpack` loader (4.3, 2x faster) only applies to webpack builds; Turbopack processes `postcss.config.{js,mjs,cjs,ts}` in a Node worker pool and needs the object form with plugin names as strings (`"@tailwindcss/postcss": {}`), which the scaffold already uses.
- Single import: `@import "tailwindcss";` — no `@tailwind base/components/utilities`, no `tailwind.config.js`, no `content` array (auto content detection; add `@source "../path";` for extra dirs, `@source not` to exclude). Class names must appear literally in source (no runtime string concatenation).
- Theme tokens live in CSS. Namespaces → utilities: `--color-*` (bg-/text-/border-…), `--font-*` (font-), `--text-*` (font-size), `--font-weight-*`, `--tracking-*`, `--leading-*`, `--breakpoint-*` (`sm:`…), `--spacing-*`, `--radius-*`, `--shadow-*`, `--animate-*`, `--ease-*`.

```css
@import "tailwindcss";

@theme {
  /* colors: oklch preferred; generates bg-brand-500, text-brand-500, ... */
  --color-brand-50: oklch(0.97 0.02 350);
  --color-brand-500: oklch(0.62 0.21 350);
  --color-brand-700: oklch(0.48 0.19 350);
  /* replace an entire default namespace if desired: --color-*: initial; */

  /* fonts: values that reference other vars must be in @theme inline (see next/font below) */
  --font-display: "Fraunces", ui-serif, serif;

  /* animations: keyframes MUST be declared inside @theme for --animate-* */
  --animate-pop: pop 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  @keyframes pop {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  --ease-snappy: cubic-bezier(0.2, 0.8, 0.2, 1);
  --radius-card: 1.25rem;
}
```
→ `class="bg-brand-500 font-display animate-pop ease-snappy rounded-card"`. Reference tokens in custom CSS with `var(--color-brand-500)`, `--alpha(var(--color-brand-500) / 50%)`, `--spacing(4)`.
- `@theme inline { ... }` when a token's value is another CSS variable (otherwise the utility emits `var(--font-sans)` pointing at the variable *name*, which breaks scoping). `@theme static` forces emitting all variables even if unused (useful when reading tokens from JS/motion, e.g. `animate={{ backgroundColor: "var(--color-brand-500)" }}`).
- Custom utilities/variants: `@utility tab-* { tab-size: --value(integer, --default(4)); }` (4.3 adds `--default()`), `@custom-variant state-correct (&[data-state="correct"]);`, `@variant hover:focus { ... }` (stacked variants new in 4.3). `@apply` still works; `@reference "../../app/globals.css"` inside CSS Modules.
- 4.3 goodies you may want: `scrollbar-thin scrollbar-thumb-brand-500/60 scrollbar-gutter-stable`, `@container-size`, `font-features-["tnum"]` (tabular numbers for timers/scores), `zoom-*`, `tab-*`, new neutral palettes `mauve/olive/mist/taupe`. Dark mode: simply don't add `@custom-variant dark`; delete the scaffold's `prefers-color-scheme` block.

## 5. `next/font/google` + Tailwind v4 (CSS-variable pattern)

```tsx
// app/layout.tsx
import { Geist, Fraunces } from "next/font/google"; // multi-word names use underscores: Roboto_Mono
const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" }); // variable font: no weight needed
const display = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz"] });
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
```
```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-display: var(--font-fraunces);
}
```
Gotchas: non-variable Google fonts require `weight: '400'` or `['400','700']`; omit `subsets` with `preload: true` (default) → warning; fonts declared in root layout preload on all routes; call each font loader once (shared `app/fonts.ts`), never per-component; no requests to Google at runtime (self-hosted at build).

## 6. `motion` 13.2.0 (Framer Motion successor)

- `npm i motion`. Imports: `import { motion, AnimatePresence, LayoutGroup, MotionConfig, useReducedMotion, useReducedMotionConfig, animate, stagger } from "motion/react"`. Other entries: `motion/react-client` (re-exports `framer-motion/client`: `motion.*` components pre-marked `"use client"` so a Server Component can render `<motion.div>` without wrapping), `motion/react-m` + `motion/react-mini` (LazyMotion `m`/`domAnimation` for smaller bundles), `motion` (vanilla), `motion/mini`, `motion/three`, `motion/vgpu`.
- **v13 breaking change (the only one)**: the optional `@emotion/is-prop-valid` dependency was removed; only matters with styled-components/emotion (`<MotionConfig isValidProp={isPropValid}>`). v12: no breaking changes; v10 removed `exitBeforeEnter` → `mode="wait"`. 13.1.1 fixed `AnimatePresence` in React 19 strict mode; 13.2 improved `spring` size/perf. No known React Compiler incompatibility.
- **AnimatePresence** props (from `AnimatePresenceProps` d.ts): `initial?: boolean`, `mode?: "sync" | "wait" | "popLayout"`, `custom?`, `onExitComplete?`, `propagate?: boolean`, `root?: HTMLElement | ShadowRoot`, `presenceAffectsLayout?` (internal), `anchorX/anchorY` (internal). Rules: keep `<AnimatePresence>` mounted and conditionally render its children; direct children need stable unique `key`s (not array index); `mode="wait"` supports one child at a time (perfect for question-to-question transitions); `popLayout` requires custom components to `forwardRef` and a non-`static` positioned parent.
- **Layout animations**: `layout`, `layout="position"` (aspect-ratio changes), `layout="size"`, `layout="x"|"y"` (axis-locked, 12.36+), `layoutId="progress-pill"` for shared-element; group with `<LayoutGroup>`; configure via `transition={{ layout: { type: "spring", ... } }}`; element must not be `display: inline`; set `borderRadius`/`boxShadow` via `style`/`animate` (not className) so scale-distortion correction works; give children `layout` to avoid stretching.
- **`useReducedMotion(): boolean | null`** — `null` on the server/first render (SSR hydration gotcha: don't derive server-rendered markup from it). Prefer global `<MotionConfig reducedMotion="user">` (`"user" | "always" | "never"`): `"user"` disables transform/layout animations but keeps opacity/color animations when the OS pref is set.
- **Spring config** (`motion-dom` `SpringOptions`): physics form `{ type: "spring", stiffness: 100 (default), damping: 10 (default), mass: 1 (default), velocity, restSpeed: 0.1, restDelta: 0.01 }`; duration form `{ type: "spring", duration: 0.5, bounce: 0.25 (default when duration set), visualDuration }` — `bounce`/`duration` are overridden if any of stiffness/damping/mass is set. Tween defaults: `duration 0.3` (0.8 for keyframes). Per-value transitions: `transition={{ default: { type: "spring" }, opacity: { ease: "linear" } }}`; orchestration `delay`, `repeat`, `repeatType: "loop" | "reverse" | "mirror"`, `delayChildren: stagger(0.05)`. Good "quiz card" spring: `{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }`.

## 7. `canvas-confetti` 1.9.4 + `@types/canvas-confetti` 1.9.0

- `import confetti from "canvas-confetti"` — the types use `export = confetti`, so the default import needs `esModuleInterop`/`allowSyntheticDefaultImports` (CNA tsconfig has `esModuleInterop: true`). Browser-only (touches `document`) → call only inside a `"use client"` component event handler/effect (or `await import("canvas-confetti")`).
- Signature: `confetti(options?): Promise<undefined> | null`. Options and defaults: `particleCount 50, angle 90, spread 45, startVelocity 45, decay 0.9, gravity 1, drift 0, flat false, ticks 200, origin {x:0.5,y:0.5}, colors: string[] (hex), shapes: ['square','circle','star'] | Shape[], scalar 1, zIndex 100, disableForReducedMotion false`. `confetti.create(canvas?, { resize, useWorker, disableForReducedMotion })` returns a bound launcher with its own `.reset()`; `confetti.reset()`; `confetti.shapeFromPath({ path, matrix? })`; `confetti.shapeFromText({ text: "🎉", scalar: 2 })`.
- Gotchas: default global canvas is `position: fixed` with `zIndex: 100` — pass a higher `zIndex` if your overlay/modal is above 100; `useWorker: true` hands the canvas to a Worker (don't draw on it yourself); always pass `disableForReducedMotion: true`; repeated calls reuse one canvas/promise; the `Promise` resolves when particles finish (use it to sequence a sound or navigation).

## 8. `lucide-react` 1.40.0 (1.0 line)

- `import { CircleCheck, CircleX, LoaderCircle, Trophy, PartyPopper, Volume2, VolumeX, Vibrate, ChartColumn } from "lucide-react"`; dynamic by name: `import { DynamicIcon } from "lucide-react/dynamic"` (root-level `dynamic.mjs/.d.ts`; the package has **no `exports` map**, only `main`/`module`, `sideEffects: false`).
- Props: `size` (24), `color` (currentColor), `strokeWidth` (2), `absoluteStrokeWidth` (false), `className`, any SVG attribute; types `LucideProps`, `LucideIcon`. New in 1.x: `<LucideProvider size={20} strokeWidth={1.75} className="shrink-0">` + `useLucideContext()` for global defaults. Every icon module carries `"use client"`, so icons work inside Server Components.
- **1.0 breaking changes**: (a) 14 brand icons removed — Chromium, Codepen, Codesandbox, Dribbble, Facebook, Figma, Framer, Github, Gitlab, Instagram, LinkedIn, Pocket, RailSymbol, Slack (use Simple Icons); (b) UMD build dropped (ESM+CJS only; package ~32% smaller); (c) icons render `aria-hidden="true"` **by default** unless you pass `aria-label`/`title`/children — pass `aria-label` for meaningful standalone icons; (d) `lucide-vue-next` → `@lucide/vue` (n/a). Old alias names still ship as aliases of canonical names (verified in the 1.40.0 d.ts): `XCircle→CircleX`, `CheckCircle2→CircleCheck`, `Loader2→LoaderCircle`, `BarChart3→ChartColumn`, `AlertCircle→CircleAlert`, plus `*Icon` suffixed variants — prefer canonical names in new code. No `@deprecated` JSDoc tags exist, so no lint noise either way.

## 9. `@upstash/redis` 1.38.3 + Vercel Marketplace "Upstash for Redis"

- **Env vars the Marketplace integration injects** (per the Vercel listing): `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, `REDIS_URL`, `UPSTASH_REDIS_REST_URL` (and its token counterpart when present). Vercel KV itself no longer exists (migrated to Upstash Dec 2024). If you choose a custom env prefix when connecting the store, `fromEnv()` will not find the vars — either keep the default prefix or pass `url`/`token` explicitly. Pull locally with `vercel env pull .env.development.local`. The plain Upstash console gives `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
- **`Redis.fromEnv()` exact behavior (from `nodejs.mjs`)**: `url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL`; `token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN`. Missing vars only `console.warn` (does **not** throw) → the first command fails with an opaque error, so assert env presence yourself at module scope. It throws `TypeError` if `process.env` is undefined (Cloudflare → `@upstash/redis/cloudflare`). `Redis.fromEnv(config)` accepts the same options as `new Redis({...})`: `url, token, automaticDeserialization (default true), enableAutoPipelining (default true), latencyLogging, enableTelemetry, readYourWrites, retry, keepAlive, agent, signal, cache, responseEncoding`. Import path for Next/Vercel Node functions: `import { Redis } from "@upstash/redis"` (resolves to `nodejs.mjs`).
- **Pipelines / transactions**: `const p = redis.pipeline(); p.incr(k); p.hincrby(h, f, 1); const [a, b] = await p.exec<[number, number]>();` — one HTTP round trip, **not atomic**. `redis.multi()` has the identical API and runs as MULTI/EXEC (atomic). Auto-pipelining (on by default) batches commands awaited concurrently (`Promise.all([...])`) into one request; sequential `await`s are separate requests. `redis.eval(script, keys, args)` / `redis.createScript(lua).exec(keys, args)` (EVALSHA with EVAL fallback) for atomic read-then-branch logic.
- **Metering**: Upstash bills per command; each command inside a pipeline/MULTI counts individually (pipelining reduces latency and HTTP requests, not command count). Operational commands (PING, INFO, AUTH, etc.) are free. Whether commands executed inside a Lua script are metered individually is not documented — do not build the budget around EVAL.
- **Free tier (2026)**: **500K commands/month** (the old 10K/day limit was replaced in March 2025), 256 MB data, 10 GB bandwidth/month, 1 free database, max request size 10 MB. Exceeding the quota makes commands throw exceptions (per FAQ) → wrap every stats write in `try/catch` and never let Redis failure block the quiz result screen. Pay-as-you-go is $0.20 per 100K commands. Pick the Upstash region matching your Vercel function region (Vercel default `iad1` = us-east-1); a Global DB adds write latency.

### Redis command budget for the quiz
Per submission (10 questions) in **one `redis.multi()`**: `INCR hq:v1:submissions` (1) + `HINCRBY hq:v1:scores <score> 1` (1) + `HINCRBY hq:v1:q:<i> <choice> 1` ×10 (10; there is no multi-field HINCRBY) + `LPUSH hq:v1:recent <json>` (1) + `LTRIM hq:v1:recent 0 199` (1) = **14 commands → ~35,700 submissions/month** on the free tier before reads. Optional daily counter `INCR hq:v1:day:2026-09-03` + `EXPIRE` = 16. Admin read = `GET` + `HGETALL scores` + 10×`HGETALL q:i` (or one `HGETALL hq:v1:answers` if you key fields as `q3:b`, which also cuts writes to 10 HINCRBY on one hash) + `LRANGE recent 0 49` ≈ 4-13 commands; wrap the admin read in `unstable_cache`/`revalidate = 60` so refreshes don't burn quota. Keep raw submissions anonymous (score, per-question choice, timestamp bucket, optional UA class — no IPs), capped by LTRIM. With `automaticDeserialization` on, HINCRBY/INCR return numbers and HGETALL returns `Record<string, number>`.

## 10. Vercel Hobby limits relevant here
- Functions (Fluid compute, default on for new projects): **1M invocations/month, 4 active-CPU hours/month, 360 GB-hours provisioned memory/month**; max duration **300 s default and max** on Hobby (set `export const maxDuration = 10` on route handlers to cap cost); memory 2 GB / 1 vCPU; request/response body **4.5 MB**; default region `iad1`; runtime logs kept 1 hour; 100 deployments/day; env vars ≤64 KB total. Fast Data Transfer ~100 GB/month and ~1M edge requests/month per Vercel's pricing page (third-party summaries; the docs table renders the numbers client-side). Hobby is **non-commercial only** (fair-use policy).
- Node.js: **24.x default** (22.x, 20.x available; Node 20 deprecated Oct 1 2026). Pin with `"engines": { "node": "24.x" }` and `@types/node@^24`.
- A quiz submission = 1 invocation + a few ms of active CPU; the Redis quota (500K commands), not Vercel, is the binding constraint.

## 11. Simple admin protection (env secret, timing-safe, cookie)

```ts
// lib/admin-auth.ts (server only; Node runtime)
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
const PASSWORD = process.env.ADMIN_PASSWORD!;          // .env.local / Vercel env, never NEXT_PUBLIC_
const SECRET = process.env.ADMIN_SESSION_SECRET!;      // 32+ random bytes, separate from the password
export const COOKIE = "hq_admin";
function sha(s: string) { return createHash("sha256").update(s).digest(); }
export function safeEqual(a: string, b: string) { return timingSafeEqual(sha(a), sha(b)); } // hash first: timingSafeEqual requires equal-length buffers
export function sessionToken() { return createHmac("sha256", SECRET).update("admin:v1").digest("base64url"); }
export function isValidSession(v?: string) { return !!v && safeEqual(v, sessionToken()); }
```
```ts
// app/api/admin/login/route.ts
import { cookies } from "next/headers";
export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || !safeEqual(password, PASSWORD)) return Response.json({ ok: false }, { status: 401 });
  (await cookies()).set(COOKIE, sessionToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  return Response.json({ ok: true });
}
```
Guard `app/admin/page.tsx` (Server Component) with `const v = (await cookies()).get(COOKIE)?.value; if (!isValidSession(v)) redirect("/admin/login");` and check the same cookie inside the stats route handler (`request.cookies.get(COOKIE)?.value`). `cookies().set/delete` are only legal in Route Handlers/Server Functions (not during render). Optional `proxy.ts` with `matcher: ["/admin/:path*"]` for an early redirect (Node runtime, `node:crypto` available). Add a tiny in-memory/Redis rate limit on the login route if you like (Upstash `@upstash/ratelimit` costs ~2 commands per attempt).

## 12. Web Audio on iOS and `navigator.vibrate`
- **AudioContext unlock**: on iOS Safari (and Chrome's autoplay policy) the context starts `suspended`; create it lazily or call `await ctx.resume()` **inside a user-gesture handler** (`pointerdown`/`touchend`/`click`, not `touchstart`-only), then optionally play a 1-sample silent buffer. Keep a singleton context; decode/pre-generate blips (`OscillatorNode` + `GainNode` envelopes are enough for quiz feedback). iOS moves the context to `interrupted`/`suspended` on backgrounding or a phone call — re-check `ctx.state` and resume on the next gesture / `visibilitychange`.
- **Silent switch**: Web Audio output is muted by the iOS ringer/silent switch (HTML `<audio>` is not). Fix with the AudioSession API before resuming: `if ("audioSession" in navigator) navigator.audioSession.type = "playback";` — supported Safari/iOS **16.4+** (also Firefox 158+; not Chrome). Fallback: loop a silent `<audio>` element (the `unmute-ios-audio` pattern). Always feature-detect; wrap in try/catch.
- **`navigator.vibrate(pattern)`** (returns boolean, needs sticky user activation): supported on Chrome Android 32+, Samsung Internet, Edge/Opera Android; **not supported on Safari iOS (through 26.x) or macOS Safari**; Firefox desktop dropped it at v129; silent/DND mode can suppress it. Use `if ("vibrate" in navigator) navigator.vibrate(15)` and treat it as best-effort; there is no web haptics API on iOS.

## 13. Pinned package.json suggestion
```json
{
  "dependencies": { "next": "16.3.4", "react": "19.2.8", "react-dom": "19.2.8", "motion": "^13.2.0", "canvas-confetti": "^1.9.4", "lucide-react": "^1.40.0", "@upstash/redis": "^1.38.3" },
  "devDependencies": { "typescript": "^5.9.3", "@types/node": "^24", "@types/react": "^19.2.18", "@types/react-dom": "^19.2.7", "@types/canvas-confetti": "^1.9.0", "tailwindcss": "^4.3.3", "@tailwindcss/postcss": "^4.3.3", "postcss": "^8.5.28", "eslint": "^9.39.5", "eslint-config-next": "16.3.4" },
  "engines": { "node": "24.x" }
}
```
Scaffold with `npx create-next-app@latest hiv-quiz --yes --use-npm` (or `--use-pnpm`), then `npm i motion canvas-confetti lucide-react @upstash/redis && npm i -D @types/canvas-confetti @types/node@^24`, remove the dark-mode block from `globals.css`, keep `postcss.config.mjs`/`eslint.config.mjs` as generated, and create `.env.local` with `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (or the `KV_*` pair pulled from Vercel), `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.

# Sources

- https://www.strivecloud.io/blog/blog-gamification-examples-boost-user-retention-duolingo
- https://blog.duolingo.com/improving-the-streak
- https://duolingo.fandom.com/wiki/Combo_bonus
- https://blakecrosley.com/guides/design/duolingo
- https://60fps.design/shots/duolingo-lesson-complete-head-explode-animation
- https://medium.com/inside-kahoot/experimenting-with-answer-streaks-to-help-make-learning-awesome-3b3357e42595
- https://support.kahoot.com/hc/en-us/community/posts/360033686653-Disable-Answer-Streak-Bonus
- https://www.leadquizzes.com/blog/how-to-make-buzzfeed-quiz/
- https://www.jotform.com/blog/one-at-a-time-question-on-survey-form/
- https://rowform.io/blog/single-question-vs-long-forms-the-data-on-why-single-question-forms-win/
- https://www.coglode.com/nuggets/endowed-progress-effect
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=991962
- https://www.appcues.com/blog/variable-rewards
- https://dispatch.digia.tech/p/gamification-mobile-apps-streaks-rewards-retention-mechanics
- https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.665144/full
- https://pmc.ncbi.nlm.nih.gov/articles/PMC7550480/
- https://nishad.substack.com/p/why-wordle-won
- https://dawnosaur.substack.com/p/why-did-these-games-go-viral
- https://www.sciencedirect.com/science/article/abs/pii/S0167876024001971
- https://emerginginvestigators.org/articles/23-197/pdf
- https://www.nngroup.com/articles/animation-duration/
- https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- https://lawsofux.com/doherty-threshold/
- https://uxuiprinciples.com/en/principles/response-time-limits
- https://medium.com/@lilskyjuicebytes/clone-the-ui-1-replicating-duolingos-button-in-pure-css-bd37a97edb7e
- https://www.joshwcomeau.com/animation/3d-button/
- https://caniuse.com/vibration
- https://github.com/mdn/browser-compat-data/issues/29166
- https://issues.chromium.org/issues/41361876
- https://github.com/w3c/vibration/issues/25
- https://github.com/tijnjh/ios-haptics
- https://haptics.kushagragolash.dev/
- https://github.com/m1ckc3s/project-fathom
- https://developer.android.com/develop/ui/views/haptics/haptic-feedback
- https://saropa.com/articles/2025-guide-to-haptics-enhancing-mobile-ux-with-tactile-feedback
- https://github.com/catdad/canvas-confetti/blob/master/README.md
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
- https://gist.github.com/TimvanScherpenzeel/c870b35358fb96fa643d9ed1ea606efd
- https://bugs.webkit.org/show_bug.cgi?id=237322
- https://github.com/feross/unmute-ios-audio
- https://webrtchacks.com/autoplay-restrictions-and-webrtc/
- https://sfxengine.com/blog/best-practices-for-game-ui-sounds
- https://uisfx.com/ui-sound-design
- https://pub.dega-akustik.de/ICA2019/data/articles/000354.pdf
- https://www.researchgate.net/publication/228607856_Experimentally_derived_guidelines_for_the_creation_of_earcons
- https://silktide.com/accessibility-guide/the-wcag-standard/2-3/seizures-and-physical-reactions/2-3-3-animation-from-interactions/
- https://motion.dev/docs/react-reduce-bundle-size
- https://ishadeed.com/article/target-size/
- https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/
- https://testparty.ai/blog/wcag-target-size-guide
- https://www.72technologies.com/blog/tap-targets-thumb-zones-mobile-ux
- https://parachutedesign.ca/blog/thumb-zone-ux/
- https://blog.openreplay.com/fix-100vh-mobile-viewport/
- https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9
- https://webkit.org/blog/7929/designing-websites-for-iphone-x/
- https://developer.apple.com/forums/thread/699415
- https://blog.master.dev/the-pitfalls-of-in-app-browsers/
- https://dev.to/jplogix/escaping-instagrams-in-app-browser-on-ios-and-why-its-so-hard-58om
- https://linkrunner.io/blog/universal-links-app-links-break-in-app-browsers
- https://mobiforge.com/research-analysis/webviews-and-user-agent-strings
- https://wordpress.org/support/topic/issues-with-tiktoll-in-app-web-browser/
- https://krausefx.com/blog/announcing-inappbrowsercom-see-what-javascript-commands-get-executed-in-an-in-app-browser
- https://github.com/vercel/next.js/issues/43914
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
- https://caniuse.com/web-share
- https://web.dev/articles/web-share
- https://www.gyford.com/phil/writing/2020/04/10/web-share-api/
- https://github.com/react-native-webview/react-native-webview/issues/1262
- https://github.com/react-native-webview/react-native-webview/issues/2480
- https://dev.to/parsajiravand/the-await-that-silently-breaks-navigatorclipboardwritetext-10oe
- https://www.meltwater.com/en/blog/2025-social-media-statistics-south-africa
- https://42matters.com/most-popular-mobile-apps-south-africa
- https://www.grandviewresearch.com/horizon/outlook/smartphone-market/south-africa
- https://mybroadband.co.za/news/cellular/657852-cheapest-and-most-expensive-mobile-data-in-south-africa.html
- https://allafrica.com/stories/202602170116.html
- https://www.unaids.org/sites/default/files/media_asset/2024-terminology-guidelines_en.pdf
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11785273/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10843381/
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10900091/
- https://www.povertyactionlab.org/evaluation/mtv-shuga-changing-social-norms-and-behaviors-entertainment-education-nigeria
- https://bwisehealth.com/Home/About
- https://www.sanews.gov.za/south-africa/health-department-launches-app-dedicated-youth-health-services
- https://clicks.co.za/health/article-view/everything-you-need-to-know-about-hiv-self-testing
- https://clicks.co.za/oraquick_hiv-self-test/p/370261
- https://www.spotlightnsp.co.za/2026/06/03/in-the-spotlight-all-you-need-to-know-about-the-jab-that-could-dramatically-reduce-new-hiv-infections-in-sa/
- https://health-e.org.za/2026/04/22/south-africa-receives-lenacapavir-but-rollout-is-delayed/
- https://preston.libguides.com/healthliteracy/patientcom
- https://dev.to/ingosteinke/how-to-provide-an-accessible-high-contrast-alternative-to-a-pastel-color-scheme-396g
- https://www.inclusivecolors.com/
- https://www.aufaitux.com/blog/tactile-maximalism-gen-z-ui/
- https://www.vev.design/blog/web-design-trends-2025/
- https://www.uxpin.com/studio/blog/color-schemes-for-apps/
- https://madegooddesigns.com/nunito-alternatives/
- https://fontfoundryhub.com/best-fredoka-font-pairings-alternatives/
- https://nextjs.org/docs/app/getting-started/installation
- https://nextjs.org/docs/app/api-reference/cli/create-next-app
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://nextjs.org/blog/next-16
- https://nextjs.org/blog/next-16-3
- https://nextjs.org/docs/app/api-reference/file-conventions/route
- https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
- https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- https://nextjs.org/docs/app/api-reference/functions/cookies
- https://nextjs.org/docs/app/api-reference/components/font
- https://nextjs.org/docs/app/api-reference/config/eslint
- https://nextjs.org/docs/app/api-reference/config/typescript
- https://nextjs.org/docs/app/api-reference/config/next-config-js/useTypeScriptCli
- https://nextjs.org/docs/app/api-reference/turbopack
- https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack
- https://raw.githubusercontent.com/vercel/next.js/v16.3.4/packages/create-next-app/templates/index.ts
- https://raw.githubusercontent.com/vercel/next.js/v16.3.4/packages/create-next-app/templates/app-tw/ts/tsconfig.json
- https://raw.githubusercontent.com/vercel/next.js/v16.3.4/packages/create-next-app/templates/app-tw/ts/app/globals.css
- https://raw.githubusercontent.com/vercel/next.js/v16.3.4/packages/create-next-app/templates/app-tw/ts/app/layout.tsx
- https://raw.githubusercontent.com/vercel/next.js/v16.3.4/packages/create-next-app/templates/app-tw/ts/next.config.ts
- https://raw.githubusercontent.com/vercel/next.js/v16.3.4/packages/create-next-app/templates/app-tw/ts/eslint.config.mjs
- https://raw.githubusercontent.com/vercel/next.js/v16.3.4/packages/create-next-app/templates/app-tw/ts/postcss.config.mjs
- https://tailwindcss.com/docs/theme
- https://tailwindcss.com/docs/functions-and-directives
- https://tailwindcss.com/docs/installation/framework-guides/nextjs
- https://tailwindcss.com/blog/tailwindcss-v4-3
- https://motion.dev/docs/react-upgrade-guide
- https://motion.dev/docs/react-animate-presence
- https://motion.dev/docs/react-transitions
- https://motion.dev/docs/react-layout-animations
- https://motion.dev/docs/react-accessibility
- https://motion.dev/docs/react-use-reduced-motion
- https://raw.githubusercontent.com/motiondivision/motion/main/CHANGELOG.md
- https://raw.githubusercontent.com/catdad/canvas-confetti/master/README.md
- https://lucide.dev/guide/react/getting-started
- https://lucide.dev/guide/version-1
- https://lucide.dev/guide/react/migration
- https://www.infoq.com/news/2026/06/lucide-v1-icons/
- https://upstash.com/docs/redis/sdks/ts/getstarted
- https://upstash.com/docs/redis/sdks/ts/pipelining/pipeline-transaction
- https://upstash.com/docs/redis/sdks/ts/pipelining/auto-pipeline
- https://upstash.com/docs/redis/quickstarts/vercel-functions-app-router
- https://upstash.com/docs/redis/overall/pricing
- https://upstash.com/pricing/redis
- https://upstash.com/docs/redis/help/faq
- https://upstash.com/docs/redis/troubleshooting/max_request_size_exceeded
- https://upstash.com/blog/redis-new-pricing
- https://upstash.com/blog/lua-scripting-on-upstash-redis-atomic-operations-over-http
- https://vercel.com/marketplace/upstash/upstash-kv
- https://vercel.com/docs/redis
- https://vercel.com/docs/limits
- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/functions/limitations
- https://vercel.com/docs/functions/usage-and-pricing
- https://vercel.com/docs/pricing
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- https://deploywise.dev/blog/vercel-free-tier-limits-2026
- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- https://github.com/typescript-eslint/typescript-eslint/issues/12518
- https://loke.dev/writing/typescript-7-typescript-eslint-side-by-side
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
- https://caniuse.com/mdn-api_navigator_vibrate
- https://caniuse.com/mdn-api_audiosession
- https://developer.mozilla.org/en-US/docs/Web/API/AudioSession
- https://nattog.dev/blog/web-audio-ios-unmute
- https://github.com/feross/unmute-ios-audio
- https://bugs.webkit.org/show_bug.cgi?id=237322
- https://webkit.org/blog/18162/release-notes-for-safari-technology-preview-248/
- npm registry: npm view next/react/tailwindcss/motion/lucide-react/@upstash/redis/typescript/eslint-config-next/babel-plugin-react-compiler/@types/node (2026-09-03)
- npm tarball inspection: @upstash/redis@1.38.3 nodejs.mjs (Redis.fromEnv), lucide-react@1.40.0 dist/lucide-react.d.ts + dist/esm/Icon.mjs, motion@13.2.0 + framer-motion@13.2.0 + motion-dom@13.2.0 index.d.ts, @types/canvas-confetti@1.9.0 index.d.ts