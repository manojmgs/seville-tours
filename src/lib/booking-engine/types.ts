/**
 * Booking-engine domain types (provider-neutral).
 *
 * These describe the DISPLAY-ONLY booking surface in operator-agnostic terms so the
 * same UI and API layer can be powered by any booking provider adapter (FareHarbor
 * today; another system tomorrow) without changing shape. Nothing here holds a seat
 * or takes payment — results are always "subject to confirmation" until the operator
 * confirms via the provider's sanctioned flow.
 */

/** A selectable bookable time slot on a given date. */
export type BookingSlot = {
  /** Provider availability id. */
  availabilityId: number;
  /** ISO datetime in tour-local time, e.g. "2026-06-20T12:30:00". */
  startAt: string;
  /** ISO datetime in tour-local time, e.g. "2026-06-20T14:00:00". */
  endAt: string;
  /** Approximate remaining capacity, when the provider exposes it; null when unknown. */
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
  /** Provider customer-type-rate id on the reference slot (pricing key). */
  rateId: number;
  /** Display label, e.g. "Adult". */
  label: string;
  /** Human age note, e.g. "Ages 15 - 99" or "Proof required". */
  ageNote: string;
  /** Base price per person in cents (all-in minus booking fee). */
  basePriceCents: number;
  /** Provider booking fee per person in cents (added only on the hosted flow). */
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
   * Upcoming bookable ISO dates (operator tz) for the calendar picker. Time slots
   * for a chosen date are loaded on demand via {@link BookingDate}.
   */
  bookableDates: string[];
  customerTypes: CustomerTypeOption[];
  perPaxFields: PerPaxField[];
  /**
   * Time slots for the first bookable date, pre-resolved server-side so the calendar
   * renders selectable times on first paint without a second round-trip. Null when
   * the first date has no resolvable slots (the client then loads on demand).
   */
  initial?: BookingDate | null;
};

/**
 * Real-time capacity for a single slot.
 *
 * Display-only: reflects current bookability the moment it is fetched. It never
 * holds a seat and remains "subject to confirmation".
 */
export type SlotLiveCapacity = {
  availabilityId: number;
  /** Overall remaining bookable capacity for the slot. */
  remainingCapacity: number;
  isBookable: boolean;
  isSoldOut: boolean;
};

/** Normalized, display-safe availability date for the lightweight hint. */
export type AvailabilityDate = {
  /** ISO date, e.g. "2026-07-02". */
  date: string;
  slotCount: number;
};
