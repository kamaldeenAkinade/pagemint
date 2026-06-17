import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let initError: unknown = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
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
