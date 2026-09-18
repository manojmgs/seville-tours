import { buildWhatsAppUrl } from "@/lib/wordpress-rest/urls";

import { buildTripInquiryMessage } from "./message";
import { getLeadRepository } from "./repository";
import type { TripInquiryInput, TripInquiryLead, TripInquiryResult } from "./types";

/**
 * Trip-inquiry application service.
 *
 * Orchestrates a validated inquiry into a persisted lead and a WhatsApp hand-off.
 * The lead is saved BEFORE the deep link is returned, so a lead is never lost even if
 * the guest abandons the WhatsApp step. This never holds inventory or touches payment.
 */

const DEFAULT_TENANT_ID = process.env.BOOKING_TENANT_ID ?? "seville-tours";

export async function createTripInquiry(input: TripInquiryInput): Promise<TripInquiryResult> {
  const lead: TripInquiryLead = {
    ...input,
    id: crypto.randomUUID(),
    tenantId: DEFAULT_TENANT_ID,
    source: "concierge_plan_trip",
    createdAt: new Date().toISOString(),
  };

  await getLeadRepository().save(lead);

  return {
    inquiryId: lead.id,
    whatsappUrl: buildWhatsAppUrl(buildTripInquiryMessage(input)),
  };
}
