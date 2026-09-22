import type { MarcoTour } from "@/components/marco-chat/types";

/**
 * Demo 2 — four-day private journey and professional collaboration.
 *
 * Deterministic concept data. No commercial or legal model is implied: who
 * quotes, who contracts and who is paid are left open on purpose. Nothing here
 * transmits, and no operator is named without a permissioned repository record.
 */

export type Demo2Stage =
  | "request"
  | "unknowns"
  | "actionBrief"
  | "discovery"
  | "opportunity"
  | "sharing"
  | "receipt"
  | "commercial";

export const DEMO2_STAGES: readonly { id: Demo2Stage; label: string }[] = Object.freeze([
  { id: "request", label: "The request" },
  { id: "unknowns", label: "Blocking unknowns" },
  { id: "actionBrief", label: "Carlos's action brief" },
  { id: "discovery", label: "Professional discovery" },
  { id: "opportunity", label: "Anonymous opportunity" },
  { id: "sharing", label: "Traveller reviews sharing" },
  { id: "receipt", label: "Introduction context prepared" },
  { id: "commercial", label: "Commercial model stays open" },
]);

export const DEMO2_REQUEST: readonly string[] = Object.freeze([
  "Two adults",
  "14–18 October",
  "Seville and Granada",
  "History and food",
  "Relaxed pace",
  "Private if possible",
  "One relative may join",
]);

export type Demo2Day = Readonly<{
  label: string;
  city: string;
  status: "operator-catalogue" | "another-professional" | "open";
  note: string;
  tourId?: string;
}>;

export const DEMO2_DAYS: readonly Demo2Day[] = Object.freeze([
  {
    label: "Day 1",
    city: "Seville",
    status: "operator-catalogue",
    note: "A published possibility from the operator's own catalogue.",
    tourId: "alcazar",
  },
  {
    label: "Day 2",
    city: "Granada",
    status: "another-professional",
    note: "The operator publishes a private day trip from Seville. A day based in Granada may suit another professional instead. Both stay open.",
    tourId: "granada",
  },
  { label: "Day 3", city: "Not decided", status: "open", note: "Nothing proposed. The traveller has not said." },
  { label: "Day 4", city: "Not decided", status: "open", note: "Nothing proposed. The traveller has not said." },
]);

export const DEMO2_BLOCKING_UNKNOWNS: readonly string[] = Object.freeze([
  "Which nights are in Seville and which are in Granada",
  "Final party size — two, or three if the relative joins",
  "Who is responsible for monument tickets",
  "Who is responsible for transport between cities",
  "Where the travellers are staying in each city",
  "Whether each service is contracted separately",
  "Price — still open",
  "Availability — still open",
]);

export type Demo2ActionBrief = Readonly<{
  travellerSaid: readonly string[];
  carlosMayHandle: readonly string[];
  mayNeedAnother: readonly string[];
  stillUnknown: readonly string[];
  hasNotHappened: readonly string[];
}>;

export const DEMO2_ACTION_BRIEF: Demo2ActionBrief = Object.freeze({
  travellerSaid: [
    "Two adults, a relative may join",
    "14–18 October",
    "Seville and Granada",
    "History and food",
    "Relaxed pace",
    "Private if possible",
  ],
  carlosMayHandle: [
    "The Seville day, from his own published catalogue",
    "The published private day trip from Seville to Granada",
    "Advice on pace and sequencing",
  ],
  mayNeedAnother: [
    "A day based in Granada rather than travelling from Seville",
    "Transport between cities, if the traveller wants it arranged",
  ],
  stillUnknown: [
    "Exact city per night",
    "Final party size",
    "Ticket and transport responsibility",
    "Budget for the whole journey",
  ],
  hasNotHappened: [
    "No booking created",
    "No bespoke price produced",
    "Availability not confirmed",
    "Nothing sent to anyone",
    "No partnership implied",
  ],
});

export const DEMO2_OPERATOR_ACTIONS: readonly string[] = Object.freeze([
  "Potentially relevant",
  "Ask one question",
  "Not for us",
  "Find another professional",
]);

/**
 * The repository holds no permissioned Granada operator record, so the candidate
 * is labelled a concept rather than named. Adding a real operator requires a
 * recorded permission, source URL and capture date.
 */
export type Demo2Candidate = Readonly<{
  label: string;
  destination: string;
  capability: string;
  languages: string;
  requiresConfirmation: readonly string[];
  grounded: boolean;
}>;

export const DEMO2_CANDIDATE: Demo2Candidate = Object.freeze({
  label: "Granada professional · concept only",
  destination: "Granada",
  capability: "Concept capability: guided history in Granada",
  languages: "Languages not verified",
  requiresConfirmation: [
    "Whether they work these dates",
    "Whether they offer a private format",
    "What they charge, and on what basis",
    "Whether they hold monument tickets",
  ],
  grounded: false,
});

export const DEMO2_OPPORTUNITY_FIELDS: readonly { label: string; value: string }[] = Object.freeze([
  { label: "Destination", value: "Granada" },
  { label: "Date window", value: "14–18 October" },
  { label: "Party", value: "Two adults, a relative may join" },
  { label: "Interests", value: "History, local food" },
  { label: "Pace", value: "Relaxed" },
  { label: "Open questions", value: "Exact day, private format, ticket responsibility" },
]);

export const DEMO2_CONCEPT_ACTIONS: readonly string[] = Object.freeze([
  "Potentially relevant",
  "Need one detail",
  "Not for us",
  "Suggest another professional",
]);

export const DEMO2_SHARED: readonly string[] = Object.freeze([
  "Date window",
  "Party size",
  "Relevant interests",
  "Private preference",
  "Pace preference",
  "Traveller-reviewed wording",
  "Relevant unanswered questions",
]);

export const DEMO2_NOT_SHARED: readonly string[] = Object.freeze([
  "Payment details",
  "Passport or identification information",
  "Unrelated Trip Plan items",
  "Private operator notes",
  "Other operator conversations",
]);

export type Demo2Receipt = Readonly<{ label: string; value: string }[]>;

/** Versioned, correctable, and explicitly not transmitted. Never described as immutable. */
export function buildDemo2Receipt(preparedAt: string): Demo2Receipt {
  return [
    { label: "Initiated by", value: "Seville Tours Co. operator context" },
    { label: "Prepared for", value: "Granada professional · concept only" },
    { label: "Purpose", value: "Review a Granada day within an existing journey" },
    { label: "Journey Brief", value: "Version 3" },
    { label: "Prepared at", value: preparedAt },
    { label: "Booking", value: "No booking created" },
    { label: "Availability", value: "Availability not confirmed" },
    { label: "Price", value: "No price quoted" },
    { label: "Commercial arrangement", value: "None recorded" },
    { label: "Transmission", value: "No transmission performed" },
  ];
}

export const DEMO2_RECEIPT_EXAMPLE_TIMESTAMP = "2026-09-21 10:14 Europe/Madrid (example)";

export const DEMO2_COMMERCIAL_QUESTIONS: readonly string[] = Object.freeze([
  "Who remains the lead contact for the traveller?",
  "Who produces the quote?",
  "Who contracts with the traveller?",
  "Who receives payment?",
  "Is there a referral fee?",
  "Is there reciprocal business?",
  "Which booking system holds each service?",
  "Who handles changes on the day?",
]);

export function demo2DayTour(tours: readonly MarcoTour[], day: Demo2Day): MarcoTour | undefined {
  return day.tourId ? tours.find((tour) => tour.id === day.tourId) : undefined;
}
