# HIV Prevention Challenge

A mobile-first, gamified 10-question quiz about HIV prevention, built to be linked from Instagram and TikTok bios. Pastel "sticker" design, a mascot (Pip) that reacts to every answer, streaks/XP, confetti, synthesized sound, share cards, and anonymous aggregate statistics with an admin dashboard.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · `motion` · `canvas-confetti` · `lucide-react` · Upstash Redis (optional)
- **Hosting:** Vercel. Stats need a free Upstash Redis database (Vercel Marketplace). Without it the quiz still works; stats are simply hidden.
- **Privacy:** no names, no emails, no cookies for players. Only score, canonical answers, duration and a timestamp are stored per attempt.

## Flow

`Landing → Start Quiz → 10 questions (one at a time, answers locked on tap) → immediate feedback + "Did you know?" fact → Results (score, tier, average, percentile, share, follow, retake)`

Answer order is shuffled per attempt so "A" is not always correct; stats record the canonical option (0 = correct) so per-option analytics stay meaningful.

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill in what you need (see below)
pnpm dev
```

Open <http://localhost:3000>. Without Redis credentials the stats store is **in-memory** (resets on restart) so you can test the full flow locally. The admin dashboard is at `/admin` when `ADMIN_PASSWORD` is set.

Useful commands:

```bash
pnpm lint          # eslint
pnpm exec tsc --noEmit
pnpm build && pnpm start
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | for stats | Upstash Redis REST credentials. The Vercel Marketplace integration injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` instead — both pairs are supported. |
| `ADMIN_PASSWORD` | for `/admin` | Shared password for the stats dashboard and CSV export. Use a long random string. |
| `RATE_LIMIT_SALT` | recommended | Secret mixed into the hashed-IP rate-limit key (20 submissions / hour / client). IPs are never stored. |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Canonical origin, e.g. `https://quiz.example.org`. Used for share links and Open Graph images. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | yes | Full profile URL for the "Follow us on Instagram" button. |
| `NEXT_PUBLIC_TIKTOK_URL` | yes | Full profile URL for the "Follow us on TikTok" button. |
| `NEXT_PUBLIC_RESOURCES_URL` | optional | "Find services near you" link in the footer disclaimer. |
| `NEXT_PUBLIC_ORG_NAME` | optional | Organisation name shown in the results footer (neutral by default). |

See [`.env.example`](.env.example) and [`docs/STATS.md`](docs/STATS.md) for details.

## Deploying to Vercel

1. Push this repository to GitHub/GitLab and import it in Vercel (framework preset: Next.js, package manager: pnpm).
2. In the Vercel project go to **Storage → Marketplace → Upstash for Redis** and create a free database; it injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically. Pick the region closest to your Vercel function region.
3. Add the remaining env vars under **Settings → Environment Variables** (`ADMIN_PASSWORD`, `RATE_LIMIT_SALT`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_TIKTOK_URL`).
4. Deploy. Add your subdomain under **Settings → Domains** and set `NEXT_PUBLIC_SITE_URL` to it (then redeploy so share links use it).
5. Open `/admin`, log in, take the quiz once and confirm the participant count increments.

## Testing notes

- The quiz reducer and stats helpers are pure functions (see `src/lib/quiz-state.ts`, `src/lib/server/stats.ts`) and can be exercised without a browser.
- For browser automation, set `localStorage.setItem("hq:skipAnimations", "1")` before loading the page: every motion animation then completes instantly, so screen transitions can be driven with synthetic clicks. Clear `sessionStorage` to reset an in-progress attempt.
- Without Redis credentials the stats store is in-memory, so the results screen shows the "first players" tile until five attempts have been recorded in the same server process.

## Project layout

```
src/
  app/                 App Router: page, layout, /admin, /api/*, /s/[score] share pages + OG image
  components/          Screens (Landing, QuestionScreen, Results), Pip mascot, UI primitives
  data/questions.ts    The 10 questions (verbatim content), tiers
  hooks/               useQuiz (state machine + sessionStorage), useStats, useSettings
  lib/                 quiz-state (pure reducer), copy (all strings), sound, haptics, share,
                       story-card, stickers, celebrations, config, server/ (Redis store, stats)
docs/
  DESIGN.md            Full design spec (tokens, motion, sound, copy, a11y)
  STATS.md             Data model, Redis command budget, privacy, admin
```

## Content

All quiz text lives in `src/data/questions.ts` and UI strings in `src/lib/copy.ts`. Editing either requires no other changes.

## Accessibility

Ink-on-pastel contrast ≥ 10:1 for body text, 48 px tap targets, every answer state carries an icon and a word (never colour alone), `aria-live` announcements decoupled from animation, `prefers-reduced-motion` respected plus an in-page toggle, sound off/on toggle, iOS silent switch respected.
