import { NextResponse } from "next/server";
import { verifyGiftCard } from "@/lib/parausted/redeem";

/**
 * Gift-card redemption skeleton endpoint (ParaUsted-owned in V1).
 *
 * POST /api/parausted/redeem  body: { "code": "GIFT-1234" }
 *
 * LOCKED V1 boundary: this never transmits the code to ParaUsted, never persists
 * it, and never confirms redemption. It validates shape and returns a "pending"
 * status so Carlos applies the voucher manually. The response shape mirrors the
 * future ParaUsted V2 verification API for a drop-in upgrade later.
 */

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = typeof (body as { code?: unknown })?.code === "string" ? (body as { code: string }).code : "";
  if (!code.trim()) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const result = await verifyGiftCard(code);

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
