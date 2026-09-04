# Anonymous statistics & admin dashboard

The quiz records **anonymous, aggregate** results so participants can see how they
compare and the content owner can see which questions people struggle with.

- `POST /api/submit` - records a completed attempt, returns the server-computed
  score, the participant's percentile and the public stats.
- `GET /api/stats` - public aggregate stats (edge-cached for 30 s).
- `/admin` - password-protected dashboard; `GET /api/admin/export` downloads a CSV.

Code lives in `src/lib/server/` (store, stats helpers, auth, rate limiting) and
`src/app/api/**` (route handlers). The shared client/server contract is
`src/lib/types.ts`.

## Privacy statement

Only four things are stored per attempt: **score, timestamp, the canonical
option index chosen for each question, and the time taken**. Nothing else.

- No names, emails, cookies, user agents or device identifiers are ever stored.
- Quiz participants receive **no cookies**. The only cookie in the app is the
  admin session cookie (`hq_admin`, httpOnly) on `/admin`.
- The client IP is used **only** to derive a rate-limit key:
  `sha256(ip + RATE_LIMIT_SALT)`. That hash lives in Redis for at most one hour
  (`hq:rl:*`) and is never written next to a submission or logged.
- The raw submission list is capped at 50,000 rows; older rows are trimmed.
- Answer indices are *canonical* (0 = correct option) regardless of the shuffled
  order shown on screen, so per-option analytics are meaningful and no display
  state is recorded.

## Redis key schema

All keys are prefixed `hq:`.

| Key               | Type   | Contents                                                       | Written by            |
| ----------------- | ------ | -------------------------------------------------------------- | --------------------- |
| `hq:total`        | string | total completed attempts                                       | `INCR`                |
| `hq:scores`       | hash   | field `<score 0-10>` -> count                                  | `HINCRBY`             |
| `hq:qopts`        | hash   | field `<q>:<opt>` -> count (q = 0-based question, opt = 0-3)   | `HINCRBY` x10         |
| `hq:daily`        | hash   | field `YYYY-MM-DD` (UTC) -> count                              | `HINCRBY`             |
| `hq:submissions`  | list   | newest first; `{"t":"<ISO>","s":7,"a":[0,0,0,1,2,0,0,3,0,0],"d":41230}` (`d` may be `null`) | `LPUSH` + `LTRIM 0 49999` |
| `hq:rl:<hash>`    | string | rate-limit counter, TTL = window (1 h submissions, 15 min login) | `SET NX EX` + `INCR` |

Hash values come back from Upstash as strings or numbers depending on
auto-deserialisation; the store normalises everything with `Number()`.

## Redis command budget (Upstash bills per command)

| Operation                              | Commands | HTTP round-trips | Notes                                                        |
| -------------------------------------- | -------- | ---------------- | ------------------------------------------------------------ |
| `POST /api/submit` - rate limit        | 2        | 1                | `SET hq:rl:<hash> 0 NX EX 3600`, `INCR` (one pipeline)       |
| `POST /api/submit` - record attempt    | 15       | 1                | `INCR` + `HINCRBY` (score) + 10x `HINCRBY` (options) + `HINCRBY` (daily) + `LPUSH` + `LTRIM` |
| `POST /api/submit` - read aggregates   | 3        | 1                | `GET hq:total`, `HGETALL hq:scores`, `HGETALL hq:qopts`      |
| **`POST /api/submit` total**           | **20**   | **3**            |                                                              |
| `GET /api/stats`                       | 3        | 1                | same aggregate pipeline; edge cache absorbs repeats          |
| `/admin` dashboard load                | 5        | 3                | aggregates (3) + `HMGET hq:daily <30 dates>` (1) + `LRANGE hq:submissions 0 49` (1) |
| `GET /api/admin/export`                | <= 50    | <= 50            | `LRANGE` in chunks of 1,000 up to 50,000 rows; stops early when the list ends |
| `POST /api/admin/login`                | 2        | 1                | brute-force limiter (10 attempts / 15 min / client)          |

`GET /api/stats` sends `Cache-Control: public, s-maxage=30, stale-while-revalidate=120`,
so on Vercel a traffic spike costs at most one Redis read per 30 s per edge region.
The percentile returned by `/api/submit` excludes the participant's own attempt
(its score bucket is decremented by one before computing), and both the
percentile and public averages are withheld until `MIN_PARTICIPANTS_FOR_STATS`
(5) other participants exist.

## Setup on Vercel + Upstash

1. **Add Redis.** In the Vercel dashboard open your project -> *Storage* ->
   *Create Database* -> **Upstash for Redis** (Marketplace). Accept the free
   tier; pick the region closest to your Vercel function region. Vercel injects
   `KV_REST_API_URL` and `KV_REST_API_TOKEN` (plus a few others we do not use)
   into the project automatically.
   - Alternatively create a database at <https://console.upstash.com>, copy the
     REST URL/token and set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
     yourself. Either naming works; see `.env.example`.
2. **Set `ADMIN_PASSWORD`** (Project -> Settings -> Environment Variables) to a
   long random string, for Production (and Preview if you want the dashboard
   there). Without it `/admin` shows a "not configured" card.
3. **Set `RATE_LIMIT_SALT`** to a random hex string (`openssl rand -hex 32`).
4. Redeploy. Verify with:
   ```bash
   curl -s https://<your-domain>/api/stats
   # -> {"available":false} until 1 attempt exists, then {"available":true,...}
   ```
5. Optional: enable the Upstash *Eviction* setting only if you are happy for
   old `hq:submissions` rows to disappear under memory pressure; the counters
   (`hq:total`, `hq:scores`, `hq:qopts`, `hq:daily`) are tiny.

For local development against the real database run `vercel env pull .env.local`
or copy `.env.example` to `.env.local` and fill in the values.

## Using the dashboard

1. Open `https://<your-domain>/admin` and enter `ADMIN_PASSWORD`.
   The session cookie (`hq_admin`, httpOnly, SameSite=Lax, Secure in production)
   lasts 7 days. Changing the password invalidates all sessions.
2. The dashboard shows: total participants, average and median score, share of
   "Prevention Champions" (9-10), the 0-10 score distribution, per-question
   correct-% with the share of each option, participants per day for the last
   30 days, and the 50 most recent attempts.
3. **Download CSV** (`/api/admin/export`) returns `hiv-quiz-submissions.csv`
   with columns
   `timestamp_iso, score, duration_ms, q1..q10, q1_correct..q10_correct`
   where `qN` is the canonical option index chosen (0 = correct) and
   `qN_correct` is `1`/`0`. It is capped at 50,000 rows (newest first).
4. **Log out** clears the cookie.

The `/admin` page and the export endpoint are `noindex` and never cached.

## Local development without Redis

When no Redis credentials are present and `NODE_ENV !== "production"`,
`getStore()` returns a process-wide in-memory `MemoryStore` (kept on
`globalThis` so it survives hot reloads and is shared by every route in the dev
server). One warning is printed on first use:

```
[hiv-quiz] No Redis configured - quiz stats are stored IN MEMORY for local dev only ...
```

It implements the same interface (aggregates, daily counts, recent list,
rate limits) so `/api/submit`, `/api/stats` and `/admin` all work end to end;
data simply resets when the dev server restarts. In production without Redis
the store is `null`: `/api/submit` still returns the score with
`stats: { available: false, reason: "not_configured" }`, `/api/stats` returns
`{ available: false, reason: "not_configured" }`, and the dashboard shows a
"stats store not configured" card.

## Failure behaviour

- Invalid JSON / payload -> `400 { ok: false, error: "invalid_json" | "invalid_payload" }`.
- Rate limited -> `429 { ok: false, error: "rate_limited" }`.
- Redis error while submitting -> still `200` with the correct score and
  `stats: { available: false, reason: "store_error" }`; the error is logged
  server-side (no request data in the log).
- Redis error on `/api/stats` -> `{ available: false, reason: "store_error" }`
  with `Cache-Control: no-store` so the failure is not cached at the edge.


## Implementation notes

- Submission timestamps are stored at **minute** precision (durations are clamped to 1 h client-side), so a stored row cannot be joined against platform request logs.
- The admin session cookie is a signed, **expiring** token (`<expiresAt>.<HMAC>`, 7 days). Changing `ADMIN_PASSWORD` invalidates every session immediately; logout clears the cookie client-side.
- The submission rate limiter uses `INCR` + `EXPIRE` (refreshed on every hit) so a counter can never be left without a TTL.
- `POST /api/submit` only accepts `application/json` from the same origin (the Origin header must match the request host).
- `GET /api/stats` returns `available: true` even for very small samples; the UI hides averages and percentiles until `MIN_PARTICIPANTS_FOR_STATS` (5) attempts exist.
- Store errors are logged as messages only (never the pipeline body).
