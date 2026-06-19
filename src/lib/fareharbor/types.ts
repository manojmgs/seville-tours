/**
 * FareHarbor read-only availability types.
 *
 * These map the public (un-keyed) FareHarbor embed API used for DISPLAY-ONLY
 * availability hints. This data must never drive a held-seat state, a payment,
 * or an implied confirmation. Actual booking happens on FareHarbor's hosted flow
 * (pay-directly) or via Carlos's manual booking (gift-card redemption).
 */

export type FareHarborCalendarDay = {
  /** "current" for days in the requested month, "other" for adjacent-month spillover. */
  month: "current" | "other";
  number: number;
  name: string;
  /** ISO date, e.g. "2026-07-02". */
  at: string;
  formatted_date: string;
  /** Number of availabilities (slots) on the day. */
  count: number;
  availabilities: string;
  is_bookable: boolean;
};

export type FareHarborCalendarWeek = {
  number: number;
  days: FareHarborCalendarDay[];
  availability_count: number;
};

export type FareHarborCalendarResponse = {
  calendar: {
    year: number;
    month: number;
    weeks: FareHarborCalendarWeek[];
    availability_count: number;
  };
};

/** Normalized, display-safe availability date for the read-only hint. */
export type AvailabilityDate = {
  /** ISO date, e.g. "2026-07-02". */
  date: string;
  slotCount: number;
};

/**
 * Booking-experience types.
 *
 * These power the interactive (but still DISPLAY-ONLY) booking surface: live
 * dates/times come from FareHarbor's public read API, per-person prices come from
 * the public pricing preview. Nothing here holds a seat or takes payment. Booking
 * completes on FareHarbor's hosted flow (pay-directly) or via a manual request to
 * Seville Tours Co. (Bizum / cash / gift card / bank transfer), confirmed by Carlos.
 */

/** A selectable bookable time slot on a given date. */
export type BookingSlot = {
  /** FareHarbor availability pk. */
  availabilityId: number;
  /** ISO datetime in tour-local time, e.g. "2026-06-20T12:30:00". */
  startAt: string;
  /** ISO datetime in tour-local time, e.g. "2026-06-20T14:00:00". */
  endAt: string;
  /** Approximate remaining capacity, when the API exposes it; null when unknown. */
  remainingCapacity: number | null;
  /** Absolute hosted booking deep link for this exact slot. */
  bookUrl: string;
};

/** A bookable calendar date with its time slots. */
export type BookingDate = {
  /** ISO date, e.g. "2026-06-20". */
  date: string;
  slots: BookingSlot[];
};

/** A customer/pax category with display labels and per-person pricing. */
export type CustomerTypeOption = {
  /** FareHarbor customer_type_rate pk on the reference slot (pricing key). */
  rateId: number;
  /** Display label, e.g. "Adult". */
  label: string;
  /** Human age note, e.g. "Ages 15 - 99" or "Proof required". */
  ageNote: string;
  /** Base price per person in cents (FareHarbor total minus booking fee). */
  basePriceCents: number;
  /** FareHarbor booking fee per person in cents (added only on the hosted flow). */
  bookingFeeCents: number;
};

/** A per-person input the venue/operator requires (e.g. name, passport id). */
export type PerPaxField = {
  /** Stable field key, e.g. "pax-name". */
  key: string;
  /** Display title, e.g. "Pax Name". */
  title: string;
  /** Helper/description text. */
  description: string;
};

/** Full payload for the interactive booking experience. */
export type BookingExperience = {
  itemId: string;
  /** ISO 4217 currency code, e.g. "EUR". */
  currency: string;
  /**
   * Upcoming bookable ISO dates (Madrid tz) for the calendar picker. Time slots
   * for a chosen date are loaded on demand via {@link BookingDate}.
   */
  bookableDates: string[];
  customerTypes: CustomerTypeOption[];
  perPaxFields: PerPaxField[];
};

/**
 * Real-time capacity for a single slot, read from FareHarbor's live endpoint.
 *
 * Display-only: reflects current bookability the moment it is fetched. It still
 * never holds a seat and remains "subject to confirmation".
 */
export type SlotLiveCapacity = {
  availabilityId: number;
  /** Overall remaining bookable capacity for the slot. */
  remainingCapacity: number;
  isBookable: boolean;
  isSoldOut: boolean;
};
