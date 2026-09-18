import type { BookingEngineConfig } from "../../config";

/**
 * FareHarbor URL builders, all derived from the operator {@link BookingEngineConfig}.
 *
 * Centralising URL construction keeps the company shortname and base URLs in exactly
 * one place per operator, so pointing the engine at a different FareHarbor account is
 * a config change, not a code edit.
 */

export function calendarUrl(
  config: BookingEngineConfig,
  itemId: string,
  year: number,
  month: number,
): string {
  const padded = String(month).padStart(2, "0");
  return `${config.apiBase}/companies/${config.companyShortname}/items/${itemId}/calendar/${year}/${padded}/`;
}

export function dateListUrl(config: BookingEngineConfig, itemId: string, date: string): string {
  return `${config.apiBase}/companies/${config.companyShortname}/items/${itemId}/availabilities/date/${date}/`;
}

export function pricingUrl(
  config: BookingEngineConfig,
  totalSheetId: string,
  availabilityId: number,
): string {
  const params = new URLSearchParams({
    include_whole_booking_percentage_custom_fields: "no",
    include_whole_booking_offset_custom_fields: "no",
    include_customer_custom_fields: "no",
    // Excluding the booking fee yields the exact fee-free base price (the marketed
    // rate); the fee is still returned separately for the "book direct" value prop.
    include_booking_fee: "no",
    include_taxes: "yes",
  });
  return `${config.apiBase}/companies/${config.companyShortname}/total-sheets/${totalSheetId}/pricing/availabilities/${availabilityId}/?${params.toString()}`;
}

/** Embed price-preview: one call for the customer-type catalog + all-in prices. */
export function pricePreviewUrl(config: BookingEngineConfig, itemId: string, date: string): string {
  const params = new URLSearchParams({
    date,
    item_pks: itemId,
    include_breakdown: "yes",
  });
  return `${config.embedBase}/${config.companyShortname}/price-preview/per-item/v2/?${params.toString()}`;
}

export function effectiveSheetsUrl(config: BookingEngineConfig, availabilityId: number): string {
  return `${config.apiBase}/companies/${config.companyShortname}/availabilities/${availabilityId}/effective-sheets/`;
}

export function liveCapacityUrl(
  config: BookingEngineConfig,
  itemId: string,
  availabilityId: number,
): string {
  const params = new URLSearchParams({
    customer_type_rate_counts: "{}",
    is_flyout: "no",
    total_sheet: config.pricingTotalSheetId,
  });
  return `${config.apiBase}/companies/${config.companyShortname}/items/${itemId}/availabilities/${availabilityId}/live/?${params.toString()}`;
}

/** Absolute hosted booking deep link for a specific slot. */
export function slotBookUrl(
  config: BookingEngineConfig,
  itemId: string,
  availabilityId: number,
): string {
  return `${config.hostedBase}/${config.companyShortname}/items/${itemId}/availability/${availabilityId}/book/`;
}
