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
