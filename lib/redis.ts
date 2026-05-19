import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  return { url, token };
}

export function getRedis(): Redis {
  if (redis) return redis;

  const { url, token } = getRedisConfig();
  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis environment variables. Expected UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN or KV_REST_API_URL/KV_REST_API_TOKEN."
    );
  }

  redis = new Redis({ url, token });
  return redis;
}
