import { NextResponse } from "next/server";

import { redeemParaUstedVoucher } from "@/lib/parausted/partner-redeem";

/**
 * ParaUsted voucher redemption (server-to-server).
 *
 * POST /api/parausted/redeem  body: { "code": "PU-XXXX-XXXX-XXXX", "notes"?: "..." }
 *
 * The ParaUsted partner bearer token is read server-side only; it is never sent to
 * the browser. Returns the typed redemption result; the client maps `error` keys to
 * localized copy and formats EUR from integer cents.
 */

export const runtime = "nodejs";

const MAX_NOTES_LENGTH = 500;

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const rawCode = (body as { code?: unknown })?.code;
  if (typeof rawCode !== "string" || rawCode.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: "invalid_code" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const rawNotes = (body as { notes?: unknown })?.notes;
  const notes =
    typeof rawNotes === "string" ? rawNotes.slice(0, MAX_NOTES_LENGTH) : undefined;

  const result = await redeemParaUstedVoucher(rawCode, notes);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 422,
    headers: { "Cache-Control": "no-store" },
  });
}
