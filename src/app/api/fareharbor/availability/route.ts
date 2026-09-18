import { NextResponse } from "next/server";
import { getBookingEngine } from "@/lib/booking-engine";

/**
 * Read-only proxy for FareHarbor live availability + public price previews.
 *
 * GET /api/fareharbor/availability?itemId=577856
 *
 * Display-only: this never holds a seat, never takes payment, and is always
 * "subject to confirmation". Only a numeric FareHarbor item id is accepted, so no
 * user-controlled value reaches the upstream beyond a validated integer.
 */

const ITEM_ID_PATTERN = /^\d{1,12}$/;

export async function GET(request: Request): Promise<NextResponse> {
  const itemId = new URL(request.url).searchParams.get("itemId")?.trim() ?? "";

  if (!ITEM_ID_PATTERN.test(itemId)) {
    return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
  }

  const experience = await getBookingEngine().getBookingExperience(itemId);

  if (!experience) {
    return NextResponse.json({ error: "No availability" }, { status: 404 });
  }

  return NextResponse.json(experience, {
    headers: {
      // Near-real-time: brief edge/browser cache with background revalidation.
      "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
