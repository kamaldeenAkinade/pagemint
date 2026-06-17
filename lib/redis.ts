import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let initError: unknown = null;

// Vercel's Upstash marketplace integration sometimes injects the legacy
// KV_REST_API_* names instead of UPSTASH_REDIS_REST_*, depending on how the
// database was provisioned. Accept either.
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

try {
  if (url && token) {
    redis = new Redis({ url, token });
  } else {
    initError = new Error("Missing Upstash Redis environment variables.");
  }
} catch (err) {
  initError = err;
}

if (initError) {
  console.error("PageMint: failed to initialise Redis client.", initError);
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error("REDIS_UNAVAILABLE");
  }
  return redis;
}

export type PageRecord = {
  html: string;
  editToken: string;
  createdAt: number;
  updatedAt: number;
};
