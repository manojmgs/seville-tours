import type {
  InterestAnswer,
  JourneyBrief,
  JourneyBriefField,
  JourneyBriefFieldOrigin,
  JourneyBriefInput,
  PartyType,
  TimingPreference,
  TourFormat,
  WalkingPreference,
} from "@/components/marco-chat/types";

/**
 * Pure Journey Brief derivation.
 *
 * Turns controlled, already-collected inputs into a session-level Journey Brief.
 * This is domain foundation only — it never fetches, prices, checks availability,
 * infers suitability, invents a tour combination, creates a lead, or persists
 * anything. Anything it can't confirm is marked `requiresConfirmation` or left for
 * the operator, never guessed.
 */

function field<T>(value: T, origin: JourneyBriefFieldOrigin): JourneyBriefField<T> {
  return { value, origin };
}

function dedupe<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

function deriveFormat(input: JourneyBriefInput): JourneyBriefField<TourFormat> {
  if (input.format) return field(input.format, "travellerProvided");
  return field("undecided", "controlledDerived");
}

function derivePartyType(input: JourneyBriefInput): JourneyBriefField<PartyType> {
  if (input.answers?.group) return field(input.answers.group, "travellerSelected");
  return field("unspecified", "controlledDerived");
}

/**
 * Explicit `interests` (e.g. lifted from free text) take precedence over the
 * single decision-tree chip pick — history and food stay separate entries, never
 * merged into one combined product.
 */
function deriveInterests(input: JourneyBriefInput): JourneyBriefField<InterestAnswer>[] {
  if (input.interests && input.interests.length > 0) {
    return dedupe(input.interests).map((interest) => field(interest, "travellerProvided"));
  }
  if (input.answers?.interest) {
    return [field(input.answers.interest, "travellerSelected")];
  }
  return [];
}

function deriveWalkingPreference(input: JourneyBriefInput): JourneyBriefField<WalkingPreference> {
  if (input.walkingPreference) return field(input.walkingPreference, "travellerProvided");
  return field("unspecified", "controlledDerived");
}

function deriveTimingPreference(input: JourneyBriefInput): JourneyBriefField<TimingPreference> {
  if (input.timingPreference) return field(input.timingPreference, "travellerProvided");
  return field("unspecified", "controlledDerived");
}

/** A relative date phrase ("this Friday") is never resolved here — only marked. */
function deriveDate(input: JourneyBriefInput): JourneyBriefField<string> | undefined {
  if (!input.dateText) return undefined;
  return field(input.dateText, "requiresConfirmation");
}

function deriveOpenQuestions(
  format: JourneyBriefField<TourFormat>,
  date: JourneyBriefField<string> | undefined,
): string[] {
  const questions: string[] = [];
  if (format.value === "undecided") {
    questions.push("Is this a private or group experience?");
  }
  if (date?.origin === "requiresConfirmation") {
    questions.push(`Confirm the exact date for "${date.value}".`);
  }
  return questions;
}

export function deriveJourneyBrief(input: JourneyBriefInput): JourneyBrief {
  const format = deriveFormat(input);
  const interests = deriveInterests(input);
  const date = deriveDate(input);

  return {
    locale: input.locale,
    destination: field(input.destination, "controlledDerived"),
    date,
    format,
    partyType: derivePartyType(input),
    partySize: input.partySize ? field(input.partySize, "travellerProvided") : undefined,
    interests,
    walkingPreference: deriveWalkingPreference(input),
    timingPreference: deriveTimingPreference(input),
    tourIds: input.selectedTourIds ? dedupe(input.selectedTourIds) : [],
    openQuestions: deriveOpenQuestions(format, date),
    operatorConfirmations: input.operatorConfirmations
      ? dedupe(input.operatorConfirmations)
      : [],
  };
}
