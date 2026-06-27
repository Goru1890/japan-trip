import { Redis } from "@upstash/redis";

/**
 * Returns an Upstash Redis client if the deployment is configured, else null.
 * This lets the whole app run with no database (localStorage-only) and light
 * up cross-device sync the moment the env vars are present.
 *
 * Set on Vercel via Marketplace → Upstash for Redis (auto-injects these), or
 * manually in Project Settings → Environment Variables.
 */
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Whether cloud sync is wired up on this deployment. */
export function isSyncConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
