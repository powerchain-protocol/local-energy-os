export interface RateLimitRule {
  id: string;
  limit: number;
  windowMs: number;
}
export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs: number;
}
interface Bucket { timestamps: number[] }

/** In-memory sliding-window limiter. Production adapters can implement Redis using the same decision contract. */
export class SlidingWindowRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  check(key: string, rule: RateLimitRule, now = Date.now()): RateLimitDecision {
    const bucketKey = `${rule.id}:${key}`;
    const bucket = this.buckets.get(bucketKey) ?? { timestamps: [] };
    const cutoff = now - rule.windowMs;
    bucket.timestamps = bucket.timestamps.filter((timestamp) => timestamp > cutoff);
    const allowed = bucket.timestamps.length < rule.limit;
    if (allowed) bucket.timestamps.push(now);
    this.buckets.set(bucketKey, bucket);
    const oldest = bucket.timestamps[0] ?? now;
    const resetAtMs = oldest + rule.windowMs;
    return {
      allowed,
      remaining: Math.max(0, rule.limit - bucket.timestamps.length),
      resetAt: new Date(resetAtMs),
      retryAfterMs: allowed ? 0 : Math.max(0, resetAtMs - now),
    };
  }
  clear(key?: string) {
    if (!key) this.buckets.clear();
    else for (const bucketKey of this.buckets.keys()) if (bucketKey.endsWith(`:${key}`)) this.buckets.delete(bucketKey);
  }
}

export const RATE_LIMITS = {
  publicRead: { id: "public-read", limit: 120, windowMs: 60_000 },
  tenantRead: { id: "tenant-read", limit: 600, windowMs: 60_000 },
  mutation: { id: "mutation", limit: 120, windowMs: 60_000 },
  sensitiveMutation: { id: "sensitive-mutation", limit: 30, windowMs: 60_000 },
  oracle: { id: "oracle", limit: 60, windowMs: 60_000 },
  apiKeyCreate: { id: "api-key-create", limit: 10, windowMs: 60_000 },
} satisfies Record<string, RateLimitRule>;
