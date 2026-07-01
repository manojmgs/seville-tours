import type {
  DurationAnswer,
  GroupAnswer,
  InterestAnswer,
  MarcoAnswers,
  QuickReply,
} from "./types";
import type { ChatCopy } from "./chat-copy";

/**
 * Pure decision-tree logic for Marco. No React, no side effects, no I/O.
 *
 * The tree is intentionally tiny and deterministic: three questions map to one or
 * two tour ids. This keeps recommendations auditable and testable, and removes any
 * dependency on an AI API.
 */

/** Question copy + tappable options, in ask order. */
export const MARCO_QUESTIONS = {
  duration: {
    prompt: "How long are you in {destination}?",
    options: [
      { label: "Just a few hours", value: "few-hours" },
      { label: "1–2 days", value: "1-2-days" },
      { label: "3+ days", value: "3-plus" },
      { label: "Day trip from elsewhere", value: "day-trip" },
    ] as ReadonlyArray<{ label: string; value: DurationAnswer }>,
  },
  interest: {
    prompt: "What draws you to {region}?",
    options: [
      { label: "History & architecture", value: "history" },
      { label: "Food & wine", value: "food" },
      { label: "A day trip further afield", value: "daytrip" },
      { label: "Surprise me", value: "surprise" },
    ] as ReadonlyArray<{ label: string; value: InterestAnswer }>,
  },
  group: {
    prompt: "And who's travelling?",
    options: [
      { label: "Just me", value: "solo" },
      { label: "A couple", value: "couple" },
      { label: "Family with kids", value: "family" },
      { label: "A group", value: "group" },
    ] as ReadonlyArray<{ label: string; value: GroupAnswer }>,
  },
} as const;

/**
 * Map a complete (or partial) set of answers to 1–2 tour ids.
 *
 * Order of checks is significant: a day-trip interest wins over everything, then
 * food, then a short stay, then families, then a history lean, with a sensible
 * default for anyone else.
 */
export function recommend({ duration, interest, group }: MarcoAnswers): string[] {
  if (interest === "daytrip") return ["granada", "cordoba"];
  if (interest === "food") return ["tapas", "highlights"];
  if (duration === "few-hours") return ["alcazar", "cathedral"];
  if (group === "family") return ["highlights", "alcazar"];
  if (interest === "history") return ["alcazar", "cathedral"];
  return ["highlights", "alcazar"];
}

/** Localized label for a single decision-tree answer value. */
function labelFor(
  step: "duration" | "interest" | "group",
  value: string,
  copy: ChatCopy,
): string {
  switch (step) {
    case "duration":
      return copy.durationLabels[value as DurationAnswer] ?? value;
    case "interest":
      return copy.interestLabels[value as InterestAnswer] ?? value;
    case "group":
      return copy.groupLabels[value as GroupAnswer] ?? value;
  }
}

/** Quick-reply chips for the current step, labelled in the guest's language. */
export function quickRepliesFor(
  step: "duration" | "interest" | "group",
  copy: ChatCopy,
): QuickReply[] {
  return MARCO_QUESTIONS[step].options.map((option) => ({
    label: labelFor(step, option.value, copy),
    value: option.value,
  }));
}

/** Look up the label a guest tapped, for echoing back as their message bubble. */
export function labelForAnswer(
  step: "duration" | "interest" | "group",
  value: string,
  copy: ChatCopy,
): string {
  return labelFor(step, value, copy);
}
