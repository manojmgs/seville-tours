import { NextResponse } from "next/server";
import { getBookingEngine } from "@/lib/booking-engine";

/**
 * Read-only proxy for the time slots of a single chosen date.
 *
 * GET /api/fareharbor/slots?itemId=577856&date=2026-07-04
 *
 * Display-only: never holds a seat, never takes payment, always "subject to
 * confirmation". The item id is validated as an integer and the date as a strict
 * ISO calendar date, so no user-controlled value reaches the upstream unvalidated.
 */

const ITEM_ID_PATTERN = /^\d{1,12}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const itemId = params.get("itemId")?.trim() ?? "";
  const date = params.get("date")?.trim() ?? "";

  if (!ITEM_ID_PATTERN.test(itemId) || !DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "Invalid itemId or date" }, { status: 400 });
  }

  const slots = await getBookingEngine().getDateSlots(itemId, date);

  if (!slots) {
    return NextResponse.json({ error: "No slots" }, { status: 404 });
  }

  return NextResponse.json(slots, {
    headers: {
      // Near-real-time: brief edge/browser cache with background revalidation.
      "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
