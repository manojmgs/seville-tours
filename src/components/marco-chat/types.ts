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
  | { id: string; kind: "tour"; tour: MarcoTour }
  | { id: string; kind: "direct"; tour: MarcoTour }
  | { id: string; kind: "gift" }
  | { id: string; kind: "escalation"; tourName?: string };

/** A tappable quick-reply chip. */
export type QuickReply = {
  label: string;
  value: string;
};
