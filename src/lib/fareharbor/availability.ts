import { cache } from "react";
import type { AvailabilityDate, FareHarborCalendarResponse } from "./types";

/**
 * Read-only FareHarbor availability access.
 *
 * V1 uses FareHarbor's public embed API for DISPLAY-ONLY hints. It is not the
 * sanctioned partner API: no SLA, no held seats, no payment. Every consumer must
 * label results "subject to confirmation". Actual booking is owned by FareHarbor's
 * hosted flow (pay-directly) or by Carlos's manual booking (gift-card redemption).
 *
 * The official FareHarbor External API (key + partner agreement) will later replace
 * the manual booking step with an authenticated write without changing this read path.
 */

const FAREHARBOR_API_BASE = "https://fareharbor.com/api/v1";
const COMPANY_SHORTNAME = "sevilletoursco";

/** Availability shifts more often than static tour content; refresh every 6 hours. */
const AVAILABILITY_REVALIDATE_SECONDS = 60 * 60 * 6;

/** Default number of upcoming dates surfaced in the hint. */
const DEFAULT_MAX_DATES = 6;

/** Extracts the FareHarbor item id embedded in a tour booking URL (`/items/{id}/`). */
export function extractFareHarborItemId(bookingUrl?: string): string | null {
  if (!bookingUrl) return null;
  const match = bookingUrl.match(/\/items\/(\d+)\//);
  return match ? match[1] : null;
}

/** Returns today's date in Europe/Madrid as the operational booking timezone. */
function madridToday(): { year: number; month: number; iso: string } {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [year, month] = iso.split("-").map(Number);
  return { year, month, iso };
}

function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

const fetchMonthCalendar = cache(async (
  itemId: string,
  year: number,
  month: number,
): Promise<FareHarborCalendarResponse | null> => {
  const paddedMonth = String(month).padStart(2, "0");
  const url = `${FAREHARBOR_API_BASE}/companies/${COMPANY_SHORTNAME}/items/${itemId}/calendar/${year}/${paddedMonth}/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: AVAILABILITY_REVALIDATE_SECONDS },
    });

    if (!response.ok) return null;

    return (await response.json()) as FareHarborCalendarResponse;
  } catch {
    return null;
  }
});

function collectBookableDates(
  calendar: FareHarborCalendarResponse | null,
  fromIso: string,
): AvailabilityDate[] {
  if (!calendar) return [];

  const dates: AvailabilityDate[] = [];

  for (const week of calendar.calendar.weeks) {
    for (const day of week.days) {
      // Skip adjacent-month spillover days and anything not bookable or in the past.
      if (day.month !== "current") continue;
      if (!day.is_bookable) continue;
      if (day.at < fromIso) continue;

      dates.push({ date: day.at, slotCount: day.count });
    }
  }

  return dates;
}

/**
 * Returns up to `maxDates` upcoming bookable dates for a FareHarbor-backed tour,
 * derived from its booking URL. Returns an empty array for non-FareHarbor tours or
 * when the upstream API is unavailable, so callers can render nothing gracefully.
 */
export const getTourAvailabilityHint = cache(async (
  bookingUrl: string | undefined,
  maxDates: number = DEFAULT_MAX_DATES,
): Promise<AvailabilityDate[]> => {
  const itemId = extractFareHarborItemId(bookingUrl);
  if (!itemId) return [];

  const today = madridToday();
  const upcoming = nextMonth(today.year, today.month);

  const calendars = await Promise.all([
    fetchMonthCalendar(itemId, today.year, today.month),
    fetchMonthCalendar(itemId, upcoming.year, upcoming.month),
  ]);

  const dates = calendars.flatMap((calendar) => collectBookableDates(calendar, today.iso));
  return dates.slice(0, maxDates);
});
