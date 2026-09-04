/**
 * Anonymous statistics store (server-only).
 *
 * Two implementations behind one interface:
 *   - RedisStore  : Upstash Redis, used whenever Redis env vars are configured.
 *   - MemoryStore : process-local fallback for `next dev` when Redis is absent.
 *
 * Redis key schema (prefix `hq:`):
 *   hq:total        STRING  total completed attempts                  (INCR)
 *   hq:scores       HASH    field <score 0-10>       -> count         (HINCRBY)
 *   hq:qopts        HASH    field "<q>:<opt>"        -> count         (HINCRBY)
 *                           q = 0-based question index, opt = canonical option index
 *   hq:daily        HASH    field "YYYY-MM-DD" (UTC) -> count         (HINCRBY)
 *   hq:submissions  LIST    newest first, compact JSON per attempt    (LPUSH + LTRIM 0 49999)
 *                           {"t":"<ISO>","s":<score>,"a":[10 ints],"d":<ms|null>}
 *   hq:rl:<key>     STRING  rate-limit counter, TTL = window          (SET NX EX + INCR)
 *
 * Nothing personal is ever written: no IPs, no user agents, no cookies.
 */

import type { Redis } from "@upstash/redis";
import { QUESTION_COUNT } from "@/data/questions";
import { getRedis } from "./redis";

export const KEY_PREFIX = "hq:";
export const KEYS = {
  total: `${KEY_PREFIX}total`,
  scores: `${KEY_PREFIX}scores`,
  qopts: `${KEY_PREFIX}qopts`,
  daily: `${KEY_PREFIX}daily`,
  submissions: `${KEY_PREFIX}submissions`,
  rateLimitPrefix: `${KEY_PREFIX}rl:`,
} as const;

export const OPTIONS_PER_QUESTION = 4;
/** Score buckets 0..10 inclusive. */
export const SCORE_BUCKETS = QUESTION_COUNT + 1;
/** Hard cap on retained raw submissions (LTRIM) and on CSV export size. */
export const MAX_SUBMISSIONS = 50_000;
/** Page size used when reading the whole submissions list. */
export const LRANGE_CHUNK = 1_000;

/** Compact per-attempt record as stored in `hq:submissions`. */
export interface RawSubmission {
  /** ISO-8601 UTC timestamp of the attempt. */
  t: string;
  /** Server-computed score, 0-10. */
  s: number;
  /** Canonical option index chosen per question (length 10). */
  a: number[];
  /** Duration in milliseconds, or null when the client did not report one. */
  d: number | null;
}

export interface RecordAttemptInput {
  answers: number[];
  score: number;
  durationMs?: number;
  timestamp: Date;
}

export interface Aggregates {
  total: number;
  /** scoreCounts[s] = attempts that scored exactly s (length 11). */
  scoreCounts: number[];
  /** optionCounts[q][opt] = times canonical option `opt` was chosen for question q (10 x 4). */
  optionCounts: number[][];
}

export interface DailyCount {
  /** YYYY-MM-DD (UTC) */
  date: string;
  count: number;
}

export interface StatsStore {
  recordAttempt(input: RecordAttemptInput): Promise<void>;
  readAggregates(): Promise<Aggregates>;
  /** Counts for the last `days` UTC days, oldest first, zero-filled. */
  readDaily(days: number): Promise<DailyCount[]>;
  /** Most recent submissions, newest first. */
  readRecent(limit: number): Promise<RawSubmission[]>;
  /** Every retained submission (<= MAX_SUBMISSIONS), newest first. */
  readAll(): Promise<RawSubmission[]>;
  /** Fixed-window limiter. Returns true when the request is allowed. */
  checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean>;
}

/* ------------------------------------------------------------------------ */
/* Shared helpers                                                            */
/* ------------------------------------------------------------------------ */

/** Minute precision only: a coarse timestamp cannot be joined against request logs. */
function truncateToMinute(date: Date): Date {
  return new Date(Math.floor(date.getTime() / 60_000) * 60_000);
}

/** UTC calendar day for a timestamp, as YYYY-MM-DD. */
export function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The last `days` UTC dates ending today, oldest first. */
export function lastUtcDates(days: number, now: Date = new Date()): string[] {
  const n = Math.max(0, Math.floor(days));
  const dayMs = 86_400_000;
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(todayUtc - i * dayMs).toISOString().slice(0, 10));
  }
  return out;
}

export function emptyAggregates(): Aggregates {
  return {
    total: 0,
    scoreCounts: new Array<number>(SCORE_BUCKETS).fill(0),
    optionCounts: Array.from({ length: QUESTION_COUNT }, () =>
      new Array<number>(OPTIONS_PER_QUESTION).fill(0),
    ),
  };
}

/** Normalise a Redis hash value (string or number) to a non-negative integer. */
function toCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function encodeSubmission(input: RecordAttemptInput): string {
  const raw: RawSubmission = {
    t: truncateToMinute(input.timestamp).toISOString(),
    s: input.score,
    a: input.answers.slice(),
    d: typeof input.durationMs === "number" && Number.isFinite(input.durationMs)
      ? Math.round(input.durationMs)
      : null,
  };
  return JSON.stringify(raw);
}

/**
 * Upstash auto-deserialises list items, so a value may arrive already parsed
 * (object) or as the raw JSON string. Accept both; drop anything malformed.
 */
function parseSubmission(value: unknown): RawSubmission | null {
  let obj: unknown = value;
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== "object") return null;
  const r = obj as Record<string, unknown>;
  if (typeof r.t !== "string" || typeof r.s !== "number" || !Array.isArray(r.a)) return null;
  const a = r.a.map((x) => toCount(x));
  const d = typeof r.d === "number" && Number.isFinite(r.d) ? r.d : null;
  return { t: r.t, s: r.s, a, d };
}

function parseSubmissions(values: unknown[]): RawSubmission[] {
  const out: RawSubmission[] = [];
  for (const v of values) {
    const parsed = parseSubmission(v);
    if (parsed) out.push(parsed);
  }
  return out;
}

/* ------------------------------------------------------------------------ */
/* Redis implementation                                                      */
/* ------------------------------------------------------------------------ */

export class RedisStore implements StatsStore {
  constructor(private readonly redis: Redis) {}

  /** 15 commands, ONE HTTP round-trip. */
  async recordAttempt(input: RecordAttemptInput): Promise<void> {
    const p = this.redis.pipeline();
    p.incr(KEYS.total); // 1
    p.hincrby(KEYS.scores, String(input.score), 1); // 1
    for (let q = 0; q < input.answers.length; q++) {
      p.hincrby(KEYS.qopts, `${q}:${input.answers[q]}`, 1); // 10
    }
    p.hincrby(KEYS.daily, utcDateKey(input.timestamp), 1); // 1
    p.lpush(KEYS.submissions, encodeSubmission(input)); // 1
    p.ltrim(KEYS.submissions, 0, MAX_SUBMISSIONS - 1); // 1
    await p.exec();
  }

  /** 3 commands, ONE HTTP round-trip. */
  async readAggregates(): Promise<Aggregates> {
    const [total, scores, qopts] = await this.redis
      .pipeline()
      .get(KEYS.total)
      .hgetall(KEYS.scores)
      .hgetall(KEYS.qopts)
      .exec<[unknown, Record<string, unknown> | null, Record<string, unknown> | null]>();

    const agg = emptyAggregates();
    agg.total = toCount(total);

    if (scores) {
      for (const [field, value] of Object.entries(scores)) {
        const s = Number(field);
        if (Number.isInteger(s) && s >= 0 && s < SCORE_BUCKETS) {
          agg.scoreCounts[s] = toCount(value);
        }
      }
    }

    if (qopts) {
      for (const [field, value] of Object.entries(qopts)) {
        const [qStr, optStr] = field.split(":");
        const q = Number(qStr);
        const opt = Number(optStr);
        if (
          Number.isInteger(q) &&
          Number.isInteger(opt) &&
          q >= 0 &&
          q < QUESTION_COUNT &&
          opt >= 0 &&
          opt < OPTIONS_PER_QUESTION
        ) {
          agg.optionCounts[q][opt] = toCount(value);
        }
      }
    }

    return agg;
  }

  /** 1 command (HMGET with `days` fields). */
  async readDaily(days: number): Promise<DailyCount[]> {
    const dates = lastUtcDates(days);
    if (dates.length === 0) return [];
    const result = await this.redis.hmget<Record<string, unknown>>(KEYS.daily, ...dates);
    return dates.map((date) => ({ date, count: toCount(result?.[date]) }));
  }

  /** 1 command (LRANGE). */
  async readRecent(limit: number): Promise<RawSubmission[]> {
    const n = Math.max(0, Math.min(Math.floor(limit), MAX_SUBMISSIONS));
    if (n === 0) return [];
    const items = await this.redis.lrange<unknown>(KEYS.submissions, 0, n - 1);
    return parseSubmissions(items);
  }

  /** ceil(n / 1000) LRANGE commands, max 50. */
  async readAll(): Promise<RawSubmission[]> {
    const out: RawSubmission[] = [];
    for (let start = 0; start < MAX_SUBMISSIONS; start += LRANGE_CHUNK) {
      const stop = Math.min(start + LRANGE_CHUNK, MAX_SUBMISSIONS) - 1;
      const chunk = await this.redis.lrange<unknown>(KEYS.submissions, start, stop);
      out.push(...parseSubmissions(chunk));
      if (chunk.length < stop - start + 1) break;
    }
    return out;
  }

  /**
   * Fixed window: create the counter with a TTL only if it does not exist
   * (SET NX EX), then INCR. 2 commands, ONE HTTP round-trip.
   */
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const fullKey = `${KEYS.rateLimitPrefix}${key}`;
    // INCR + EXPIRE (always refreshed) is race-free; a key can never be left without a TTL.
    const [count] = await this.redis
      .pipeline()
      .incr(fullKey)
      .expire(fullKey, Math.max(1, Math.floor(windowSeconds)))
      .exec<[number, unknown]>();
    return toCount(count) <= limit;
  }
}

/* ------------------------------------------------------------------------ */
/* In-memory implementation (local development only)                         */
/* ------------------------------------------------------------------------ */

interface RateBucket {
  count: number;
  expiresAt: number;
}

export class MemoryStore implements StatsStore {
  private total = 0;
  private readonly scoreCounts = new Array<number>(SCORE_BUCKETS).fill(0);
  private readonly optionCounts: number[][] = Array.from({ length: QUESTION_COUNT }, () =>
    new Array<number>(OPTIONS_PER_QUESTION).fill(0),
  );
  private readonly daily = new Map<string, number>();
  /** Newest first, capped at MAX_SUBMISSIONS. */
  private submissions: RawSubmission[] = [];
  private readonly rateBuckets = new Map<string, RateBucket>();

  async recordAttempt(input: RecordAttemptInput): Promise<void> {
    this.total += 1;
    if (input.score >= 0 && input.score < SCORE_BUCKETS) this.scoreCounts[input.score] += 1;
    input.answers.forEach((opt, q) => {
      if (q < QUESTION_COUNT && opt >= 0 && opt < OPTIONS_PER_QUESTION) {
        this.optionCounts[q][opt] += 1;
      }
    });
    const day = utcDateKey(input.timestamp);
    this.daily.set(day, (this.daily.get(day) ?? 0) + 1);
    const raw = parseSubmission(encodeSubmission(input));
    if (raw) {
      this.submissions.unshift(raw);
      if (this.submissions.length > MAX_SUBMISSIONS) this.submissions.length = MAX_SUBMISSIONS;
    }
  }

  async readAggregates(): Promise<Aggregates> {
    return {
      total: this.total,
      scoreCounts: this.scoreCounts.slice(),
      optionCounts: this.optionCounts.map((row) => row.slice()),
    };
  }

  async readDaily(days: number): Promise<DailyCount[]> {
    return lastUtcDates(days).map((date) => ({ date, count: this.daily.get(date) ?? 0 }));
  }

  async readRecent(limit: number): Promise<RawSubmission[]> {
    return this.submissions.slice(0, Math.max(0, Math.floor(limit)));
  }

  async readAll(): Promise<RawSubmission[]> {
    return this.submissions.slice(0, MAX_SUBMISSIONS);
  }

  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const now = Date.now();
    // Opportunistic cleanup so the map cannot grow without bound in long dev sessions.
    if (this.rateBuckets.size > 1_000) {
      for (const [k, b] of this.rateBuckets) if (b.expiresAt <= now) this.rateBuckets.delete(k);
    }
    let bucket = this.rateBuckets.get(key);
    if (!bucket || bucket.expiresAt <= now) {
      bucket = { count: 0, expiresAt: now + windowSeconds * 1000 };
      this.rateBuckets.set(key, bucket);
    }
    bucket.count += 1;
    return bucket.count <= limit;
  }
}

/* ------------------------------------------------------------------------ */
/* Factory                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * The dev fallback lives on `globalThis` so it survives Turbopack/HMR module
 * re-evaluation and is shared by every route handler in the dev server.
 */
type GlobalWithMemoryStore = typeof globalThis & {
  __hqMemoryStore?: MemoryStore;
};

let redisStore: RedisStore | null = null;

/**
 * Resolve the active store:
 *   - Redis configured               -> RedisStore
 *   - not configured, NODE_ENV!=prod -> shared MemoryStore (warns once)
 *   - not configured, production     -> null (stats disabled, quiz still works)
 */
export function getStore(): StatsStore | null {
  const redis = getRedis();
  if (redis) {
    if (!redisStore) redisStore = new RedisStore(redis);
    return redisStore;
  }

  if (process.env.NODE_ENV !== "production") {
    const g = globalThis as GlobalWithMemoryStore;
    if (!g.__hqMemoryStore) {
      g.__hqMemoryStore = new MemoryStore();
      console.warn(
        "[hiv-quiz] No Redis configured - quiz stats are stored IN MEMORY for local dev only " +
          "and reset on server restart. Set UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN " +
          "(or KV_REST_API_URL/KV_REST_API_TOKEN) to persist them.",
      );
    }
    return g.__hqMemoryStore;
  }

  return null;
}
