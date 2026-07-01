/**
 * Trip-inquiry domain types.
 *
 * A trip inquiry is a qualified concierge lead captured from the Plan-a-Trip flow.
 * It is NOT a booking and holds no inventory — it is the structured hand-off that
 * precedes the WhatsApp conversation and, later, an official pay link.
 */

export type TripExperience = "private" | "luxury";

/** Validated inbound inquiry fields. */
export type TripInquiryInput = {
  experience: TripExperience;
  duration?: string;
  places: string[];
  interests: string[];
  name: string;
  contact?: string;
  message?: string;
  /** App locale the inquiry was submitted in. */
  locale: string;
  /** Explicit GDPR consent to be contacted; must be true to persist. */
  consent: boolean;
};

/** A persisted lead: validated input plus server-assigned identity/provenance. */
export type TripInquiryLead = TripInquiryInput & {
  id: string;
  tenantId: string;
  source: "concierge_plan_trip";
  /** ISO 8601 creation timestamp. */
  createdAt: string;
};

/** Result returned to the client after a successful capture. */
export type TripInquiryResult = {
  inquiryId: string;
  /** Pre-filled WhatsApp deep link to continue the conversation. */
  whatsappUrl: string;
};
