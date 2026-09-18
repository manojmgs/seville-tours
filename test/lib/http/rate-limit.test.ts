import { afterEach, describe, expect, it, vi } from "vitest";

import { clientIdentifier, createFixedWindowRateLimiter } from "@/lib/http/rate-limit";

function requestWith(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/test", { method: "POST", headers });
}

describe("clientIdentifier", () => {
  it("ignores a spoofed leftmost X-Forwarded-For token and uses the last trusted hop", () => {
    const spoofed = requestWith({
      "x-forwarded-for": "1.1.1.1, 203.0.113.9",
    });
    // 1.1.1.1 is attacker-supplied; 203.0.113.9 is the hop the trusted proxy saw.
    expect(clientIdentifier(spoofed)).toBe("203.0.113.9");
  });

  it("prefers the platform x-real-ip header over X-Forwarded-For", () => {
    const request = requestWith({
      "x-real-ip": "198.51.100.7",
      "x-forwarded-for": "1.1.1.1, 203.0.113.9",
    });
    expect(clientIdentifier(request)).toBe("198.51.100.7");
  });

  it("falls back to a single shared bucket when no trusted source is present", () => {
    expect(clientIdentifier(requestWith({}))).toBe("unknown");
  });
});

describe("createFixedWindowRateLimiter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to max hits per window, then blocks", () => {
    const limiter = createFixedWindowRateLimiter({ windowMs: 60_000, max: 3 });
    expect(limiter.check("ip")).toEqual({ limited: false });
    expect(limiter.check("ip")).toEqual({ limited: false });
    expect(limiter.check("ip")).toEqual({ limited: false });
    expect(limiter.check("ip")).toEqual({ limited: true, retryAfterSeconds: 60 });
  });

  it("keeps distinct identifiers in independent buckets", () => {
    const limiter = createFixedWindowRateLimiter({ windowMs: 60_000, max: 1 });
    expect(limiter.check("a")).toEqual({ limited: false });
    expect(limiter.check("a")).toEqual({ limited: true, retryAfterSeconds: 60 });
    expect(limiter.check("b")).toEqual({ limited: false });
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    const limiter = createFixedWindowRateLimiter({ windowMs: 1_000, max: 1 });
    expect(limiter.check("ip")).toEqual({ limited: false });
    expect(limiter.check("ip")).toEqual({ limited: true, retryAfterSeconds: 1 });
    vi.advanceTimersByTime(1_500);
    expect(limiter.check("ip")).toEqual({ limited: false });
  });

  it("reclaims expired buckets so distinct keys cannot grow memory unbounded", () => {
    vi.useFakeTimers();
    const limiter = createFixedWindowRateLimiter({ windowMs: 1_000, max: 1, maxKeys: 2 });
    limiter.check("a");
    vi.advanceTimersByTime(1_500);
    // After expiry, new keys are served and the old bucket is evicted rather than
    // accumulating; "a" is treated as fresh again.
    expect(limiter.check("b")).toEqual({ limited: false });
    expect(limiter.check("c")).toEqual({ limited: false });
    expect(limiter.check("a")).toEqual({ limited: false });
  });

  it("reports the remaining window as integer delta-seconds", () => {
    vi.useFakeTimers();
    const limiter = createFixedWindowRateLimiter({ windowMs: 60_000, max: 1 });
    limiter.check("ip");
    vi.advanceTimersByTime(24_100);

    expect(limiter.check("ip")).toEqual({ limited: true, retryAfterSeconds: 36 });
  });
});
