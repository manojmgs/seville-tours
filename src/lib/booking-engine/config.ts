/**
 * Per-operator booking-engine configuration.
 *
 * The engine is provider- and tenant-agnostic: every operator (or FareHarbor
 * account) is described by one {@link BookingEngineConfig}. This is what makes the
 * engine reusable across tour operators — plug in a new config (or a whole new
 * provider adapter) without touching domain logic, the API layer, or the UI.
 *
 * Config carries three concerns kept intentionally separate:
 *  - identity (tenantId, provider, companyShortname, pricingTotalSheetId),
 *  - endpoints (base URLs — overridable for proxying/testing),
 *  - tuning (calendar window, pricing probe, cache TTLs, request timeout).
 */

/** Booking provider adapters the engine can bind a config to. */
export type BookingProviderKind = "fareharbor";

export type BookingEngineConfig = {
  /** Stable operator id, e.g. "seville-tours". */
  tenantId: string;
  /** Which provider adapter powers this operator. */
  provider: BookingProviderKind;
  /** FareHarbor company shortname, e.g. "sevilletoursco". */
  companyShortname: string;
  /** Total-sheet id used for the fee-free base-price preview. */
  pricingTotalSheetId: string;
  /** Operator operational timezone (IANA), e.g. "Europe/Madrid". */
  timezone: string;
  /** Provider API base (v1). */
  apiBase: string;
  /** Provider embed API base. */
  embedBase: string;
  /** Provider hosted-checkout base. */
  hostedBase: string;
  /** Calendar months (including the current one) to surface in the picker. */
  monthsAhead: number;
  /** Leading bookable dates to probe when anchoring pricing. */
  referenceProbeLimit: number;
  /** TTL for volatile availability data (dates/slots), in seconds. */
  availabilityRevalidateSeconds: number;
  /** TTL for stable pricing/customer-type catalog data, in seconds. */
  pricingRevalidateSeconds: number;
  /** TTL for the lightweight availability hint, in seconds. */
  hintRevalidateSeconds: number;
  /** Upstream request timeout, in milliseconds. */
  requestTimeoutMs: number;
};

/** Shared, provider-level defaults applied to every operator config. */
const ENGINE_DEFAULTS = {
  provider: "fareharbor" as const,
  timezone: "Europe/Madrid",
  apiBase: "https://fareharbor.com/api/v1",
  embedBase: "https://fareharbor.com/api/embed",
  hostedBase: "https://fareharbor.com",
  monthsAhead: 3,
  referenceProbeLimit: 3,
  // Availability moves; prices are stable per item — hence the split TTLs.
  availabilityRevalidateSeconds: 60,
  pricingRevalidateSeconds: 60 * 60 * 6,
  hintRevalidateSeconds: 60 * 60 * 6,
  requestTimeoutMs: 4000,
} satisfies Omit<BookingEngineConfig, "tenantId" | "companyShortname" | "pricingTotalSheetId">;

/** Identity fields an operator must supply; everything else falls back to defaults. */
export type BookingConfigInput = Pick<
  BookingEngineConfig,
  "tenantId" | "companyShortname" | "pricingTotalSheetId"
> &
  Partial<BookingEngineConfig>;

/** Builds a complete config from operator identity plus any overrides. */
export function defineBookingConfig(input: BookingConfigInput): BookingEngineConfig {
  return { ...ENGINE_DEFAULTS, ...input };
}

/**
 * The default operator for this deployment (Seville Tours Co.). Overridable via env
 * so the same build can serve another FareHarbor account without a code change.
 */
export const DEFAULT_BOOKING_CONFIG: BookingEngineConfig = defineBookingConfig({
  tenantId: process.env.BOOKING_TENANT_ID ?? "seville-tours",
  companyShortname: process.env.FAREHARBOR_COMPANY_SHORTNAME ?? "sevilletoursco",
  pricingTotalSheetId: process.env.FAREHARBOR_TOTAL_SHEET_ID ?? "604405",
});
