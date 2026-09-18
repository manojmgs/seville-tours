/**
 * Interactive TIS conversation state.
 *
 * The traveller answers a short sequence of questions — by choosing an option or by
 * typing in their own words — and the Journey Brief assembles from those answers.
 * Nothing here invents a price, availability, itinerary, package or operator
 * commitment, and nothing enters the Trip Plan without a deliberate traveller action.
 */

export type TisSlotId = "party" | "dates" | "flexibility" | "format" | "interests";

export type TisPhase = "gathering" | "deciding" | "handover";

export type TisChoice = Readonly<{ value: string; label: string }>;

export type TisQuestion = Readonly<{
  id: TisSlotId;
  prompt: string;
  multiSelect: boolean;
  choices: readonly TisChoice[];
}>;

export type TisTurn = Readonly<{
  id: string;
  speaker: "traveller" | "marco";
  text: string;
  /** Free text the traveller typed. Preserved exactly; never interpreted. */
  verbatim?: boolean;
}>;

// Trip Plan: what the traveller deliberately collected, distinct from the Journey Brief.
export type TisTripPlanItemStatus = "savedPossibility" | "requestInPreparation";
export type TisTripPlanItemKind = "experience" | "privateRequest" | "opportunity" | "arrangementRequest";

export type TisTripPlanItem = Readonly<{
  id: string;
  kind: TisTripPlanItemKind;
  status: TisTripPlanItemStatus;
  /** Set for saved experiences; identifies the operator-published tour. */
  tourId?: string;
  /** Set for saved ecosystem opportunities; identifies the illustrative demo record. */
  opportunityId?: string;
  /** Set for arrangement requests; what the traveller asked the operator to look into. */
  label?: string;
}>;

export const TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID = "private-seville-request";

export type TisContactDetails = Readonly<{ name: string; email: string; phone: string }>;

export type TisEnquiry = Readonly<{ contact: TisContactDetails; sentAt: string }>;

export type TisSavedJourney = Readonly<{ reference: string; savedAt: string }>;

export function experienceItemId(tourId: string): string {
  return `experience:${tourId}`;
}

export function opportunityItemId(opportunityId: string): string {
  return `opportunity:${opportunityId}`;
}

export function arrangementItemId(requestId: string): string {
  return `arrangement:${requestId}`;
}

/**
 * Things travellers ask for that no catalogue here lists. We do not source, price or arrange
 * any of them — the request is passed to the operator, who says what is actually possible.
 */
export const TIS_ARRANGEMENT_REQUESTS: readonly TisChoice[] = Object.freeze([
  { value: "spa", label: "Spa and wellness" },
  { value: "airportPickup", label: "Airport pickup" },
  { value: "privateDriver", label: "Private driver for a day" },
  { value: "boat", label: "Boat or yacht" },
  { value: "golf", label: "Golf" },
  { value: "photographer", label: "Photographer" },
  { value: "childcare", label: "Childcare or babysitting" },
  { value: "accessibleTransport", label: "Accessible transport" },
  { value: "restaurantBooking", label: "A hard-to-book table" },
]);

export type TisAnswers = Readonly<{
  party: string | null;
  dates: string | null;
  flexibility: string | null;
  format: string | null;
  interests: readonly string[];
}>;

export type TisConversationState = Readonly<{
  answers: TisAnswers;
  /** Free-text notes, stored exactly as typed. */
  ownWords: readonly string[];
  /** Extras the traveller wants the operator to advise on. We arrange none of them. */
  operatorAsks: readonly string[];
  /** Opportunities the traveller saved or waved away, so neither is offered twice. */
  handledOpportunities: readonly string[];
  turns: readonly TisTurn[];
  phase: TisPhase;
  tripPlanItems: readonly TisTripPlanItem[];
  privateRequestDismissed: boolean;
  tripPlanAnnouncement: string | null;
  /** Set only when the traveller deliberately saves the journey. */
  savedJourney: TisSavedJourney | null;
  /** Set only when the traveller deliberately sends the enquiry. */
  enquiry: TisEnquiry | null;
}>;

export type TisConversationAction =
  | Readonly<{ type: "answer"; slot: TisSlotId; value: string }>
  | Readonly<{ type: "confirmInterests" }>
  | Readonly<{ type: "addOwnWords"; text: string }>
  | Readonly<{ type: "toggleOperatorAsk"; value: string }>
  | Readonly<{ type: "addSavedPossibility"; tourId: string }>
  | Readonly<{ type: "saveOpportunity"; opportunityId: string; title: string }>
  | Readonly<{ type: "dismissOpportunity"; opportunityId: string }>
  | Readonly<{ type: "requestArrangement"; requestId: string; label: string }>
  | Readonly<{ type: "preparePrivateRequest" }>
  | Readonly<{ type: "removeTripPlanItem"; id: string }>
  | Readonly<{ type: "reviewHandover" }>
  | Readonly<{ type: "saveJourney"; reference: string; at: string }>
  | Readonly<{ type: "sendEnquiry"; contact: TisContactDetails; at: string }>
  | Readonly<{ type: "backToPlanning" }>
  | "reset";

/**
 * Extras an operator may be able to advise on. We never arrange, price, or combine
 * these — passing the question on is not the same as assembling a package.
 */
export const TIS_OPERATOR_ASK_OPTIONS: readonly TisChoice[] = Object.freeze([
  { value: "stay", label: "Somewhere to stay" },
  { value: "transfers", label: "Getting around" },
  { value: "food", label: "Where to eat" },
  { value: "accessibility", label: "Accessibility needs" },
]);

export function operatorAskLabel(value: string): string {
  return TIS_OPERATOR_ASK_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export const TIS_QUESTIONS: readonly TisQuestion[] = Object.freeze([
  Object.freeze({
    id: "party" as const,
    prompt: "Who is travelling to Seville?",
    multiSelect: false,
    choices: Object.freeze([
      { value: "solo", label: "Just me" },
      { value: "two", label: "Two of us" },
      { value: "family", label: "Family with children" },
      { value: "group", label: "Group of five or more" },
    ]),
  }),
  Object.freeze({
    id: "dates" as const,
    prompt: "When are you thinking of coming?",
    multiSelect: false,
    choices: Object.freeze([
      { value: "specific", label: "I have specific dates" },
      { value: "window", label: "A rough window" },
      { value: "undecided", label: "Not decided yet" },
    ]),
  }),
  Object.freeze({
    id: "flexibility" as const,
    prompt: "How fixed are those dates?",
    multiSelect: false,
    choices: Object.freeze([
      { value: "fixed", label: "Fixed" },
      { value: "dayEither", label: "A day either way" },
      { value: "flexible", label: "Quite flexible" },
    ]),
  }),
  Object.freeze({
    id: "format" as const,
    prompt: "How do you prefer to travel?",
    multiSelect: false,
    choices: Object.freeze([
      { value: "smallGroup", label: "A small group is fine" },
      { value: "private", label: "Private, if available" },
      { value: "bespoke", label: "Built around us" },
    ]),
  }),
  Object.freeze({
    id: "interests" as const,
    prompt: "What pulls you? Choose as many as you like.",
    multiSelect: true,
    choices: Object.freeze([
      { value: "history", label: "History" },
      { value: "food", label: "Local food" },
      { value: "architecture", label: "Architecture" },
      { value: "nature", label: "Nature and landscape" },
      { value: "dayTrip", label: "Day trips" },
      { value: "localLife", label: "Local life" },
      { value: "slowPace", label: "A relaxed pace" },
    ]),
  }),
]);

const LABELS: Readonly<Record<string, string>> = Object.freeze(
  TIS_QUESTIONS.reduce<Record<string, string>>((acc, question) => {
    for (const choice of question.choices) acc[`${question.id}:${choice.value}`] = choice.label;
    return acc;
  }, {}),
);

export function choiceLabel(slot: TisSlotId, value: string): string {
  return LABELS[`${slot}:${value}`] ?? value;
}

const MARCO_REPLIES: Readonly<Record<string, string>> = Object.freeze({
  "party:solo": "Noted — one traveller.",
  "party:two": "Noted — two travellers.",
  "party:family": "Noted. Some monuments have age rules the operator will confirm.",
  "party:group": "Noted. Group size can change what an operator is able to offer.",
  "dates:specific": "Good. I will not check availability — the operator does that.",
  "dates:window": "A window is enough to start. The exact date stays open.",
  "dates:undecided": "That is fine. I will leave the date open in your brief.",
  "flexibility:fixed": "Fixed dates noted.",
  "flexibility:dayEither": "A day either way gives the operator room.",
  "flexibility:flexible": "Flexible dates noted.",
  "format:smallGroup": "That opens up operator-published experiences.",
  "format:private": "Private is a preference, not a product. An operator has to confirm it.",
  "format:bespoke": "Something built around you always needs an operator to design it.",
});

export const TIS_INITIAL_CONVERSATION_STATE: TisConversationState = Object.freeze({
  answers: Object.freeze({
    party: null,
    dates: null,
    flexibility: null,
    format: null,
    interests: Object.freeze([]),
  }),
  ownWords: Object.freeze([]),
  operatorAsks: Object.freeze([]),
  handledOpportunities: Object.freeze([]),
  turns: Object.freeze([
    Object.freeze({
      id: "turn-0",
      speaker: "marco" as const,
      text: "Tell me about your trip to Seville. Choose an answer, or type in your own words — I keep what you write exactly as you write it.",
    }),
  ]),
  phase: "gathering" as const,
  tripPlanItems: Object.freeze([]),
  privateRequestDismissed: false,
  tripPlanAnnouncement: null,
  savedJourney: null,
  enquiry: null,
});

export function createInitialTisConversationState(): TisConversationState {
  return TIS_INITIAL_CONVERSATION_STATE;
}

/** Flexibility is skipped when there are no dates to be flexible about. */
function isSlotRequired(slot: TisSlotId, answers: TisAnswers): boolean {
  if (slot === "flexibility") return answers.dates !== null && answers.dates !== "undecided";
  return true;
}

export function nextQuestion(state: TisConversationState): TisQuestion | null {
  if (state.phase !== "gathering") return null;
  for (const question of TIS_QUESTIONS) {
    if (!isSlotRequired(question.id, state.answers)) continue;
    if (question.id === "interests") return question;
    if (state.answers[question.id] === null) return question;
  }
  return null;
}

function appendTurns(
  turns: readonly TisTurn[],
  ...next: readonly Omit<TisTurn, "id">[]
): readonly TisTurn[] {
  const appended = next.map((turn, index) =>
    Object.freeze({ ...turn, id: `turn-${turns.length + index + 1}` }),
  );
  return Object.freeze([...turns, ...appended]);
}

function withAnswer(state: TisConversationState, slot: TisSlotId, value: string): TisConversationState {
  if (slot === "interests") {
    const interests = state.answers.interests.includes(value)
      ? state.answers.interests.filter((item) => item !== value)
      : [...state.answers.interests, value];
    return Object.freeze({
      ...state,
      answers: Object.freeze({ ...state.answers, interests: Object.freeze(interests) }),
    });
  }

  const reply = MARCO_REPLIES[`${slot}:${value}`];
  return Object.freeze({
    ...state,
    answers: Object.freeze({ ...state.answers, [slot]: value }),
    turns: appendTurns(
      state.turns,
      { speaker: "traveller", text: choiceLabel(slot, value) },
      ...(reply ? [{ speaker: "marco" as const, text: reply }] : []),
    ),
  });
}

const PRIVATE_REQUEST_TRIP_PLAN_ITEM: TisTripPlanItem = Object.freeze({
  id: TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID,
  kind: "privateRequest",
  status: "requestInPreparation",
});

const QUESTION_OPENERS: readonly string[] = Object.freeze([
  "is ", "are ", "was ", "can ", "could ", "do ", "does ", "did ", "will ", "would ",
  "should ", "what", "when", "where", "which", "who", "why", "how", "any ",
]);

/**
 * Recognising that a sentence is a question is not the same as interpreting what it means.
 * The text is still stored verbatim and still passed on — we only decline to answer it ourselves.
 */
export function looksLikeQuestion(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  if (trimmed.length === 0) return false;
  if (trimmed.endsWith("?")) return true;
  return QUESTION_OPENERS.some((opener) => trimmed.startsWith(opener));
}

export const TIS_VERBATIM_REPLY =
  "Kept in your own words. The operator reads it exactly as you wrote it.";

export const TIS_UNVERIFIED_REPLY =
  "I don't have verified information for that, so I won't guess. I've kept your question exactly as you wrote it, and the operator answers it.";

export function transitionTisConversation(
  state: TisConversationState,
  action: TisConversationAction,
): TisConversationState {
  if (action === "reset") return createInitialTisConversationState();

  switch (action.type) {
    case "answer":
      if (state.phase !== "gathering") return state;
      return withAnswer(state, action.slot, action.value);

    case "confirmInterests": {
      if (state.phase !== "gathering" || state.answers.interests.length === 0) return state;
      const chosen = state.answers.interests.map((value) => choiceLabel("interests", value)).join(", ");
      return Object.freeze({
        ...state,
        phase: "deciding",
        turns: appendTurns(
          state.turns,
          { speaker: "traveller", text: chosen },
          {
            speaker: "marco",
            text: "Here is what I understood, with what operators publish that matches it. I have not checked availability and I have not created a price.",
          },
        ),
      });
    }

    case "addOwnWords": {
      const text = action.text.trim();
      if (text.length === 0) return state;
      return Object.freeze({
        ...state,
        ownWords: Object.freeze([...state.ownWords, text]),
        turns: appendTurns(
          state.turns,
          { speaker: "traveller", text, verbatim: true },
          {
            speaker: "marco",
            text: looksLikeQuestion(text) ? TIS_UNVERIFIED_REPLY : TIS_VERBATIM_REPLY,
          },
        ),
      });
    }

    case "toggleOperatorAsk": {
      const chosen = state.operatorAsks.includes(action.value);
      const operatorAsks = chosen
        ? state.operatorAsks.filter((item) => item !== action.value)
        : [...state.operatorAsks, action.value];
      return Object.freeze({ ...state, operatorAsks: Object.freeze(operatorAsks) });
    }

    case "addSavedPossibility": {
      const id = experienceItemId(action.tourId);
      if (state.tripPlanItems.some((item) => item.id === id)) return state;
      const saved: TisTripPlanItem = Object.freeze({
        id,
        kind: "experience",
        status: "savedPossibility",
        tourId: action.tourId,
      });
      return Object.freeze({
        ...state,
        tripPlanItems: Object.freeze([...state.tripPlanItems, saved]),
        tripPlanAnnouncement: "Added as a possibility. Nothing has been booked.",
      });
    }

    case "saveOpportunity": {
      const id = opportunityItemId(action.opportunityId);
      if (state.tripPlanItems.some((item) => item.id === id)) return state;
      const saved: TisTripPlanItem = Object.freeze({
        id,
        kind: "opportunity",
        status: "savedPossibility",
        opportunityId: action.opportunityId,
      });
      return Object.freeze({
        ...state,
        tripPlanItems: Object.freeze([...state.tripPlanItems, saved]),
        handledOpportunities: Object.freeze([...state.handledOpportunities, action.opportunityId]),
        turns: appendTurns(
          state.turns,
          { speaker: "traveller", text: `Save that — ${action.title}` },
          {
            speaker: "marco",
            text: "Added as a possibility. Nobody has been contacted and nothing is held.",
          },
        ),
        tripPlanAnnouncement: "Added as a possibility. Nothing has been booked.",
      });
    }

    case "dismissOpportunity": {
      if (state.handledOpportunities.includes(action.opportunityId)) return state;
      return Object.freeze({
        ...state,
        handledOpportunities: Object.freeze([...state.handledOpportunities, action.opportunityId]),
      });
    }

    case "requestArrangement": {
      const id = arrangementItemId(action.requestId);
      if (state.tripPlanItems.some((item) => item.id === id)) return state;
      const request: TisTripPlanItem = Object.freeze({
        id,
        kind: "arrangementRequest",
        status: "requestInPreparation",
        label: action.label,
      });
      return Object.freeze({
        ...state,
        tripPlanItems: Object.freeze([...state.tripPlanItems, request]),
        turns: appendTurns(
          state.turns,
          { speaker: "traveller", text: `Can the operator arrange ${action.label.toLowerCase()}?` },
          {
            speaker: "marco",
            text: "I do not have that in any catalogue here, so I will not invent one. I have added it as a question for the operator, who will say what is possible.",
          },
        ),
        tripPlanAnnouncement: "Added as a question for the operator. Nothing has been arranged.",
      });
    }

    case "preparePrivateRequest":
      if (state.tripPlanItems.some((item) => item.id === TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID)) return state;      return Object.freeze({
        ...state,
        tripPlanItems: Object.freeze([...state.tripPlanItems, PRIVATE_REQUEST_TRIP_PLAN_ITEM]),
        privateRequestDismissed: false,
        tripPlanAnnouncement: "Request in preparation. Nothing has been sent.",
      });

    case "removeTripPlanItem":
      if (!state.tripPlanItems.some((item) => item.id === action.id)) return state;
      return Object.freeze({
        ...state,
        tripPlanItems: Object.freeze(state.tripPlanItems.filter((item) => item.id !== action.id)),
        privateRequestDismissed:
          action.id === TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID ? true : state.privateRequestDismissed,
        tripPlanAnnouncement: "Removed from your Trip Plan.",
      });

    case "reviewHandover":
      if (state.phase !== "deciding") return state;
      return Object.freeze({ ...state, phase: "handover" });

    case "saveJourney":
      if (state.savedJourney) return state;
      return Object.freeze({
        ...state,
        savedJourney: Object.freeze({ reference: action.reference, savedAt: action.at }),
        tripPlanAnnouncement: "Journey saved. You can come back to it.",
      });

    case "sendEnquiry":
      if (state.enquiry) return state;
      return Object.freeze({
        ...state,
        enquiry: Object.freeze({ contact: action.contact, sentAt: action.at }),
        tripPlanAnnouncement: "Enquiry prepared for the operator.",
      });

    case "backToPlanning":
      if (state.phase !== "handover") return state;
      return Object.freeze({ ...state, phase: "deciding" });

    default:
      return state;
  }
}

export type TisJourneyBriefDisplay = Readonly<{
  destination: string;
  travellers: string;
  dateStatus: string;
  interests: readonly string[];
  preferences: readonly string[];
  ownWords: readonly string[];
  /** Questions we declined to answer. They travel to the operator unchanged. */
  openQuestions: readonly string[];
  /** Extras the traveller asked the operator to advise on. We arrange none of them. */
  operatorAsks: readonly string[];
}>;

const TRAVELLER_LABEL: Readonly<Record<string, string>> = Object.freeze({
  solo: "One traveller",
  two: "Two adults",
  family: "Family with children",
  group: "Group of five or more",
});

const DATE_LABEL: Readonly<Record<string, string>> = Object.freeze({
  specific: "Specific dates",
  window: "A rough window",
  undecided: "Not decided yet",
});

const FLEXIBILITY_LABEL: Readonly<Record<string, string>> = Object.freeze({
  fixed: "Dates are fixed",
  dayEither: "A day either way",
  flexible: "Quite flexible on dates",
});

const FORMAT_LABEL: Readonly<Record<string, string>> = Object.freeze({
  smallGroup: "A small group is fine",
  private: "Private, if available",
  bespoke: "Built around us, if an operator can",
});

export function buildJourneyBrief(state: TisConversationState): TisJourneyBriefDisplay {
  const preferences: string[] = [];
  if (state.answers.format) preferences.push(FORMAT_LABEL[state.answers.format] ?? state.answers.format);
  if (state.answers.flexibility) {
    preferences.push(FLEXIBILITY_LABEL[state.answers.flexibility] ?? state.answers.flexibility);
  }

  return Object.freeze({
    destination: "Seville",
    travellers: state.answers.party ? (TRAVELLER_LABEL[state.answers.party] ?? state.answers.party) : "Not shared yet",
    dateStatus: state.answers.dates ? (DATE_LABEL[state.answers.dates] ?? state.answers.dates) : "Not shared yet",
    interests: Object.freeze(state.answers.interests.map((value) => choiceLabel("interests", value))),
    preferences: Object.freeze(preferences),
    ownWords: Object.freeze(state.ownWords.filter((words) => !looksLikeQuestion(words))),
    openQuestions: Object.freeze(state.ownWords.filter((words) => looksLikeQuestion(words))),
    operatorAsks: Object.freeze(state.operatorAsks.map(operatorAskLabel)),
  });
}

/** True when the traveller asked for something an operator has to design. */
export function wantsOperatorAttention(state: TisConversationState): boolean {
  return state.answers.format === "private" || state.answers.format === "bespoke";
}

/**
 * Interest chips mapped onto real catalogue tags.
 * "A relaxed pace" has no catalogue tag on purpose — pace is a preference the
 * operator applies, not something we filter a catalogue by.
 */
const INTEREST_TAGS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  history: Object.freeze(["history"]),
  food: Object.freeze(["food", "wine"]),
  architecture: Object.freeze(["architecture"]),
  nature: Object.freeze(["nature", "outdoors", "walking"]),
  dayTrip: Object.freeze(["day trip"]),
  localLife: Object.freeze(["culture", "orientation", "evening"]),
  slowPace: Object.freeze([]),
});

export type TisCatalogueEntry = Readonly<{
  id: string;
  tags: readonly string[];
  /** Destination keywords. Used only to pair the same trip across operators. */
  matchTerms?: readonly string[];
}>;

export type TisRecommendationSelection = Readonly<{
  tourIds: readonly string[];
  /** False when nothing in the catalogue matched, so the UI can say so plainly. */
  matchedOnInterest: boolean;
}>;

/** Ranks the operator's real catalogue against the chosen interests. Invents nothing. */
export function selectRecommendations(
  interests: readonly string[],
  catalogue: readonly TisCatalogueEntry[],
  limit = 3,
  operatorOf?: (id: string) => string,
): TisRecommendationSelection {
  const wanted = new Set(interests.flatMap((interest) => INTEREST_TAGS[interest] ?? []));

  const scored = catalogue
    .map((entry, order) => ({
      id: entry.id,
      order,
      score: entry.tags.filter((tag) => wanted.has(tag)).length,
      matchTerms: entry.matchTerms ?? [],
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order);

  if (scored.length > 0) {
    return Object.freeze({
      tourIds: Object.freeze(pickWithOperatorSpread(scored, limit, operatorOf)),
      matchedOnInterest: true,
    });
  }

  return Object.freeze({
    tourIds: Object.freeze(catalogue.slice(0, limit).map((entry) => entry.id)),
    matchedOnInterest: false,
  });
}

type ScoredEntry = { id: string; order: number; score: number; matchTerms: readonly string[] };

/**
 * Only place names may pair two operators' trips. Activity words like "tapas" or "walking"
 * are shared by completely different products, and claiming those are "the same trip" would
 * be false. Add a term here only when it names somewhere a traveller goes.
 */
const DESTINATION_TERMS: ReadonlySet<string> = new Set([
  "ronda",
  "setenil",
  "zahara",
  "white villages",
  "pueblos blancos",
  "granada",
  "alhambra",
  "generalife",
  "cordoba",
  "mezquita",
  "juderia",
  "caminito",
  "caminito del rey",
  "gaitanes",
  "gibraltar",
  "mijas",
  "alora",
]);

export function sharesDestinationTerm(a: readonly string[], b: readonly string[]): boolean {
  return a.some((term) => DESTINATION_TERMS.has(term) && b.includes(term));
}

const sharesDestination = sharesDestinationTerm;

/**
 * The best match always leads. After that, two operators publishing the *same* destination is
 * both the most useful thing to put in front of a traveller and the clearest proof we do not
 * rank by commercial relationship, so such a pair takes the next slots when one exists.
 * Remaining slots prefer an operator not yet represented.
 */
function pickWithOperatorSpread(
  scored: readonly ScoredEntry[],
  limit: number,
  operatorOf?: (id: string) => string,
): string[] {
  if (!operatorOf || scored.length === 0) return scored.slice(0, limit).map((entry) => entry.id);

  const remaining = [...scored];
  const seenOperators = new Set<string>();
  const picked: ScoredEntry[] = [];

  const take = (entry: ScoredEntry) => {
    picked.push(entry);
    seenOperators.add(operatorOf(entry.id));
    remaining.splice(remaining.indexOf(entry), 1);
  };

  take(remaining[0]);

  const counterpart = remaining.find(
    (entry) =>
      operatorOf(entry.id) !== operatorOf(picked[0].id) &&
      sharesDestination(picked[0].matchTerms, entry.matchTerms),
  );
  if (counterpart) {
    take(counterpart);
  } else if (limit - picked.length >= 2) {
    findCrossOperatorPair(remaining, operatorOf)?.forEach(take);
  }

  while (picked.length < limit && remaining.length > 0) {
    const topScore = remaining[0].score;
    const tierEnd = remaining.findIndex((entry) => entry.score !== topScore);
    const tier = remaining.slice(0, tierEnd === -1 ? remaining.length : tierEnd);
    take(tier.find((entry) => !seenOperators.has(operatorOf(entry.id))) ?? tier[0]);
  }

  return picked.slice(0, limit).map((entry) => entry.id);
}

/** Highest-scoring pair of entries from different operators covering the same destination. */
function findCrossOperatorPair(
  scored: readonly ScoredEntry[],
  operatorOf: (id: string) => string,
): [ScoredEntry, ScoredEntry] | null {
  for (let i = 0; i < scored.length; i += 1) {
    for (let j = i + 1; j < scored.length; j += 1) {
      if (
        operatorOf(scored[i].id) !== operatorOf(scored[j].id) &&
        sharesDestination(scored[i].matchTerms, scored[j].matchTerms)
      ) {
        return [scored[i], scored[j]];
      }
    }
  }
  return null;
}

/** Left for the operator. Never pre-empted here. */
export const TIS_OPERATOR_DECIDES: readonly string[] = Object.freeze([
  "Availability on the requested dates",
  "Whether a private format is possible",
  "Final price and what it includes",
  "Meeting point and timings",
]);
