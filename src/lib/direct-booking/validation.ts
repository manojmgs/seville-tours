import type { DirectBookingInput, DirectPaymentMethod } from "./types";

/**
 * Native, dependency-free validation for inbound direct-booking requests.
 *
 * Validates and sanitizes at the boundary: trims, caps lengths, bounds the guest list,
 * and enforces required fields (tour, date/time, payment method, at least one named
 * guest, contact). Returns a typed result rather than throwing.
 */

const LIMIT = {
  text: 200,
  contact: 160,
  name: 120,
  id: 60,
  notes: 2000,
  proof: 300,
  giftCode: 80,
  guests: 40,
} as const;

const METHODS: readonly DirectPaymentMethod[] = ["bizum", "cash", "bank", "gift"];
const LOCALES = new Set(["en", "es", "fr", "ar"]);

export type ValidationError = { field: string; message: string };

export type ValidationResult =
  | { ok: true; value: DirectBookingInput }
  | { ok: false; errors: ValidationError[] };

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseDirectBooking(raw: unknown): ValidationResult {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: ValidationError[] = [];

  const tourName = asString(body.tourName).slice(0, LIMIT.text);
  if (!tourName) errors.push({ field: "tourName", message: "Tour is required." });

  const dateLabel = asString(body.dateLabel).slice(0, LIMIT.text);
  const timeLabel = asString(body.timeLabel).slice(0, LIMIT.text);
  if (!dateLabel || !timeLabel) {
    errors.push({ field: "slot", message: "Date and time are required." });
  }

  const paymentMethod = asString(body.paymentMethod) as DirectPaymentMethod;
  if (!METHODS.includes(paymentMethod)) {
    errors.push({ field: "paymentMethod", message: "Choose a payment method." });
  }

  const leadContact = asString(body.leadContact).slice(0, LIMIT.contact);
  if (!leadContact) errors.push({ field: "leadContact", message: "A contact is required." });

  const rawGuests = Array.isArray(body.guests) ? body.guests.slice(0, LIMIT.guests) : [];
  const guests = rawGuests
    .map((entry) => {
      const guest = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;
      return {
        label: asString(guest.label).slice(0, LIMIT.name),
        name: asString(guest.name).slice(0, LIMIT.name),
        idNumber: asString(guest.idNumber).slice(0, LIMIT.id) || undefined,
      };
    })
    .filter((guest) => guest.name.length > 0);

  if (guests.length === 0) {
    errors.push({ field: "guests", message: "At least one named guest is required." });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const locale = LOCALES.has(asString(body.locale)) ? asString(body.locale) : "en";

  return {
    ok: true,
    value: {
      tourName,
      dateLabel,
      timeLabel,
      paymentMethod,
      guests,
      totalLabel: asString(body.totalLabel).slice(0, LIMIT.text) || undefined,
      leadName: asString(body.leadName).slice(0, LIMIT.name) || undefined,
      leadContact,
      giftCode: asString(body.giftCode).slice(0, LIMIT.giftCode) || undefined,
      paymentProof: asString(body.paymentProof).slice(0, LIMIT.proof) || undefined,
      notes: asString(body.notes).slice(0, LIMIT.notes) || undefined,
      locale,
    },
  };
}
