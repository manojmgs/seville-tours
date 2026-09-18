import type { TripInquiryInput } from "./types";

/**
 * Builds the structured, plain-text WhatsApp hand-off message for an inquiry.
 *
 * Kept server-side and locale-agnostic so the concierge always receives a consistent,
 * scannable summary regardless of the guest's UI language.
 */
export function buildTripInquiryMessage(input: TripInquiryInput): string {
  const lines: string[] = ["Plan a Trip — Seville Tours"];

  lines.push(`Experience: ${input.experience === "luxury" ? "Luxury" : "Private"}`);
  if (input.duration) lines.push(`Duration: ${input.duration}`);
  if (input.places.length > 0) lines.push(`Destinations: ${input.places.join(", ")}`);
  if (input.interests.length > 0) lines.push(`Interests: ${input.interests.join(", ")}`);
  lines.push(`Name: ${input.name}`);
  if (input.contact) lines.push(`Contact: ${input.contact}`);
  if (input.message) lines.push(`Message: ${input.message}`);

  return lines.join("\n");
}
