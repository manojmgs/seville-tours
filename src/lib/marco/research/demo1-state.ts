/**
 * Demo 1 — deterministic enquiry state for the Carlos research demos.
 *
 * Follows the trusted TIS playback grammar deliberately: a short slot-filling
 * conversation with a one-line acknowledgement per answer, then a deciding phase
 * where everything else is offered rather than demanded. Independent of
 * `tis-conversation-state` by design, so this route stays disposable.
 */

export type Demo1SlotId = "language" | "party" | "dates" | "interests" | "format";

export type Demo1Choice = Readonly<{ value: string; label: string }>;

export type Demo1Question = Readonly<{
  slot: Demo1SlotId;
  prompt: string;
  choices: readonly Demo1Choice[];
  multi?: boolean;
}>;

export type Demo1Answers = Readonly<Partial<Record<Demo1SlotId, readonly string[]>>>;

export type Demo1Turn = Readonly<{ id: string; speaker: "marco" | "traveller"; text: string }>;

export type Demo1Phase = "asking" | "deciding";

export type Demo1Contact = Readonly<{ name: string; email: string; phone: string }>;

export type Demo1Enquiry = Readonly<{ contact: Demo1Contact; operator: string; at: string }>;

export type Demo1State = Readonly<{
  answers: Demo1Answers;
  turns: readonly Demo1Turn[];
  phase: Demo1Phase;
  /** Optional details the traveller volunteered. Never asked as a required question. */
  extras: readonly string[];
  savedTourIds: readonly string[];
  dismissedTourIds: readonly string[];
  privateVersionAsks: readonly string[];
  operatorQuestions: readonly string[];
  chosenOperator: string | null;
  enquiry: Demo1Enquiry | null;
}>;

export type Demo1Action =
  | { kind: "answer"; slot: Demo1SlotId; values: readonly string[] }
  | { kind: "addExtra"; label: string }
  | { kind: "saveTour"; tourId: string }
  | { kind: "dismissTour"; tourId: string }
  | { kind: "askPrivateVersion"; tourName: string }
  | { kind: "askOperator"; label: string }
  | { kind: "chooseOperator"; operator: string }
  | { kind: "prepareEnquiry"; contact: Demo1Contact; operator: string; at: string }
  | { kind: "reset" };

export const DEMO1_QUESTIONS: readonly Demo1Question[] = Object.freeze([
  {
    slot: "language",
    prompt: "Which language would you like this in?",
    choices: [
      { value: "en", label: "English" },
      { value: "es", label: "Español" },
      { value: "fr", label: "Français" },
    ],
  },
  {
    slot: "party",
    prompt: "Who is travelling?",
    choices: [
      { value: "solo", label: "Just me" },
      { value: "two", label: "Two of us" },
      { value: "two-plus", label: "Two of us, a relative may join" },
      { value: "family", label: "Family with children" },
    ],
  },
  {
    slot: "dates",
    prompt: "When are you thinking of coming?",
    choices: [
      { value: "specific", label: "We have specific dates" },
      { value: "window", label: "A rough window" },
      { value: "undecided", label: "Not decided yet" },
    ],
  },
  {
    slot: "interests",
    prompt: "What pulls you? Choose as many as you like.",
    multi: true,
    choices: [
      { value: "history", label: "History" },
      { value: "food", label: "Local food" },
      { value: "architecture", label: "Architecture" },
      { value: "dayTrip", label: "Day trips" },
      { value: "slowPace", label: "A relaxed pace" },
    ],
  },
  {
    slot: "format",
    prompt: "How do you prefer to travel?",
    choices: [
      { value: "smallGroup", label: "A small group is fine" },
      { value: "private", label: "Private, if available" },
      { value: "bespoke", label: "Built around us" },
    ],
  },
]);

/** One short acknowledgement per answer, in the playback's voice. */
const MARCO_REPLIES: Readonly<Record<string, string>> = Object.freeze({
  "language:en": "English it is.",
  "language:es": "Perfecto — la petición saldrá en español.",
  "language:fr": "Entendu — la demande partira en français.",
  "party:solo": "Noted — one traveller.",
  "party:two": "Noted — two travellers.",
  "party:two-plus": "Noted. I will record that the party size is not final.",
  "party:family": "Noted. Some monuments have age rules the operator will confirm.",
  "dates:specific": "Good. I will not check availability — the operator does that.",
  "dates:window": "A window is enough to start. The exact date stays open.",
  "dates:undecided": "That is fine. I will leave the date open in your brief.",
  "format:smallGroup": "That opens up operator-published experiences.",
  "format:private": "Private is a preference, not a product. An operator has to confirm it.",
  "format:bespoke": "Something built around you always needs an operator to design it.",
});

/** Offered after the brief, never asked. The traveller adds only what they want to. */
export const DEMO1_EXTRAS: readonly Demo1Choice[] = Object.freeze([
  { value: "afternoon", label: "We only have one free afternoon" },
  { value: "stay", label: "We are staying in Santa Cruz" },
  { value: "walking", label: "We prefer limited walking" },
  { value: "dinner", label: "We would like dinner afterwards" },
  { value: "tickets", label: "We have no tickets yet" },
  { value: "budget", label: "Comfortable, not extravagant" },
]);

/** Off-catalogue asks. These stay questions for the operator and never become products. */
export const DEMO1_OFF_CATALOGUE_ASKS: readonly Demo1Choice[] = Object.freeze([
  { value: "hotel", label: "Somewhere to stay next time" },
  { value: "airport", label: "Airport pickup" },
  { value: "driver", label: "A private driver for a day" },
  { value: "dinner", label: "Where to eat locally" },
  { value: "event", label: "Something on while we are here" },
]);

export const DEMO1_INITIAL_STATE: Demo1State = Object.freeze({
  answers: {},
  turns: [
    Object.freeze({
      id: "demo1-open",
      speaker: "marco" as const,
      text: "Tell me about your time in Seville. A few taps is enough — nothing is booked, sent or checked here.",
    }),
  ],
  phase: "asking",
  extras: [],
  savedTourIds: [],
  dismissedTourIds: [],
  privateVersionAsks: [],
  operatorQuestions: [],
  chosenOperator: null,
  enquiry: null,
});

export function createDemo1State(): Demo1State {
  return DEMO1_INITIAL_STATE;
}

export function nextDemo1Question(state: Demo1State): Demo1Question | null {
  return DEMO1_QUESTIONS.find((question) => !state.answers[question.slot]) ?? null;
}

export function demo1ChoiceLabel(slot: Demo1SlotId, value: string): string {
  const question = DEMO1_QUESTIONS.find((entry) => entry.slot === slot);
  return question?.choices.find((choice) => choice.value === value)?.label ?? value;
}

function labelsFor(state: Demo1State, slot: Demo1SlotId): string[] {
  return (state.answers[slot] ?? []).map((value) => demo1ChoiceLabel(slot, value));
}

function acknowledgement(slot: Demo1SlotId, values: readonly string[]): string {
  if (slot === "interests") return "Noted. I will only look at what an operator has actually published.";
  return MARCO_REPLIES[`${slot}:${values[0]}`] ?? "Noted.";
}

export function transitionDemo1(state: Demo1State, action: Demo1Action): Demo1State {
  switch (action.kind) {
    case "reset":
      return DEMO1_INITIAL_STATE;

    case "answer": {
      const answers = { ...state.answers, [action.slot]: action.values };
      const next = { ...state, answers };
      const question = nextDemo1Question(next);
      const spoken = action.values.map((value) => demo1ChoiceLabel(action.slot, value)).join(", ");

      return {
        ...next,
        phase: question ? "asking" : "deciding",
        turns: [
          ...state.turns,
          { id: `demo1-${action.slot}`, speaker: "traveller", text: spoken },
          { id: `demo1-${action.slot}-ack`, speaker: "marco", text: acknowledgement(action.slot, action.values) },
          ...(question
            ? []
            : [
                {
                  id: "demo1-deciding",
                  speaker: "marco" as const,
                  text: "That is enough to be useful. Here is what operators publish that fits — add anything else only if you want to.",
                },
              ]),
        ],
      };
    }

    case "addExtra":
      return state.extras.includes(action.label)
        ? state
        : {
            ...state,
            extras: [...state.extras, action.label],
            turns: [
              ...state.turns,
              { id: `demo1-extra-${action.label}`, speaker: "traveller", text: action.label },
            ],
          };

    case "saveTour":
      return state.savedTourIds.includes(action.tourId)
        ? state
        : {
            ...state,
            savedTourIds: [...state.savedTourIds, action.tourId],
            dismissedTourIds: state.dismissedTourIds.filter((id) => id !== action.tourId),
          };

    case "dismissTour":
      return state.dismissedTourIds.includes(action.tourId)
        ? state
        : {
            ...state,
            dismissedTourIds: [...state.dismissedTourIds, action.tourId],
            savedTourIds: state.savedTourIds.filter((id) => id !== action.tourId),
          };

    case "askPrivateVersion":
      return state.privateVersionAsks.includes(action.tourName)
        ? state
        : { ...state, privateVersionAsks: [...state.privateVersionAsks, action.tourName] };

    case "askOperator":
      return state.operatorQuestions.includes(action.label)
        ? state
        : { ...state, operatorQuestions: [...state.operatorQuestions, action.label] };

    case "chooseOperator":
      return { ...state, chosenOperator: action.operator };

    case "prepareEnquiry":
      return {
        ...state,
        enquiry: { contact: action.contact, operator: action.operator, at: action.at },
      };

    default:
      return state;
  }
}

export type Demo1Brief = Readonly<{
  known: readonly string[];
  preferences: readonly string[];
  travellerWords: readonly string[];
  stillOpen: readonly string[];
  askOfOperator: readonly string[];
}>;

export function buildDemo1Brief(state: Demo1State): Demo1Brief {
  const dates = labelsFor(state, "dates");

  return {
    known: [...labelsFor(state, "party"), ...dates, ...state.extras],
    preferences: [...labelsFor(state, "format"), ...labelsFor(state, "language")],
    travellerWords: labelsFor(state, "interests"),
    stillOpen: [
      ...(dates.includes("We have specific dates") ? [] : ["The exact date"]),
      "Whether the date is free",
      "Whether monument tickets are included",
      ...(labelsFor(state, "party").includes("Two of us, a relative may join") ? ["Final party size"] : []),
    ],
    askOfOperator: [
      ...state.privateVersionAsks.map((name) => `A private version of ${name}`),
      ...state.operatorQuestions,
    ],
  };
}

export function demo1StatusLine(state: Demo1State): string {
  const saved = state.savedTourIds.length;
  const savedText =
    saved === 0 ? "nothing saved yet" : `${saved} saved ${saved === 1 ? "possibility" : "possibilities"}`;
  const enquiryText = state.enquiry ? " · enquiry prepared" : " · nothing sent";
  return `Trip Plan · ${savedText} · nothing booked${enquiryText}`;
}
