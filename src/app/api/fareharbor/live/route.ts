import { NextResponse } from "next/server";
import { getSlotLiveCapacity } from "@/lib/fareharbor/booking";

/**
 * Read-only proxy for FareHarbor real-time slot capacity.
 *
 * GET /api/fareharbor/live?itemId=577856&availabilityId=1653762129
 *
 * Display-only: reflects current bookability the moment it is read. It never holds
 * a seat, never takes payment, and remains "subject to confirmation". Both ids are
 * validated as integers, so no user-controlled value reaches the upstream beyond a
 * validated number.
 */

const ID_PATTERN = /^\d{1,15}$/;

export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const itemId = params.get("itemId")?.trim() ?? "";
  const availabilityId = params.get("availabilityId")?.trim() ?? "";

  if (!ID_PATTERN.test(itemId) || !ID_PATTERN.test(availabilityId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const capacity = await getSlotLiveCapacity(itemId, Number(availabilityId));

  if (!capacity) {
    return NextResponse.json({ error: "Unavailable" }, { status: 404 });
  }

  return NextResponse.json(capacity, {
    headers: {
      // Real-time: do not cache; capacity changes continuously.
      "Cache-Control": "no-store",
    },
  });
}
