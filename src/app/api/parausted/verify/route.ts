import { NextResponse } from "next/server";

import { clientIdentifier, createFixedWindowRateLimiter } from "@/lib/http/rate-limit";
import { verifyParaUstedVoucher } from "@/lib/parausted/partner-verify";

/**
 * ParaUsted voucher verification (browser-facing, READ-ONLY).
 *
 * POST /api/parausted/verify  body: { "code": "PU-XXXX-XXXX-XXXX" }
 *
 * The code stays in the request body so it never lands in browser/server access
 * logs via a URL. The server-only partner token is read inside the adapter and is
 * never sent to the browser. This route is advisory: it never redeems, and it
 * returns a single generic result — the caller cannot distinguish provider states
 * (missing / expired / redeemed / cross-tenant all look identical).
 */

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" } as const;

// Best-effort, per-instance containment in front of ParaUsted's authoritative
// per-key limit (verify 120/min). Uses a spoofing-resistant client id and a
// bounded bucket map; it does not coordinate across instances and resets on cold
// start. Replace with a shared store (Redis/Upstash) before relying on it
// across multiple instances.
const rateLimiter = createFixedWindowRateLimiter({ windowMs: 60_000, max: 12 });

const MAX_CODE_LENGTH = 40;

export async function POST(request: Request): Promise<NextResponse> {
  const rateLimit = rateLimiter.check(clientIdentifier(request));
  if (rateLimit.limited) {
    return NextResponse.json(
      { eligible: false },
      {
        status: 429,
        headers: { ...NO_STORE, "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ eligible: false }, { status: 400, headers: NO_STORE });
  }

  const rawCode = (body as { code?: unknown })?.code;
  if (
    typeof rawCode !== "string" ||
    rawCode.trim().length === 0 ||
    rawCode.length > MAX_CODE_LENGTH
  ) {
    return NextResponse.json({ eligible: false }, { status: 400, headers: NO_STORE });
  }

  const result = await verifyParaUstedVoucher(rawCode);

  if (!result.eligible && "rateLimited" in result) {
    return NextResponse.json(
      { eligible: false },
      {
        status: 429,
        headers: { ...NO_STORE, "Retry-After": String(result.retryAfterSeconds) },
      },
    );
  }

  return NextResponse.json(result, { status: 200, headers: NO_STORE });
}
