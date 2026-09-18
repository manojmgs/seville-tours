import "server-only";

/**
 * Shared in-process rate limiting for public API routes.
 *
 * Two hardening goals over the previous inline pattern:
 *
 * 1. Trusted client identity. `X-Forwarded-For` is client-supplied and, on common
 *    proxy setups, upstreams APPEND the real client IP rather than replacing the
 *    header — so the *leftmost* token is attacker-controlled and lets a caller mint
 *    unlimited buckets. We prefer a single-value platform header (`x-real-ip`, set by
 *    the edge and not injectable through it) and otherwise fall back to the LAST
 *    `X-Forwarded-For` hop (the address the nearest trusted proxy actually observed),
 *    never the leftmost.
 *
 * 2. Bounded memory. The bucket map evicts expired entries and enforces a hard key
 *    cap, so a flood of distinct identifiers cannot grow the process heap without
 *    limit on a long-lived server.
 *
 * This remains best-effort, per-instance containment (it does not coordinate across
 * instances and resets on cold start). It is defense-in-depth in front of upstream
 * providers that enforce their own authoritative per-key limits; replace with a
 * shared store (Redis/Upstash) before relying on it across multiple instances.
 *
 * NOTE: the definitive "trusted client IP" header is platform-specific. `x-real-ip`
 * is correct on Vercel; adjust the resolver if you deploy behind a different proxy.
 */

const DEFAULT_MAX_KEYS = 10_000;

/**
 * Resolves a spoofing-resistant client identifier. Never uses the leftmost
 * `X-Forwarded-For` token. Returns `"unknown"` when no trusted source is present
 * (all such callers then share one bucket — fail closed, not open).
 */
export function clientIdentifier(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter((hop) => hop.length > 0);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return "unknown";
}

type Bucket = { count: number; resetAt: number };

export interface RateLimiter {
  /** Records a hit and reports the remaining fixed-window delay when blocked. */
  check(key: string):
    | { limited: false }
    | { limited: true; retryAfterSeconds: number };
}

export type RateLimiterOptions = {
  windowMs: number;
  max: number;
  /** Hard cap on tracked identifiers before eviction kicks in. */
  maxKeys?: number;
};

/**
 * Creates a fixed-window limiter with bounded memory. Each route owns its own
 * instance so limits and buckets stay isolated.
 */
export function createFixedWindowRateLimiter(options: RateLimiterOptions): RateLimiter {
  const { windowMs, max } = options;
  const maxKeys = options.maxKeys ?? DEFAULT_MAX_KEYS;
  const buckets = new Map<string, Bucket>();

  function makeSpace(now: number): void {
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key);
    }
    if (buckets.size < maxKeys) return;
    // Still oversized after removing expired entries: drop the soonest-expiring
    // buckets first (they are closest to being reset anyway).
    const ordered = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    const needed = buckets.size - maxKeys + 1;
    for (let index = 0; index < needed; index += 1) buckets.delete(ordered[index][0]);
  }

  return {
    check(key: string) {
      const now = Date.now();
      const bucket = buckets.get(key);
      if (!bucket || now > bucket.resetAt) {
        if (buckets.size >= maxKeys) makeSpace(now);
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { limited: false };
      }
      bucket.count += 1;
      if (bucket.count <= max) return { limited: false };
      return {
        limited: true,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000)),
      };
    },
  };
}
