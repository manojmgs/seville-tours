/**
 * Raw FareHarbor response shapes (public, un-keyed embed/API endpoints).
 *
 * These are provider-internal to the FareHarbor adapter and never leave it — the
 * adapter maps them into the provider-neutral domain types. They model only the
 * fields the display-only booking surface needs.
 */

export type DateListResponse = {
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

export type CalendarDay = {
  month: "current" | "other";
  at: string;
  is_bookable: boolean;
  /** Number of availabilities (slots) on the day. */
  count: number;
};

export type CalendarResponse = {
  calendar: { weeks: Array<{ days: CalendarDay[] }> };
};

/** Single-call embed catalog: customer-type labels, age notes, and all-in prices. */
export type PricePreviewResponse = {
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
export type EffectiveSheetsResponse = {
  effective_sheets: { total_sheet: { pk: number } | null } | null;
};

export type PricingResponse = {
  price_previews: {
    customer_types: Array<{
      customer_type_rate: number;
      total: number;
      booking_fee: number;
    }>;
  };
};

export type LiveCapacityResponse = {
  live_capacity: {
    is_bookable: boolean;
    availability_live_bookable_capacity: number | null;
    is_overbooking_availability: boolean;
  };
};
