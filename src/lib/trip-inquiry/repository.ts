import type { TripInquiryLead } from "./types";

/**
 * Lead persistence port.
 *
 * The service depends only on this interface, so the storage backend is swappable.
 * The default is a dependency-free, in-memory/console implementation suitable before
 * a database exists; a Supabase adapter (tenant-scoped, RLS, consent column) is a
 * drop-in replacement via {@link setLeadRepository} once the project is provisioned.
 */
export interface LeadRepository {
  save(lead: TripInquiryLead): Promise<void>;
}

/**
 * Default repository: keeps a bounded ring of recent leads in memory (ephemeral —
 * resets on redeploy/cold start) and logs only NON-PII metadata. It never logs the
 * guest's name, contact, or message.
 */
class InMemoryLeadRepository implements LeadRepository {
  private readonly leads: TripInquiryLead[] = [];
  private readonly limit = 200;

  async save(lead: TripInquiryLead): Promise<void> {
    this.leads.push(lead);
    if (this.leads.length > this.limit) {
      this.leads.shift();
    }
    console.info("[trip-inquiry] lead captured", {
      id: lead.id,
      tenantId: lead.tenantId,
      experience: lead.experience,
      placeCount: lead.places.length,
      interestCount: lead.interests.length,
      locale: lead.locale,
      createdAt: lead.createdAt,
    });
  }
}

let repository: LeadRepository = new InMemoryLeadRepository();

export function getLeadRepository(): LeadRepository {
  return repository;
}

/** Swaps the active repository (e.g. to a Supabase adapter) at startup. */
export function setLeadRepository(next: LeadRepository): void {
  repository = next;
}
