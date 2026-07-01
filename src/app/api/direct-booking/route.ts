import { NextResponse } from "next/server";

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

  const parsed = parseDirectBooking(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Validation failed", details: parsed.errors }, { status: 422 });
  }

  const result = await submitDirectBooking(parsed.value);
  return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
}
