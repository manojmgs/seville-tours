import type {
  BookingDate,
  BookingExperience,
  BookingSlot,
  CustomerTypeOption,
  PerPaxField,
  SlotLiveCapacity,
} from "./types";

/**
 * Live (display-only) FareHarbor booking data.
 *
 * Reads FareHarbor's public, un-keyed endpoints to assemble an interactive
 * booking surface: real upcoming dates/times and real per-person prices. This is
 * NOT the sanctioned partner API — it never holds a seat, never takes payment, and
 * every consumer must label results "subject to confirmation". Actual booking is
 * owned by FareHarbor's hosted flow or by Carlos's manual confirmation.
 *
 * The official FareHarbor External API (key + partner agreement) will later replace
 * the read/quote path with an authenticated equivalent without changing this shape.
 */

const FAREHARBOR_API_BASE = "https://fareharbor.com/api/v1";
const FAREHARBOR_EMBED_BASE = "https://fareharbor.com/api/embed";
const FAREHARBOR_HOSTED_BASE = "https://fareharbor.com";
const COMPANY_SHORTNAME = "sevilletoursco";

/**
 * Total-sheet id used for public price previews. Verified to resolve per-item
 * pricing across the account; overridable for safety if FareHarbor changes it.
 */
const PRICING_TOTAL_SHEET_ID = process.env.FAREHARBOR_TOTAL_SHEET_ID ?? "604405";

/** Booking data should be fresh; cache briefly to stay near-real-time without hammering. */
const BOOKING_REVALIDATE_SECONDS = 60;

/** Number of months (including the current one) to surface in the calendar picker. */
const DEFAULT_MONTHS_AHEAD = 3;

/** How many leading bookable dates to probe when anchoring pricing. */
const REFERENCE_PROBE_LIMIT = 3;

/** Extracts the FareHarbor item id embedded in a tour booking URL (`/items/{id}/`). */
export function extractFareHarborItemId(bookingUrl?: string): string | null {
  if (!bookingUrl) return null;
  const match = bookingUrl.match(/\/items\/(\d+)\//);
  return match ? match[1] : null;
}

type DateListResponse = {
  availabilities: Array<{
    pk: number;
    start_at: string;
    end_at: string;
    is_bookable: boolean;
    is_sold_out: boolean;
    approximate_available_capacity: number | null;
    book_url: string;
  }>;
};

type CalendarDay = {
  month: "current" | "other";
  at: string;
  is_bookable: boolean;
};

type CalendarResponse = {
  calendar: { weeks: Array<{ days: CalendarDay[] }> };
};

/** Single-call embed catalog: customer-type labels, age notes, and all-in prices. */
type PricePreviewResponse = {
  items: Array<{
    id: number;
    price: {
      breakdown: {
        customer_types: Array<{
          id: number;
          singular: string;
          note: string | null;
          price: number;
          min_party_size: number;
        }>;
      };
    };
  }>;
  details: { currency: string };
};

/** Resolves which total-price sheet applies to a given availability. */
type EffectiveSheetsResponse = {
  effective_sheets: { total_sheet: { pk: number } | null } | null;
};

type PricingResponse = {
  price_previews: {
    customer_types: Array<{
      customer_type_rate: number;
      total: number;
      booking_fee: number;
    }>;
  };
};

type LiveCapacityResponse = {
  live_capacity: {
    is_bookable: boolean;
    availability_live_bookable_capacity: number | null;
    is_overbooking_availability: boolean;
  };
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: BOOKING_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Returns today's date in Europe/Madrid, the operational booking timezone. */
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

/** Returns the current month plus the following ones, for a multi-month calendar. */
function upcomingMonths(
  start: { year: number; month: number },
  count: number,
): Array<{ year: number; month: number }> {
  const months = [{ year: start.year, month: start.month }];
  for (let index = 1; index < count; index += 1) {
    const previous = months[index - 1];
    months.push(nextMonth(previous.year, previous.month));
  }
  return months;
}

function calendarUrl(itemId: string, year: number, month: number): string {
  const padded = String(month).padStart(2, "0");
  return `${FAREHARBOR_API_BASE}/companies/${COMPANY_SHORTNAME}/items/${itemId}/calendar/${year}/${padded}/`;
}

function dateListUrl(itemId: string, date: string): string {
  return `${FAREHARBOR_API_BASE}/companies/${COMPANY_SHORTNAME}/items/${itemId}/availabilities/date/${date}/`;
}

function pricingUrl(totalSheetId: string, availabilityId: number): string {
  const params = new URLSearchParams({
    include_whole_booking_percentage_custom_fields: "no",
    include_whole_booking_offset_custom_fields: "no",
    include_customer_custom_fields: "no",
    // Excluding the booking fee yields the exact fee-free base price (the marketed
    // rate); the fee is still returned separately for the "book direct" value prop.
    include_booking_fee: "no",
    include_taxes: "yes",
  });
  return `${FAREHARBOR_API_BASE}/companies/${COMPANY_SHORTNAME}/total-sheets/${totalSheetId}/pricing/availabilities/${availabilityId}/?${params.toString()}`;
}

/** Embed price-preview: one call for the customer-type catalog + all-in prices. */
function pricePreviewUrl(itemId: string, date: string): string {
  const params = new URLSearchParams({
    date,
    item_pks: itemId,
    include_breakdown: "yes",
  });
  return `${FAREHARBOR_EMBED_BASE}/${COMPANY_SHORTNAME}/price-preview/per-item/v2/?${params.toString()}`;
}

function effectiveSheetsUrl(availabilityId: number): string {
  return `${FAREHARBOR_API_BASE}/companies/${COMPANY_SHORTNAME}/availabilities/${availabilityId}/effective-sheets/`;
}

function liveCapacityUrl(itemId: string, availabilityId: number): string {
  const params = new URLSearchParams({
    customer_type_rate_counts: "{}",
    is_flyout: "no",
    total_sheet: PRICING_TOTAL_SHEET_ID,
  });
  return `${FAREHARBOR_API_BASE}/companies/${COMPANY_SHORTNAME}/items/${itemId}/availabilities/${availabilityId}/live/?${params.toString()}`;
}

/** Collects upcoming bookable ISO dates from a month calendar payload. */
function collectBookableDates(calendar: CalendarResponse | null, fromIso: string): string[] {
  if (!calendar) return [];
  const dates: string[] = [];
  for (const week of calendar.calendar.weeks) {
    for (const day of week.days) {
      if (day.month !== "current") continue;
      if (!day.is_bookable) continue;
      if (day.at < fromIso) continue;
      dates.push(day.at);
    }
  }
  return dates;
}

/** Maps a single-date availability list into normalized, bookable slots. */
function toBookingDate(itemId: string, date: string, list: DateListResponse | null): BookingDate | null {
  if (!list || list.availabilities.length === 0) return null;

  const slots: BookingSlot[] = list.availabilities
    .filter((availability) => availability.is_bookable && !availability.is_sold_out)
    .map((availability) => ({
      availabilityId: availability.pk,
      startAt: availability.start_at,
      endAt: availability.end_at,
      remainingCapacity:
        typeof availability.approximate_available_capacity === "number" &&
        availability.approximate_available_capacity > 0
          ? availability.approximate_available_capacity
          : null,
      bookUrl: `${FAREHARBOR_HOSTED_BASE}/${COMPANY_SHORTNAME}/items/${itemId}/availability/${availability.pk}/book/`,
    }));

  if (slots.length === 0) return null;
  return { date, slots };
}

/**
 * Resolves the total-price sheet that applies to an availability, so pricing stays
 * correct even if the account's online sheet changes. Falls back to the configured
 * default when the upstream lookup is unavailable.
 */
async function resolveTotalSheetId(availabilityId: number): Promise<string> {
  const data = await fetchJson<EffectiveSheetsResponse>(effectiveSheetsUrl(availabilityId));
  const pk = data?.effective_sheets?.total_sheet?.pk;
  return pk ? String(pk) : PRICING_TOTAL_SHEET_ID;
}

/**
 * Builds the customer-type catalog from the embed price-preview (rich labels, age
 * notes, currency) joined to the total-sheet pricing for the fee-free base price.
 *
 * The two sources are joined by all-in price (base + booking fee equals the
 * preview's price). Equal-priced types share an identical base/fee, so a price
 * collision is harmless. Prices are stable per item, so this is fetched once.
 */
function mapCustomerTypes(
  itemId: string,
  preview: PricePreviewResponse | null,
  pricing: PricingResponse | null,
): { currency: string; customerTypes: CustomerTypeOption[] } {
  const previewItem =
    preview?.items.find((entry) => String(entry.id) === itemId) ?? preview?.items[0];
  const previewTypes = previewItem?.price.breakdown.customer_types ?? [];

  // all-in price (cents) -> fee-free base + booking fee, from the total-sheet.
  const splitByAllIn = new Map<number, { base: number; fee: number }>();
  for (const entry of pricing?.price_previews.customer_types ?? []) {
    splitByAllIn.set(entry.total + entry.booking_fee, {
      base: entry.total,
      fee: entry.booking_fee,
    });
  }

  const customerTypes: CustomerTypeOption[] = previewTypes.map((type) => {
    const split = splitByAllIn.get(type.price);
    return {
      rateId: type.id,
      label: type.singular,
      ageNote: type.note?.trim() ?? "",
      basePriceCents: split?.base ?? type.price,
      bookingFeeCents: split?.fee ?? 0,
    };
  });

  return {
    currency: preview?.details.currency ?? "EUR",
    customerTypes,
  };
}

/** Per-pax inputs the Alcázar (and similar monument tours) require at booking time. */
function defaultPerPaxFields(): PerPaxField[] {
  return [
    { key: "pax-name", title: "Pax Name", description: "Please insert your complete name." },
    {
      key: "pax-id",
      title: "ID or Passport No.",
      description: "Mandatory requirement by the monument.",
    },
  ];
}

/**
 * Assembles the live booking experience for a FareHarbor item: the upcoming
 * bookable dates for the calendar picker, the customer-type catalog, and real
 * per-person prices. Time slots for a chosen date load on demand via
 * {@link getDateSlots}. Returns null for non-FareHarbor input or when the upstream
 * API is unavailable.
 */
export async function getBookingExperience(
  itemIdOrBookingUrl: string,
  monthsAhead: number = DEFAULT_MONTHS_AHEAD,
): Promise<BookingExperience | null> {
  const itemId = /^\d+$/.test(itemIdOrBookingUrl)
    ? itemIdOrBookingUrl
    : extractFareHarborItemId(itemIdOrBookingUrl);
  if (!itemId) return null;

  const today = madridToday();
  const months = upcomingMonths(today, monthsAhead);

  const calendars = await Promise.all(
    months.map((month) => fetchJson<CalendarResponse>(calendarUrl(itemId, month.year, month.month))),
  );

  const bookableDates = calendars.flatMap((calendar) =>
    collectBookableDates(calendar, today.iso),
  );

  if (bookableDates.length === 0) return null;

  // One real slot is needed to anchor pricing; probe the first few dates for it.
  const reference = await findReferenceAvailability(itemId, bookableDates);
  if (!reference) return null;

  // Catalog (preview) needs no sheet, so fetch it alongside the sheet resolution;
  // pricing then uses the resolved sheet for the exact fee-free base price.
  const [preview, totalSheetId] = await Promise.all([
    fetchJson<PricePreviewResponse>(pricePreviewUrl(itemId, reference.date)),
    resolveTotalSheetId(reference.availabilityId),
  ]);
  const pricing = await fetchJson<PricingResponse>(
    pricingUrl(totalSheetId, reference.availabilityId),
  );
  const { currency, customerTypes } = mapCustomerTypes(itemId, preview, pricing);

  return {
    itemId,
    currency,
    bookableDates,
    customerTypes,
    perPaxFields: defaultPerPaxFields(),
  };
}

/**
 * Loads the time slots for a single chosen date, on demand. Returns null when the
 * date has no bookable slots or the upstream API is unavailable.
 */
export async function getDateSlots(itemId: string, date: string): Promise<BookingDate | null> {
  const list = await fetchJson<DateListResponse>(dateListUrl(itemId, date));
  return toBookingDate(itemId, date, list);
}

/** Probes the first few bookable dates for one real slot to anchor pricing. */
async function findReferenceAvailability(
  itemId: string,
  dates: string[],
): Promise<{ availabilityId: number; date: string } | null> {
  for (const date of dates.slice(0, REFERENCE_PROBE_LIMIT)) {
    const list = await fetchJson<DateListResponse>(dateListUrl(itemId, date));
    const slot = list?.availabilities.find(
      (availability) => availability.is_bookable && !availability.is_sold_out,
    );
    if (slot) return { availabilityId: slot.pk, date };
  }
  return null;
}

/**
 * Reads real-time bookable capacity for a single slot from FareHarbor's live
 * endpoint. Fetched fresh (no cache) so the displayed "spots left" reflects the
 * current moment. Still display-only and "subject to confirmation".
 */
export async function getSlotLiveCapacity(
  itemId: string,
  availabilityId: number,
): Promise<SlotLiveCapacity | null> {
  let live: LiveCapacityResponse | null = null;
  try {
    const response = await fetch(liveCapacityUrl(itemId, availabilityId), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (response.ok) {
      live = (await response.json()) as LiveCapacityResponse;
    }
  } catch {
    live = null;
  }

  if (!live) return null;

  const capacity = live.live_capacity;
  const remainingCapacity = Math.max(capacity.availability_live_bookable_capacity ?? 0, 0);
  const isBookable = capacity.is_bookable && remainingCapacity > 0;

  return {
    availabilityId,
    remainingCapacity,
    isBookable,
    isSoldOut: !isBookable,
  };
}
