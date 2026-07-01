import { NextResponse } from "next/server";

import { createTripInquiry, parseTripInquiry } from "@/lib/trip-inquiry";

/**
 * Trip-inquiry capture endpoint.
 *
 * POST /api/trip-inquiry
 *
 * Validates and persists a concierge lead (with explicit consent), then returns a
 * pre-filled WhatsApp deep link. This never holds inventory, never touches card data,
 * and is not a booking — it is the qualified hand-off before the WhatsApp conversation.
 */

// Fixed-window, in-memory rate limit. Adequate for MVP abuse control; it is per
// instance and resets on cold start. Replace with a shared store when multi-instance.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (isRateLimited(clientKey(request))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseTripInquiry(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Validation failed", details: parsed.errors }, { status: 422 });
  }

  const result = await createTripInquiry(parsed.value);
  return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
}
