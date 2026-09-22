/**
 * Shared claim boundaries for the Carlos research demos.
 *
 * These strings are asserted by tests. The rule is not a banned vocabulary:
 * bounded negatives such as "Nothing has been booked" reuse the same words and
 * are required. Only unsupported positive state claims are prohibited.
 */

export const RESEARCH_BANNER = "Research concept · No real operator contacted";

export const RESEARCH_PROHIBITED_CLAIMS: readonly string[] = [
  "Booking confirmed",
  "Available now",
  "Order completed",
  "Voucher redeemed",
  "Price confirmed",
  "Request sent",
  "Operator accepted",
  "Introduction sent",
  "immutable",
];

export const RESEARCH_BOUNDARY_CLAIMS = {
  noBooking: "No booking created",
  noAvailability: "Availability not confirmed",
  noPrice: "No price quoted",
  noContact: "No real operator contacted",
  noTransmission: "No traveller information was transmitted",
} as const;
