import { cache } from "react";

import type { BookingEngineConfig } from "../../config";
import { fetchJson } from "../../http";
import type { BookingProvider } from "../../provider";
import { operatorToday, upcomingMonths } from "../../time";
import type {
  AvailabilityDate,
  BookingDate,
  BookingExperience,
  BookingSlot,
  CustomerTypeOption,
  PerPaxField,
  SlotLiveCapacity,
} from "../../types";
import type {
  CalendarResponse,
  DateListResponse,
  EffectiveSheetsResponse,
  LiveCapacityResponse,
  PricePreviewResponse,
  PricingResponse,
} from "./raw-types";
import {
  calendarUrl,
  dateListUrl,
  effectiveSheetsUrl,
  liveCapacityUrl,
  pricePreviewUrl,
  pricingUrl,
  slotBookUrl,
} from "./urls";

/**
 * FareHarbor booking provider adapter.
 *
 * Reads FareHarbor's public, un-keyed endpoints to assemble a DISPLAY-ONLY booking
 * surface: real upcoming dates/times and real per-person prices. It never holds a
 * seat, never takes payment, and every result is "subject to confirmation". Actual
 * booking is owned by FareHarbor's hosted flow or the operator's manual confirmation.
 *
 * Perf model:
 *  - availability (calendars, date lists) uses a short TTL — it must stay fresh,
 *  - pricing (preview, sheet, catalog) uses a long TTL — prices are stable per item,
 *  - live capacity is uncached,
 *  - the reference-slot probe runs in parallel, and its date lists are request-cached
 *    so a subsequent {@link getDateSlots} for the same date reuses them.
 */

const ITEM_ID_URL_PATTERN = /\/items\/(\d+)\//;

function extractItemId(bookingUrlOrId?: string): string | null {
  if (!bookingUrlOrId) return null;
  if (/^\d+$/.test(bookingUrlOrId)) return bookingUrlOrId;
  const match = bookingUrlOrId.match(ITEM_ID_URL_PATTERN);
  return match ? match[1] : null;
}

/** Cache tag for an item's booking data, enabling targeted revalidation later. */
function itemTag(config: BookingEngineConfig, itemId: string): string {
  return `booking:${config.companyShortname}:${itemId}`;
}

/**
 * Request-cached single-date availability fetch. Wrapping this in React `cache`
 * dedupes the pricing probe and an on-demand slot load for the same date within one
 * request. Config identity is stable per engine instance, so memoization is correct.
 */
const fetchDateList = cache(
  (config: BookingEngineConfig, itemId: string, date: string): Promise<DateListResponse | null> =>
    fetchJson<DateListResponse>(dateListUrl(config, itemId, date), {
      revalidate: config.availabilityRevalidateSeconds,
      tags: [itemTag(config, itemId)],
      timeoutMs: config.requestTimeoutMs,
    }),
);

function fetchMonthCalendar(
  config: BookingEngineConfig,
  itemId: string,
  year: number,
  month: number,
): Promise<CalendarResponse | null> {
  return fetchJson<CalendarResponse>(calendarUrl(config, itemId, year, month), {
    revalidate: config.availabilityRevalidateSeconds,
    tags: [itemTag(config, itemId)],
    timeoutMs: config.requestTimeoutMs,
  });
}

/** Collects upcoming bookable ISO dates (with slot counts) from a month calendar. */
function collectBookableDates(
  calendar: CalendarResponse | null,
  fromIso: string,
): AvailabilityDate[] {
  if (!calendar) return [];
  const dates: AvailabilityDate[] = [];
  for (const week of calendar.calendar.weeks) {
    for (const day of week.days) {
      if (day.month !== "current") continue;
      if (!day.is_bookable) continue;
      if (day.at < fromIso) continue;
      dates.push({ date: day.at, slotCount: day.count });
    }
  }
  return dates;
}

/** Maps a single-date availability list into normalized, bookable slots. */
function toBookingDate(
  config: BookingEngineConfig,
  itemId: string,
  date: string,
  list: DateListResponse | null,
): BookingDate | null {
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
      bookUrl: slotBookUrl(config, itemId, availability.pk),
    }));

  if (slots.length === 0) return null;
  return { date, slots };
}

/**
 * Probes the first few bookable dates — in parallel — for one real slot to anchor
 * pricing. Parallelism replaces the previous date-by-date waterfall.
 */
async function findReferenceAvailability(
  config: BookingEngineConfig,
  itemId: string,
  dates: string[],
): Promise<{ availabilityId: number; date: string } | null> {
  const probeDates = dates.slice(0, config.referenceProbeLimit);
  const lists = await Promise.all(
    probeDates.map((date) => fetchDateList(config, itemId, date)),
  );

  for (let index = 0; index < lists.length; index += 1) {
    const slot = lists[index]?.availabilities.find(
      (availability) => availability.is_bookable && !availability.is_sold_out,
    );
    if (slot) return { availabilityId: slot.pk, date: probeDates[index] };
  }
  return null;
}

/**
 * Resolves the total-price sheet that applies to an availability, so pricing stays
 * correct even if the account's online sheet changes. Falls back to the configured
 * default when the upstream lookup is unavailable. Cached with the pricing TTL.
 */
async function resolveTotalSheetId(
  config: BookingEngineConfig,
  itemId: string,
  availabilityId: number,
): Promise<string> {
  const data = await fetchJson<EffectiveSheetsResponse>(
    effectiveSheetsUrl(config, availabilityId),
    {
      revalidate: config.pricingRevalidateSeconds,
      tags: [itemTag(config, itemId)],
      timeoutMs: config.requestTimeoutMs,
    },
  );
  const pk = data?.effective_sheets?.total_sheet?.pk;
  return pk ? String(pk) : config.pricingTotalSheetId;
}

/**
 * Builds the customer-type catalog from the embed price-preview (rich labels, age
 * notes, currency) joined to the total-sheet pricing for the fee-free base price.
 * The two sources are joined by all-in price (base + booking fee equals the preview
 * price); equal-priced types share an identical base/fee, so a collision is harmless.
 */
function mapCustomerTypes(
  itemId: string,
  preview: PricePreviewResponse | null,
  pricing: PricingResponse | null,
): { currency: string; customerTypes: CustomerTypeOption[] } {
  const previewItem =
    preview?.items.find((entry) => String(entry.id) === itemId) ?? preview?.items[0];
  const previewTypes = previewItem?.price.breakdown.customer_types ?? [];

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

async function getBookingExperience(
  config: BookingEngineConfig,
  itemId: string,
): Promise<BookingExperience | null> {
  const today = operatorToday(config.timezone);
  const months = upcomingMonths(today, config.monthsAhead);

  const calendars = await Promise.all(
    months.map((month) => fetchMonthCalendar(config, itemId, month.year, month.month)),
  );

  const bookableDates = calendars
    .flatMap((calendar) => collectBookableDates(calendar, today.iso))
    .map((entry) => entry.date);

  if (bookableDates.length === 0) return null;

  const reference = await findReferenceAvailability(config, itemId, bookableDates);
  if (!reference) return null;

  // Catalog (preview) needs no sheet, so fetch it alongside the sheet resolution;
  // pricing then uses the resolved sheet for the exact fee-free base price.
  const [preview, totalSheetId] = await Promise.all([
    fetchJson<PricePreviewResponse>(pricePreviewUrl(config, itemId, reference.date), {
      revalidate: config.pricingRevalidateSeconds,
      tags: [itemTag(config, itemId)],
      timeoutMs: config.requestTimeoutMs,
    }),
    resolveTotalSheetId(config, itemId, reference.availabilityId),
  ]);

  const pricing = await fetchJson<PricingResponse>(
    pricingUrl(config, totalSheetId, reference.availabilityId),
    {
      revalidate: config.pricingRevalidateSeconds,
      tags: [itemTag(config, itemId)],
      timeoutMs: config.requestTimeoutMs,
    },
  );

  const { currency, customerTypes } = mapCustomerTypes(itemId, preview, pricing);

  // Pre-resolve the first date's slots so the client skips a round-trip on first
  // paint. fetchDateList is request-cached and was already hit during the reference
  // probe for early dates, so this reuses that result without extra network.
  const firstDate = bookableDates[0];
  const initial = toBookingDate(config, itemId, firstDate, await fetchDateList(config, itemId, firstDate));

  return {
    itemId,
    currency,
    bookableDates,
    customerTypes,
    perPaxFields: defaultPerPaxFields(),
    initial,
  };
}

async function getDateSlots(
  config: BookingEngineConfig,
  itemId: string,
  date: string,
): Promise<BookingDate | null> {
  const list = await fetchDateList(config, itemId, date);
  return toBookingDate(config, itemId, date, list);
}

async function getSlotLiveCapacity(
  config: BookingEngineConfig,
  itemId: string,
  availabilityId: number,
): Promise<SlotLiveCapacity | null> {
  const live = await fetchJson<LiveCapacityResponse>(
    liveCapacityUrl(config, itemId, availabilityId),
    { noStore: true, timeoutMs: config.requestTimeoutMs },
  );
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

async function getAvailabilityHint(
  config: BookingEngineConfig,
  bookingUrl: string | undefined,
  maxDates: number,
): Promise<AvailabilityDate[]> {
  const itemId = extractItemId(bookingUrl);
  if (!itemId) return [];

  const today = operatorToday(config.timezone);
  const months = upcomingMonths(today, 2);

  const calendars = await Promise.all(
    months.map((month) =>
      fetchJson<CalendarResponse>(calendarUrl(config, itemId, month.year, month.month), {
        revalidate: config.hintRevalidateSeconds,
        tags: [itemTag(config, itemId)],
        timeoutMs: config.requestTimeoutMs,
      }),
    ),
  );

  const dates = calendars.flatMap((calendar) => collectBookableDates(calendar, today.iso));
  return dates.slice(0, maxDates);
}

/** Creates a FareHarbor {@link BookingProvider} bound to one operator config. */
export function createFareHarborProvider(config: BookingEngineConfig): BookingProvider {
  return {
    extractItemId,
    getBookingExperience: (itemId) => getBookingExperience(config, itemId),
    getDateSlots: (itemId, date) => getDateSlots(config, itemId, date),
    getSlotLiveCapacity: (itemId, availabilityId) =>
      getSlotLiveCapacity(config, itemId, availabilityId),
    getAvailabilityHint: (bookingUrl, maxDates) =>
      getAvailabilityHint(config, bookingUrl, maxDates),
  };
}
