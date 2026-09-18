/**
 * Illustrative ecosystem data for the TIS demonstration.
 *
 * Every provider, venue, event and price in this file is invented for the demo. None of it
 * describes a real business, a real programme, a real price or real availability. It exists
 * to show the *shape* of an opportunity moment — a suggestion that always carries the reason
 * it appeared — not to make a claim about anything bookable today.
 */

/**
 * Editorial state of a manually entered record. Only READY_FOR_DEMO is ever shown.
 */
export type TisRecordStatus =
  | "DRAFT"
  | "SOURCE_IDENTIFIED"
  | "OFFICIAL_SOURCE_VERIFIED"
  | "READY_FOR_DEMO"
  | "STALE"
  | "CANCELLED"
  | "WITHDRAWN";

/**
 * Where a record was found, where it was checked, and where tickets are actually sold are three
 * different things. Collapsing them into one `sourceUrl` is how a commercial listing site ends up
 * looking like the authority for facts the venue actually published.
 */
export type TisProvenance = Readonly<{
  basis: "verified" | "sample";
  venue: string | null;
  city: string;
  discoverySource: string;
  discoveryUrl: string | null;
  verificationSource: string;
  verificationUrl: string | null;
  ticketSeller: string | null;
  ticketUrl: string | null;
  /** ISO date the record was last checked against the verification source. */
  lastVerified: string;
  verifiedBy: string;
  status: TisRecordStatus;
  stillToConfirm: readonly string[];
}>;

export type TisOpportunityKind =
  | "event"
  | "festival"
  | "nightlife"
  | "experience"
  | "family"
  | "attraction"
  | "restaurant"
  | "stay"
  | "transport"
  | "keepsake";

export type TisOpportunity = Readonly<{
  id: string;
  kind: TisOpportunityKind;
  title: string;
  provider: string;
  detail: string;
  when: string;
  priceHint: string;
  /** Shown on the card as "Why this appeared". A suggestion without one is never surfaced. */
  reason: string;
  /** Interest values that make this relevant. */
  triggers: readonly string[];
  /** Party answers that make this relevant, e.g. a family with children. */
  partyTriggers?: readonly string[];
  /** Absent for illustrative records, which fall back to the sample provenance. */
  provenance?: TisProvenance;
}>;

/** Every invented record carries this, so a sample can never be mistaken for a checked fact. */
const SAMPLE_PROVENANCE: TisProvenance = Object.freeze({
  basis: "sample",
  venue: null,
  city: "Seville",
  discoverySource: "Sample record for this demonstration",
  discoveryUrl: null,
  verificationSource: "Sample record — not checked against any organiser",
  verificationUrl: null,
  ticketSeller: null,
  ticketUrl: null,
  lastVerified: "2026-09-18",
  verifiedBy: "Demo fixture",
  status: "READY_FOR_DEMO",
  stillToConfirm: Object.freeze([
    "Everything — this record is illustrative",
  ]),
});

export function provenanceFor(opportunity: TisOpportunity): TisProvenance {
  return opportunity.provenance ?? SAMPLE_PROVENANCE;
}

export const TIS_OPPORTUNITY_KIND_LABEL: Readonly<Record<TisOpportunityKind, string>> = Object.freeze({
  event: "Event",
  festival: "Festival",
  nightlife: "Night out",
  experience: "Experience",
  family: "With children",
  attraction: "Attraction",
  restaurant: "Where to eat",
  stay: "Place to stay",
  transport: "Getting around",
  keepsake: "Keepsake",
});

/** Category chips, in the order a traveller is most likely to want them. */
export const TIS_OPPORTUNITY_CATEGORIES: readonly TisOpportunityKind[] = Object.freeze([
  "event",
  "festival",
  "nightlife",
  "experience",
  "family",
  "attraction",
  "restaurant",
  "stay",
  "transport",
  "keepsake",
]);

export const TIS_DEMO_OPPORTUNITIES: readonly TisOpportunity[] = Object.freeze([
  Object.freeze({
    id: "event-fibes-mecano-tribute",
    kind: "event" as const,
    title: "Homenaje a Mecano — Me cuesta tanto",
    provider: "FIBES, Seville",
    detail: "A tribute production listed on the venue's own published programme.",
    when: "16 October 2026",
    priceHint: "Price published on the official ticket page",
    reason: "You said local life interests you, and this sits on the venue's published programme.",
    triggers: ["localLife", "history"],
    provenance: Object.freeze({
      basis: "verified" as const,
      venue: "FIBES — Palacio de Exposiciones y Congresos de Sevilla",
      city: "Seville",
      discoverySource: "Official venue programme",
      discoveryUrl: "https://fibes.es/espectaculos/",
      verificationSource: "Official venue information (FIBES)",
      verificationUrl: "https://fibes.es/evento/homenaje-a-mecano-me-cuesta-tanto/",
      ticketSeller: "FIBES Tickets",
      ticketUrl: "https://www.fibestickets.es/espectaculo/homenaje-a-mecano%E2%80%93me-cuesta-tanto-olvidarte/MECANO26",
      lastVerified: "2026-09-18",
      verifiedBy: "Manual review",
      status: "READY_FOR_DEMO" as const,
      stillToConfirm: Object.freeze([
        "Current programme and start time",
        "Ticket availability",
        "Admission conditions",
        "Accessibility arrangements",
        "Any age restrictions",
      ]),
    }),
  }),
  Object.freeze({
    id: "opportunity-patio-evening",
    kind: "event" as const,
    title: "Noche de Patios — courtyard music evening",
    provider: "Sample neighbourhood programme",
    detail: "A small courtyard concert in a residential quarter, capped at forty people.",
    when: "Saturday, 20:00",
    priceHint: "€18 per person",
    reason: "You said local life interests you, and Saturday evening is still open.",
    triggers: ["localLife", "history"],
  }),
  Object.freeze({
    id: "opportunity-olive-tasting",
    kind: "event" as const,
    title: "Olive harvest tasting",
    provider: "Sample producer collective",
    detail: "A working mill opens for tastings during the autumn pressing season.",
    when: "Weekday mornings in season",
    priceHint: "€24 per person",
    reason: "You said food interests you, and this runs during the season you asked about.",
    triggers: ["food", "nature"],
  }),
  Object.freeze({
    id: "opportunity-casa-olivar",
    kind: "restaurant" as const,
    title: "Casa Olivar",
    provider: "Sample partner restaurant",
    detail: "A small family kitchen, ten minutes on foot from the experience you saved.",
    when: "Open evenings, closed Mondays",
    priceHint: "About €30 per person",
    reason: "It is near something already in your Trip Plan, and you mentioned food.",
    triggers: ["food", "localLife"],
  }),
  Object.freeze({
    id: "opportunity-transfer-cordoba",
    kind: "transport" as const,
    title: "Regional transfer, Seville to Córdoba",
    provider: "Sample transfer operator",
    detail: "A private car for the outbound leg, so the day trip does not depend on train times.",
    when: "Morning departures",
    priceHint: "€140 per vehicle",
    reason: "You are considering a day trip, and this covers the leg the operator would ask about.",
    triggers: ["dayTrip"],
  }),
  Object.freeze({
    id: "opportunity-patio-stay",
    kind: "stay" as const,
    title: "Casa del Patio — eight rooms",
    provider: "Sample partner property",
    detail: "A restored townhouse near the quarter your saved experiences sit in.",
    when: "Two-night minimum",
    priceHint: "From €150 per night",
    reason: "You asked the operator about somewhere to stay.",
    triggers: ["architecture", "localLife", "dayTrip"],
  }),
  Object.freeze({
    id: "opportunity-tile-workshop",
    kind: "keepsake" as const,
    title: "Hand-painted tile from a working workshop",
    provider: "Sample ceramics workshop",
    detail: "Made and fired locally. Posted home, or collected before you leave.",
    when: "Made to order, five days",
    priceHint: "€35",
    reason: "You said architecture interests you — this comes from the craft behind it.",
    triggers: ["architecture", "history"],
  }),
  Object.freeze({
    id: "opportunity-guitar-recital",
    kind: "event" as const,
    title: "Guitar recital in a former chapel",
    provider: "Sample music society",
    detail: "Ninety minutes of classical guitar in a deconsecrated chapel with unusual acoustics.",
    when: "Thursday and Sunday, 19:30",
    priceHint: "€22 per person",
    reason: "You said history interests you, and evenings are unplanned so far.",
    triggers: ["history", "architecture", "localLife"],
  }),
  Object.freeze({
    id: "opportunity-spring-feria",
    kind: "festival" as const,
    title: "Spring feria week",
    provider: "Sample municipal calendar",
    detail: "A week of casetas, horses and dancing. The city changes character completely.",
    when: "Falls in April; dates move each year",
    priceHint: "Free to walk; casetas vary",
    reason: "You are flexible on dates, so a festival week is worth knowing about.",
    triggers: ["localLife", "history", "food"],
  }),
  Object.freeze({
    id: "opportunity-harvest-festival",
    kind: "festival" as const,
    title: "Olive harvest festival",
    provider: "Sample producer collective",
    detail: "Villages open their mills for the first pressing, with tastings and music.",
    when: "Late autumn weekends",
    priceHint: "€12 per person",
    reason: "You said food interests you, and this only happens in that season.",
    triggers: ["food", "nature", "localLife"],
  }),
  Object.freeze({
    id: "opportunity-ceramics-morning",
    kind: "experience" as const,
    title: "Morning at a tile workshop",
    provider: "Sample ceramics workshop",
    detail: "Two hours with a working tile maker. You glaze one piece and it is posted on.",
    when: "Tuesday to Friday mornings",
    priceHint: "€48 per person",
    reason: "You said architecture interests you — this is the craft behind it.",
    triggers: ["architecture", "history", "localLife"],
  }),
  Object.freeze({
    id: "opportunity-river-kayak",
    kind: "experience" as const,
    title: "River kayaking at first light",
    provider: "Sample river centre",
    detail: "A flat-water paddle through the city before the heat, suitable for beginners.",
    when: "Daily, 08:00",
    priceHint: "€35 per person",
    reason: "You said nature interests you, and mornings are the cool part of the day.",
    triggers: ["nature", "slowPace"],
  }),
  Object.freeze({
    id: "opportunity-market-counter",
    kind: "restaurant" as const,
    title: "Market counter lunch",
    provider: "Sample market trader",
    detail: "Six stools at a fish counter inside a working market. No reservations.",
    when: "Lunch only, Tuesday to Saturday",
    priceHint: "About €20 per person",
    reason: "You said food and local life interest you.",
    triggers: ["food", "localLife"],
  }),
  Object.freeze({
    id: "opportunity-oil-keepsake",
    kind: "keepsake" as const,
    title: "Single-mill olive oil, boxed",
    provider: "Sample producer collective",
    detail: "Two bottles from the mill you would visit, packed for hold luggage.",
    when: "Collect on the day",
    priceHint: "€26",
    reason: "You said food interests you.",
    triggers: ["food", "nature"],
  }),
  Object.freeze({
    id: "event-fibes-dj-symphonic",
    kind: "nightlife" as const,
    title: "DJ Symphonic",
    provider: "FIBES, Seville",
    detail: "Electronic sets performed with a live orchestra, listed on the venue's own programme.",
    when: "6 November 2026",
    priceHint: "Price published on the official ticket page",
    reason: "You said local life interests you, and this is a late programme at a city venue.",
    triggers: ["localLife"],
    provenance: Object.freeze({
      basis: "verified" as const,
      venue: "FIBES — Palacio de Exposiciones y Congresos de Sevilla",
      city: "Seville",
      discoverySource: "Official venue programme",
      discoveryUrl: "https://fibes.es/espectaculos/",
      verificationSource: "Official venue information (FIBES)",
      verificationUrl: "https://fibes.es/evento/dj-symphonic/",
      ticketSeller: "FIBES Tickets",
      ticketUrl: "https://www.fibestickets.es/espectaculo/dj-symphonic/DJSYMPHONIC2026",
      lastVerified: "2026-09-18",
      verifiedBy: "Manual review",
      status: "READY_FOR_DEMO" as const,
      stillToConfirm: Object.freeze([
        "Start and door times",
        "Ticket availability",
        "Minimum entry age",
        "Admission conditions",
        "Accessibility arrangements",
      ]),
    }),
  }),
  Object.freeze({
    id: "event-cartuja-cascanueces",
    kind: "family" as const,
    title: "El Cascanueces — Ballet de Kiev",
    provider: "Cartuja Center CITE, Seville",
    detail: "A touring production of The Nutcracker in the venue's auditorium.",
    when: "28 and 29 November 2026",
    priceHint: "Price published on the venue's ticket page",
    reason: "You are travelling with children, and this is on the venue's published programme.",
    triggers: ["history", "localLife"],
    partyTriggers: ["family"],
    provenance: Object.freeze({
      basis: "verified" as const,
      venue: "Cartuja Center CITE",
      city: "Seville",
      discoverySource: "Official venue programme",
      discoveryUrl: "https://cartujacenter.com/programacion/",
      verificationSource: "Official venue information (Cartuja Center CITE)",
      verificationUrl: "https://cartujacenter.com/show/el-cascanueces-ballet-de-kiev-2/",
      ticketSeller: null,
      ticketUrl: null,
      lastVerified: "2026-09-18",
      verifiedBy: "Manual review",
      status: "READY_FOR_DEMO" as const,
      stillToConfirm: Object.freeze([
        "Which of the two dates and start times",
        "Authorised ticket route",
        "Ticket availability",
        "Suitable age guidance",
        "Accessibility arrangements",
      ]),
    }),
  }),
  Object.freeze({
    id: "event-cartuja-morancos",
    kind: "event" as const,
    title: "Los Morancos — Bota Antonia",
    provider: "Cartuja Center CITE, Seville",
    detail: "A long-running Seville comedy duo, across two runs of dates in January.",
    when: "7–10 and 14–17 January 2027",
    priceHint: "Price published on the venue's ticket page",
    reason: "You said local life interests you, and this is local comedy rather than a visitor show.",
    triggers: ["localLife"],
    provenance: Object.freeze({
      basis: "verified" as const,
      venue: "Cartuja Center CITE",
      city: "Seville",
      discoverySource: "Official venue programme",
      discoveryUrl: "https://cartujacenter.com/programacion/",
      verificationSource: "Official venue information (Cartuja Center CITE)",
      verificationUrl: "https://cartujacenter.com/show/los-morancos-bota-antonia/",
      ticketSeller: "Cartuja Center box office",
      ticketUrl: "https://tickets.oneboxtds.com/cartujacenter/events/55109?sessionView=LIST",
      lastVerified: "2026-09-18",
      verifiedBy: "Manual review",
      status: "READY_FOR_DEMO" as const,
      stillToConfirm: Object.freeze([
        "Which date and start time",
        "Ticket availability",
        "The performance is in Spanish",
        "Admission conditions",
      ]),
    }),
  }),
  Object.freeze({
    id: "opportunity-rooftop-session",
    kind: "nightlife" as const,
    title: "Rooftop session, sunset to midnight",
    provider: "Sample rooftop venue",
    detail: "A small terrace with a resident DJ. Reservation only, no standing queue.",
    when: "Thursday to Saturday, 20:00–00:00",
    priceHint: "€15 entry, drinks extra",
    reason: "You said local life interests you, and evenings are unplanned.",
    triggers: ["localLife"],
  }),
  Object.freeze({
    id: "opportunity-flamenco-tablao",
    kind: "nightlife" as const,
    title: "Late tablao, second set",
    provider: "Sample tablao",
    detail: "The later set, when the room is mostly locals rather than tour groups.",
    when: "Nightly, 22:30",
    priceHint: "€32 per person",
    reason: "You said local life and history interest you.",
    triggers: ["localLife", "history"],
  }),
  Object.freeze({
    id: "opportunity-zoo-morning",
    kind: "attraction" as const,
    title: "Conservation zoo, early entry",
    provider: "Sample conservation park",
    detail: "A breeding and conservation park outside the city, quietest in the first hour.",
    when: "Daily from 10:00",
    priceHint: "€22 adult, €16 child",
    reason: "You are travelling with children, and this works before the afternoon heat.",
    triggers: ["nature"],
    partyTriggers: ["family"],
  }),
  Object.freeze({
    id: "opportunity-aquarium",
    kind: "attraction" as const,
    title: "River aquarium",
    provider: "Sample aquarium",
    detail: "Indoor, air-conditioned, about two hours end to end.",
    when: "Daily, 10:00–18:00",
    priceHint: "€18 adult, €13 child",
    reason: "You are travelling with children, and this is indoors when it is hot.",
    triggers: ["nature", "slowPace"],
    partyTriggers: ["family"],
  }),
  Object.freeze({
    id: "opportunity-puppet-matinee",
    kind: "family" as const,
    title: "Puppet theatre matinee",
    provider: "Sample puppet company",
    detail: "Forty minutes, no dialogue, so language is not a barrier.",
    when: "Saturday and Sunday, 12:00",
    priceHint: "€9 per person",
    reason: "You are travelling with children, and this needs no Spanish.",
    triggers: ["localLife"],
    partyTriggers: ["family"],
  }),
  Object.freeze({
    id: "opportunity-bike-family",
    kind: "family" as const,
    title: "Riverside bikes, including child seats",
    provider: "Sample bike hire",
    detail: "Flat riverside route away from traffic. Child seats and small frames available.",
    when: "Daily, hourly hire",
    priceHint: "€12 per bike, half day",
    reason: "You are travelling with children, and you said nature interests you.",
    triggers: ["nature", "slowPace"],
    partyTriggers: ["family"],
  }),
]);

export function opportunityById(id: string): TisOpportunity | undefined {
  return TIS_DEMO_OPPORTUNITIES.find((opportunity) => opportunity.id === id);
}

/**
 * Relevant opportunities, optionally narrowed to one category. Relevance still comes from what
 * the traveller said — browsing a category never invents a reason.
 */
function isRelevant(
  opportunity: TisOpportunity,
  interests: readonly string[],
  party: string | null,
): boolean {
  if (opportunity.triggers.some((trigger) => interests.includes(trigger))) return true;
  return party !== null && (opportunity.partyTriggers?.includes(party) ?? false);
}

export function opportunitiesFor(
  interests: readonly string[],
  party: string | null,
  category: TisOpportunityKind | null,
): readonly TisOpportunity[] {
  return TIS_DEMO_OPPORTUNITIES.filter(
    (opportunity) =>
      provenanceFor(opportunity).status === "READY_FOR_DEMO" &&
      (category === null || opportunity.kind === category) &&
      isRelevant(opportunity, interests, party),
  );
}

/** Everything publishable, ignoring relevance. Used only when the traveller asks to see it all. */
export function allOpportunities(category: TisOpportunityKind | null): readonly TisOpportunity[] {
  return TIS_DEMO_OPPORTUNITIES.filter(
    (opportunity) =>
      provenanceFor(opportunity).status === "READY_FOR_DEMO" &&
      (category === null || opportunity.kind === category),
  );
}

export function matchesTraveller(
  opportunity: TisOpportunity,
  interests: readonly string[],
  party: string | null,
): boolean {
  return isRelevant(opportunity, interests, party);
}

/** "2026-10-16" reads as "16 October 2026" on the card. */
export function formatCheckedDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(parsed);
}

/** Categories that actually have something relevant, so we never offer an empty chip. */
export function availableCategories(
  interests: readonly string[],
  party: string | null,
  showEverything: boolean,
): readonly TisOpportunityKind[] {
  return TIS_OPPORTUNITY_CATEGORIES.filter((category) =>
    showEverything
      ? allOpportunities(category).length > 0
      : opportunitiesFor(interests, party, category).length > 0,
  );
}

/**
 * At most one opportunity at a time. A screen that suggests six things is a catalogue,
 * not a conversation — and the traveller stops reading the reasons.
 */
export function selectOpportunity(
  interests: readonly string[],
  excludedIds: readonly string[],
): TisOpportunity | null {
  const excluded = new Set(excludedIds);
  return (
    TIS_DEMO_OPPORTUNITIES.find(
      (opportunity) =>
        !excluded.has(opportunity.id) &&
        opportunity.triggers.some((trigger) => interests.includes(trigger)),
    ) ?? null
  );
}
