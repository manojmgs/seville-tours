import { NextResponse } from "next/server";

import { clientIdentifier, createFixedWindowRateLimiter } from "@/lib/http/rate-limit";
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

// Best-effort, per-instance containment. Uses a spoofing-resistant client id and a
// bounded bucket map; replace with a shared store when running multi-instance.
const rateLimiter = createFixedWindowRateLimiter({ windowMs: 60_000, max: 8 });

export async function POST(request: Request): Promise<NextResponse> {
  const rateLimit = rateLimiter.check(clientIdentifier(request));
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
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
