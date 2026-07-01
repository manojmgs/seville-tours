import { buildOperatorEmail, getEmailSender } from "./email";
import type { DirectBookingInput, DirectBookingRequest, DirectBookingResult } from "./types";

/**
 * Direct-booking application service.
 *
 * Turns a validated request into an operator notification (email). WhatsApp remains
 * the client's guaranteed hand-off channel, so email failure never blocks the guest.
 * No card data and no inventory are touched here — the operator confirms manually.
 */

const DEFAULT_TENANT_ID = process.env.BOOKING_TENANT_ID ?? "seville-tours";

export async function submitDirectBooking(input: DirectBookingInput): Promise<DirectBookingResult> {
  const request: DirectBookingRequest = {
    ...input,
    id: crypto.randomUUID(),
    tenantId: DEFAULT_TENANT_ID,
    source: "tour_book_direct",
    createdAt: new Date().toISOString(),
  };

  try {
    await getEmailSender().send(buildOperatorEmail(request));
  } catch {
    // Non-blocking: the client still hands off via WhatsApp. Log non-PII only.
    console.error("[direct-booking] operator email failed", { id: request.id });
  }

  // Non-PII breadcrumb only — never log guest names, IDs, or contact.
  console.info("[direct-booking] request received", {
    id: request.id,
    tenantId: request.tenantId,
    paymentMethod: request.paymentMethod,
    guestCount: request.guests.length,
    locale: request.locale,
    createdAt: request.createdAt,
  });

  return { requestId: request.id };
}
