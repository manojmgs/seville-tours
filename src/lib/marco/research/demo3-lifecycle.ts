import { PARAUSTED_ALCAZAR_FIXED_GIFT_CARD } from "@/lib/parausted/gift-cards";

/**
 * Demo 3 — gift, remember, refer and return.
 *
 * Built facts are stated as built; everything else is labelled future direction.
 * Nothing here implies network stored value, settlement, resale or reward points.
 */

export type Demo3Stage =
  | "completed"
  | "foundation"
  | "giftForward"
  | "memory"
  | "vision"
  | "whyItMatters";

export const DEMO3_STAGES: readonly { id: Demo3Stage; label: string }[] = Object.freeze([
  { id: "completed", label: "The experience is over" },
  { id: "foundation", label: "What exists today" },
  { id: "giftForward", label: "Giving it to someone else" },
  { id: "memory", label: "Something to keep" },
  { id: "vision", label: "Future product direction" },
  { id: "whyItMatters", label: "Why this may matter" },
]);

export const DEMO3_COMPLETED_STATE: readonly string[] = Object.freeze([
  "The experience is complete",
  "No automatic marketing",
  "No automatic public sharing",
  "No inferred preference",
  "The traveller chooses what happens next",
]);

export const DEMO3_BUILT_FACTS: readonly string[] = Object.freeze([
  "Operator-specific gift-card acquisition",
  `Fixed Alcázar gift card · €${PARAUSTED_ALCAZAR_FIXED_GIFT_CARD.amountEur} · 365 days validity`,
  "ParaUsted is the voucher authority: issuance, payment, balance, validity, delivery, redemption",
  "Read-only advisory verification, which can never redeem",
  "Manual V1 redemption: the operator redeems and books the seat",
  "FareHarbor remains the booking and seat-capacity authority",
]);

export const DEMO3_GIFT_TRUTHS: readonly string[] = Object.freeze([
  "Buying the gift card is not booking a date",
  "The gift card does not confirm availability",
  "Redemption and booking are separate steps",
  "Seville Tours does not create a second voucher ledger",
]);

export const DEMO3_GIFT_FORWARD: readonly string[] = Object.freeze([
  "The buyer and the recipient are different people",
  "The recipient decides whether and when to look",
  "No future date is selected",
  "The operator confirms availability through the normal booking process",
]);

export const DEMO3_VISION_STEPS: readonly string[] = Object.freeze([
  "The traveller leaves a review, if they choose to",
  "The traveller shares the experience, if they choose to",
  "The traveller gifts the experience to someone else",
  "A referred traveller discovers the operator",
  "The introduction stays attributable",
  "A future journey begins",
]);

export const DEMO3_BEFORE: readonly string[] = Object.freeze([
  "Review requests are manual",
  "Referrals are hard to attribute",
  "Gift cards need promoting",
  "Previous travellers disappear",
  "Post-tour memories are scattered",
]);

export const DEMO3_DIRECTION: readonly string[] = Object.freeze([
  "One permission-based continuation",
  "The operator gift card stays authoritative",
  "The traveller can gift or return",
  "Referrals can stay attributable",
  "A meaningful memory can lead back to the operator",
]);

export const DEMO3_VISION_LABEL = "Future product direction · Not available today";

/** Deliberately absent from the demo. Asserted by tests so nobody adds them quietly. */
export const DEMO3_EXCLUDED_CONCEPTS: readonly string[] = Object.freeze([
  "reward points",
  "wallet balance",
  "automatic discount",
  "network gift card",
  "cross-operator settlement",
  "voucher resale",
  "guaranteed reciprocal business",
]);
