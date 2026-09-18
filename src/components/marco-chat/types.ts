/**
 * Shared types for the Marco chat advisor.
 *
 * Marco is a fully deterministic decision-tree advisor — no AI API, no runtime
 * fetch. Tour data is resolved at build time and passed in as props; operator
 * branding/behaviour is passed in as config so the widget is multi-tenant safe.
 */

/** A single recommendable tour, resolved from the WordPress manifest at build time. */
export type MarcoTour = {
  /** Stable decision-tree id (e.g. "alcazar"), not the WordPress slug. */
  id: string;
  name: string;
  badge: string;
  emoji: string;
  /** Human-formatted price, e.g. "€50" or "From €295". */
  price: string;
  /** Human-formatted duration, e.g. "1.5 hours" or "Full day". */
  duration: string;
  desc: string;
  /** Booking destination: FareHarbor deep link when available, else the tour page. */
  url: string;
  /** Internal "Book direct with us" page for this tour (/{locale}/book/{slug}). */
  bookDirectUrl: string;
  /** True when {@link url} is a direct FareHarbor booking flow (self-serve). */
  bookable: boolean;
  /** True when the tour has a fixed, published price (not a private/quote tour). */
  priceKnown: boolean;
  /** Where the displayed amount comes from; absence keeps hand-authored fixtures compatible. */
  priceSourceStatus?: "operator-published" | "confirmation-required";
  /** The operator's tour page, separate from a hosted booking destination. */
  operatorUrl?: string;
  /** WordPress source modified time, not a manual verification time. */
  sourceUpdatedAt?: string;
  /** Explicit items that remain for the operator or traveller to confirm. */
  confirmationItems?: RecommendationConfirmationItem[];
  /**
   * FareHarbor item id for live availability lookups, when this tour has a
   * self-serve flow. Absent for private/quote tours (they have no calendar).
   */
  fareHarborItemId?: string;
  /** Optional featured image; falls back to the emoji tile when absent. */
  img?: string;
  tags: string[];
  /**
   * Distinctive, accent-insensitive name tokens for matching this tour from free
   * text — multilingual by design (e.g. "alcazar", "catedral", "cathedrale",
   * "giralda", "alhambra"). Used only for name lookup, never for recommendations.
   */
  matchTerms: string[];
};

export type RecommendationReasonCode =
  | "daytrip-interest"
  | "food-interest"
  | "short-visit"
  | "family-context"
  | "history-interest"
  | "general-introduction";

export type RecommendationInput = "duration" | "interest" | "group";

export type RecommendationConfirmationItem =
  | "price-unit"
  | "format"
  | "availability"
  | "date"
  | "final-price"
  | "inclusions";

export type RecommendationResult = {
  tourIds: string[];
  reasonCode: RecommendationReasonCode;
  usedInputs: RecommendationInput[];
};

/** An operator-supplied FAQ entry, checked before the built-in knowledge base. */
export type MarcoKnowledgeEntry = {
  /** Keywords/phrases (case-insensitive substring match) that trigger this answer. */
  keywords: string[];
  /** The grounded answer to return. Supports {persona} {operator} {brand} {destination} {region} tokens. */
  answer: string;
  /** Optional tour ids to recommend alongside the answer. */
  recommend?: string[];
};

/** Operator-level branding and behaviour. Enables multi-tenant reuse. */
export type MarcoConfig = {
  /** Advisor persona name, e.g. "Marco" or "Isabel". */
  persona: string;
  /** Human the widget escalates to, e.g. "Carlos". */
  operatorName: string;
  /** Business name, e.g. "Seville Tours". */
  brandName: string;
  /** City/area the tours cover, e.g. "Seville". */
  destination: string;
  /** Wider region label, e.g. "Andalucía". */
  region: string;
  /** Header subtitle, e.g. "Seville Expert". */
  expertTitle: string;
  /** Gift-card provider name shown in copy, e.g. "ParaUsted". */
  giftProviderName: string;
  /** Primary brand colour (panel, user bubbles). */
  primaryColor: string;
  /** Accent colour (badges, highlights). */
  accentColor: string;
  /** Operator WhatsApp number in international format, digits only or with '+'. */
  whatsapp: string;
  /** Whether the gift-card exit path is offered. */
  giftCards: boolean;
  /** Hosted gift-card destination (no amount/PII in the URL). */
  giftUrl: string;
  /** Operator page slug, used to resolve their souvenir shelf. */
  operatorSlug?: string;
  /** Optional operator-specific FAQ answers, checked before the built-in intents. */
  knowledgeBase?: MarcoKnowledgeEntry[];
};

/** The three decision-tree questions. */
export type DurationAnswer = "few-hours" | "1-2-days" | "3-plus" | "day-trip";
export type InterestAnswer = "history" | "food" | "daytrip" | "surprise";
export type GroupAnswer = "solo" | "couple" | "family" | "group";

/** Accumulated answers as the guest walks the tree. */
export type MarcoAnswers = {
  duration?: DurationAnswer;
  interest?: InterestAnswer;
  group?: GroupAnswer;
};

/** Which decision-tree step the conversation is currently on. */
export type MarcoStep = "duration" | "interest" | "group" | "recommend";

/**
 * A rendered item in the chat transcript. The transcript is an ordered list of
 * these; {@link MessageList} switches on `kind` to pick the right renderer.
 */
export type MarcoMessage =
  | { id: string; kind: "ai"; text: string }
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "typing" }
  | { id: string; kind: "tour"; tour: MarcoTour; recommendation?: RecommendationResult }
  | { id: string; kind: "direct"; tour: MarcoTour }
  | { id: string; kind: "gift" }
  | { id: string; kind: "souvenir"; tourId?: string }
  | { id: string; kind: "escalation"; tourName?: string };

/** A tappable quick-reply chip. */
export type QuickReply = {
  label: string;
  value: string;
};

/**
 * Journey Brief domain model — the smallest session-level record of what Marco has
 * gathered so far. See {@link ../../lib/marco/journey-brief} for derivation rules
 * and the trust limits this model deliberately enforces (no price, no availability,
 * no invented tour combinations, no persistence).
 */

/** Whether a customised private arrangement or a fixed group format applies. */
export type TourFormat = "private" | "group" | "undecided";

/** Who is travelling; reuses the decision-tree's group answers plus "unspecified". */
export type PartyType = GroupAnswer | "unspecified";

/** How much walking the traveller says they want. Never used to infer suitability. */
export type WalkingPreference = "minimal" | "moderate" | "extended" | "unspecified";

/** Whether the traveller needs a fixed start time or can be flexible. */
export type TimingPreference = "fixed" | "flexible" | "unspecified";

/**
 * Where a single Journey Brief value came from — the only provenance signal kept in
 * this slice, enough to later distinguish "confirmed" from "needs the operator".
 */
export type JourneyBriefFieldOrigin =
  | "travellerProvided"
  | "travellerSelected"
  | "controlledDerived"
  | "operatorSupplied"
  | "liveOperational"
  | "requiresConfirmation";

/** A Journey Brief value paired with where it came from. */
export type JourneyBriefField<T> = {
  value: T;
  origin: JourneyBriefFieldOrigin;
};

/** Session-level Journey Brief. Deliberately excludes price, availability, bookings,
 * leads, contact details and persistence — those belong to later slices. */
export type JourneyBrief = {
  locale: string;
  destination: JourneyBriefField<string>;
  date?: JourneyBriefField<string>;
  format: JourneyBriefField<TourFormat>;
  partyType: JourneyBriefField<PartyType>;
  partySize?: JourneyBriefField<number>;
  /** Kept as separate entries — interests are never merged into one combined product. */
  interests: JourneyBriefField<InterestAnswer>[];
  walkingPreference: JourneyBriefField<WalkingPreference>;
  timingPreference: JourneyBriefField<TimingPreference>;
  /** Tour ids supplied by the caller — never synthesised or combined by derivation. */
  tourIds: string[];
  openQuestions: string[];
  operatorConfirmations: string[];
};

/** Controlled inputs {@link deriveJourneyBrief} may read. Nothing here is fetched. */
export type JourneyBriefInput = {
  locale: string;
  destination: string;
  /** Progress through the existing tap-driven decision tree, if any. */
  answers?: MarcoAnswers;
  /** Free-text or structured additions the traveller gave explicitly. */
  dateText?: string;
  format?: TourFormat;
  partySize?: number;
  walkingPreference?: WalkingPreference;
  timingPreference?: TimingPreference;
  /** Overrides/extends `answers.interest`; kept as separate entries, never merged. */
  interests?: InterestAnswer[];
  /** Tour ids already chosen or suggested elsewhere; passed through verbatim. */
  selectedTourIds?: string[];
  /** Explicit operator requirements supplied by later operator metadata. */
  operatorConfirmations?: string[];
};

