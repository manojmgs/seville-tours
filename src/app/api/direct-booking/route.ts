import { NextResponse } from "next/server";

import { clientIdentifier, createFixedWindowRateLimiter } from "@/lib/http/rate-limit";
import { parseDirectBooking, submitDirectBooking } from "@/lib/direct-booking";

/**
 * Direct-booking (non-card) request endpoint.
 *
 * POST /api/direct-booking
 *
 * Validates a manual booking request (Bizum / cash / bank / gift) and notifies the
 * operator by email. It holds no inventory, takes no card data, and is not a confirmed
 * booking. The client also opens WhatsApp as the guaranteed hand-off; card payments
 * are handled separately by Stripe Checkout.
 */

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

  const parsed = parseDirectBooking(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Validation failed", details: parsed.errors }, { status: 422 });
  }

  const result = await submitDirectBooking(parsed.value);
  return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
}
