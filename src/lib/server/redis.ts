/**
 * Upstash Redis client factory (server-only).
 *
 * Two env-var conventions are supported:
 *   - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN  (Upstash console)
 *   - KV_REST_API_URL / KV_REST_API_TOKEN                (Vercel Marketplace
 *     "Upstash for Redis" integration injects these)
 *
 * Returns null when neither pair is configured so callers can fall back.
 */

import { Redis } from "@upstash/redis";

export interface RedisEnv {
  url: string;
  token: string;
}

/** Resolve the REST credentials from either env-var convention. */
export function getRedisEnv(): RedisEnv | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.trim(), token: token.trim() };
}

export function isRedisConfigured(): boolean {
  return getRedisEnv() !== null;
}

let cachedClient: Redis | null = null;

/**
 * Lazily create (and memoise) a single Redis client for this server instance.
 * The Upstash client is HTTP based, so sharing one instance is safe.
 */
export function getRedis(): Redis | null {
  if (cachedClient) return cachedClient;
  const env = getRedisEnv();
  if (!env) return null;
  cachedClient = new Redis({
    url: env.url,
    token: env.token,
    // Default is true; being explicit because store.ts relies on it (hash values
    // may come back as numbers *or* strings and are normalised with Number()).
    automaticDeserialization: true,
  });
  return cachedClient;
}
