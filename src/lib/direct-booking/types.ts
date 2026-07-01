/**
 * Direct-booking domain types.
 *
 * A direct booking request is a manual (non-card) reservation request for a specific
 * tour slot — paid by Bizum, cash, bank transfer, or gift card. It is NOT a confirmed
 * booking and holds no inventory; it notifies the operator (email + WhatsApp) to
 * confirm. Card payments are handled separately by Stripe Checkout (future phase).
 */

export type DirectPaymentMethod = "bizum" | "cash" | "bank" | "gift";

/** A single guest on the request, with the venue-required details. */
export type DirectBookingGuest = {
  /** Customer-type label, e.g. "Adult". */
  label: string;
  name: string;
  /** ID/passport number when the venue requires it. */
  idNumber?: string;
};

/** Validated inbound direct-booking request fields. */
export type DirectBookingInput = {
  tourName: string;
  /** Human-readable date label as shown to the guest. */
  dateLabel: string;
  /** Human-readable time label as shown to the guest. */
  timeLabel: string;
  paymentMethod: DirectPaymentMethod;
  guests: DirectBookingGuest[];
  /** Human-readable total label, e.g. "Estimated total: €120". */
  totalLabel?: string;
  leadName?: string;
  /** Contact the operator will reply to (email or phone). Required. */
  leadContact: string;
  giftCode?: string;
  paymentProof?: string;
  notes?: string;
  locale: string;
};

/** A request with server-assigned identity/provenance. */
export type DirectBookingRequest = DirectBookingInput & {
  id: string;
  tenantId: string;
  source: "tour_book_direct";
  /** ISO 8601 creation timestamp. */
  createdAt: string;
};

/** Result returned to the client after a successful submission. */
export type DirectBookingResult = {
  requestId: string;
};
