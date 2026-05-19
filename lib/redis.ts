import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (redis) return redis;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis environment variables. Expected KV_REST_API_URL and KV_REST_API_TOKEN."
    );
  }

  redis = new Redis({ url, token });
  return redis;
}
