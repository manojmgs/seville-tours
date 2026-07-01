import { cache } from "react";

import {
  DEFAULT_BOOKING_CONFIG,
  defineBookingConfig,
  type BookingConfigInput,
  type BookingEngineConfig,
  type BookingProviderKind,
} from "./config";
import type { BookingProvider } from "./provider";
import { createFareHarborProvider } from "./providers/fareharbor/adapter";

/**
 * Booking-engine public API.
 *
 * A provider- and tenant-agnostic booking engine. Bind it to an operator config to
 * get a {@link BookingProvider}; the concrete provider (FareHarbor today) is selected
 * from config, so callers never depend on a vendor. Reusing the engine for another
 * tour operator is a new config (or a new adapter behind the same port).
 */

const PROVIDER_FACTORIES: Record<
  BookingProviderKind,
  (config: BookingEngineConfig) => BookingProvider
> = {
  fareharbor: createFareHarborProvider,
};

/** Builds a booking engine for a specific operator config. */
export function createBookingEngine(config: BookingEngineConfig): BookingProvider {
  return PROVIDER_FACTORIES[config.provider](config);
}

/** The engine for this deployment's default operator, memoized per request. */
export const getBookingEngine = cache((): BookingProvider =>
  createBookingEngine(DEFAULT_BOOKING_CONFIG),
);

export {
  DEFAULT_BOOKING_CONFIG,
  defineBookingConfig,
  type BookingConfigInput,
  type BookingEngineConfig,
  type BookingProviderKind,
};
export type { BookingProvider } from "./provider";
export type {
  AvailabilityDate,
  BookingDate,
  BookingExperience,
  BookingSlot,
  CustomerTypeOption,
  PerPaxField,
  SlotLiveCapacity,
} from "./types";
