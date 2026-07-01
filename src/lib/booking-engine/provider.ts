import type { Locale } from "@/lib/i18n/types";

import type {
  AvailabilityDate,
  BookingDate,
  BookingExperience,
  SlotLiveCapacity,
} from "./types";

/**
 * Booking-provider port (hexagonal boundary).
 *
 * Every provider adapter (FareHarbor today) implements this interface bound to a
 * single operator config. Callers depend only on this port, never on a concrete
 * provider — so adding another operator is "new config", and adding another booking
 * system is "new adapter", with no change to the API layer or UI.
 *
 * All methods are DISPLAY-ONLY: they read availability and pricing, never hold a
 * seat and never take payment. Booking completes on the provider's hosted flow or
 * via the operator's manual confirmation.
 */
export interface BookingProvider {
  /** Extracts the provider item id from a booking URL or passes through a numeric id. */
  extractItemId(bookingUrlOrId?: string): string | null;

  /**
   * Assembles the interactive booking experience for an item: upcoming bookable
   * dates, the customer-type catalog, and per-person prices. Returns null for
   * non-matching input or when the upstream is unavailable.
   */
  getBookingExperience(itemId: string): Promise<BookingExperience | null>;

  /** Loads the time slots for a single chosen date, on demand. */
  getDateSlots(itemId: string, date: string): Promise<BookingDate | null>;

  /** Reads real-time bookable capacity for a single slot (uncached). */
  getSlotLiveCapacity(itemId: string, availabilityId: number): Promise<SlotLiveCapacity | null>;

  /** Returns a lightweight list of upcoming bookable dates for a tour hint. */
  getAvailabilityHint(bookingUrl: string | undefined, maxDates: number): Promise<AvailabilityDate[]>;
}

/** Optional locale hint some providers may use for labels; unused by FareHarbor reads. */
export type BookingProviderContext = {
  locale?: Locale;
};
