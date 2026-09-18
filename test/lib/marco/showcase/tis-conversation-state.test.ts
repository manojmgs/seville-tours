import { describe, expect, it } from "vitest";
import {
  arrangementItemId,
  buildJourneyBrief,
  createInitialTisConversationState,
  experienceItemId,
  looksLikeQuestion,
  nextQuestion,
  operatorAskLabel,
  selectRecommendations,
  sharesDestinationTerm,
  transitionTisConversation,
  TIS_OPERATOR_ASK_OPTIONS,
  TIS_OPERATOR_DECIDES,
  TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID,
  TIS_QUESTIONS,
  TIS_UNVERIFIED_REPLY,
  TIS_VERBATIM_REPLY,
  wantsOperatorAttention,
  type TisConversationAction,
  type TisConversationState,
} from "@/lib/marco/showcase/tis-conversation-state";

function run(...actions: readonly TisConversationAction[]): TisConversationState {
  return actions.reduce(transitionTisConversation, createInitialTisConversationState());
}

const answerAll = [
  { type: "answer", slot: "party", value: "two" },
  { type: "answer", slot: "dates", value: "window" },
  { type: "answer", slot: "flexibility", value: "dayEither" },
  { type: "answer", slot: "format", value: "private" },
  { type: "answer", slot: "interests", value: "history" },
  { type: "answer", slot: "interests", value: "food" },
  { type: "confirmInterests" },
] as const satisfies readonly TisConversationAction[];

describe("TIS conversation state", () => {
  describe("knowledge boundary", () => {
    it("recognises questions by mark or opening word, and statements as statements", () => {
      expect(looksLikeQuestion("Is the Alcazar wheelchair accessible?")).toBe(true);
      expect(looksLikeQuestion("what is the weather like in October")).toBe(true);
      expect(looksLikeQuestion("Can you book us a table")).toBe(true);
      expect(looksLikeQuestion("We are celebrating our tenth anniversary.")).toBe(false);
      expect(looksLikeQuestion("   ")).toBe(false);
    });

    it("declines to answer a question instead of guessing", () => {
      const state = run({ type: "addOwnWords", text: "Is the Alcazar wheelchair accessible?" });
      const reply = state.turns.at(-1);

      expect(reply?.speaker).toBe("marco");
      expect(reply?.text).toBe(TIS_UNVERIFIED_REPLY);
    });

    it("still stores a declined question verbatim and routes it to the operator", () => {
      const question = "Is the Alcazar wheelchair accessible?";
      const state = run({ type: "addOwnWords", text: question });

      expect(state.ownWords).toEqual([question]);
      expect(state.turns.some((turn) => turn.verbatim && turn.text === question)).toBe(true);
      expect(buildJourneyBrief(state).openQuestions).toEqual([question]);
    });

    it("keeps statements out of the open-questions list", () => {
      const statement = "We are celebrating our tenth anniversary.";
      const state = run({ type: "addOwnWords", text: statement });

      expect(state.turns.at(-1)?.text).toBe(TIS_VERBATIM_REPLY);
      expect(buildJourneyBrief(state).ownWords).toEqual([statement]);
      expect(buildJourneyBrief(state).openQuestions).toEqual([]);
    });
  });

  it("opens with a single Marco turn and no traveller data", () => {    const state = createInitialTisConversationState();

    expect(state.turns).toHaveLength(1);
    expect(state.turns[0].speaker).toBe("marco");
    expect(state.answers).toEqual({
      party: null,
      dates: null,
      flexibility: null,
      format: null,
      interests: [],
    });
    expect(state.tripPlanItems).toEqual([]);
    expect(state.phase).toBe("gathering");
  });

  it("asks the questions in order and records each answer as a traveller turn", () => {
    expect(nextQuestion(createInitialTisConversationState())?.id).toBe("party");

    const afterParty = run({ type: "answer", slot: "party", value: "two" });
    expect(nextQuestion(afterParty)?.id).toBe("dates");
    expect(afterParty.turns.some((turn) => turn.speaker === "traveller" && turn.text === "Two of us")).toBe(true);
  });

  it("skips the flexibility question when there are no dates to be flexible about", () => {
    const undecided = run(
      { type: "answer", slot: "party", value: "solo" },
      { type: "answer", slot: "dates", value: "undecided" },
    );
    expect(nextQuestion(undecided)?.id).toBe("format");

    const withWindow = run(
      { type: "answer", slot: "party", value: "solo" },
      { type: "answer", slot: "dates", value: "window" },
    );
    expect(nextQuestion(withWindow)?.id).toBe("flexibility");
  });

  it("toggles interests and refuses to move on until at least one is chosen", () => {
    const base = run(
      { type: "answer", slot: "party", value: "two" },
      { type: "answer", slot: "dates", value: "undecided" },
      { type: "answer", slot: "format", value: "smallGroup" },
    );

    expect(transitionTisConversation(base, { type: "confirmInterests" }).phase).toBe("gathering");

    const added = transitionTisConversation(base, { type: "answer", slot: "interests", value: "history" });
    expect(added.answers.interests).toEqual(["history"]);

    const removed = transitionTisConversation(added, { type: "answer", slot: "interests", value: "history" });
    expect(removed.answers.interests).toEqual([]);

    expect(transitionTisConversation(added, { type: "confirmInterests" }).phase).toBe("deciding");
  });

  it("keeps typed text verbatim and never rewrites it", () => {
    const typed = "  we would rather not walk too much in the heat  ";
    const state = run({ type: "addOwnWords", text: typed });

    expect(state.ownWords).toEqual(["we would rather not walk too much in the heat"]);
    const travellerTurn = state.turns.find((turn) => turn.verbatim);
    expect(travellerTurn?.text).toBe("we would rather not walk too much in the heat");
    expect(buildJourneyBrief(state).ownWords).toEqual(["we would rather not walk too much in the heat"]);
  });

  it("ignores empty free text", () => {
    const state = run({ type: "addOwnWords", text: "   " });
    expect(state.ownWords).toEqual([]);
    expect(state.turns).toHaveLength(1);
  });

  it("never puts anything in the Trip Plan without a deliberate action", () => {
    const state = run(...answerAll);

    expect(wantsOperatorAttention(state)).toBe(true);
    expect(state.tripPlanItems).toEqual([]);
  });

  it("adds the saved possibility exactly once and ignores a repeat", () => {
    const once = run(...answerAll, { type: "addSavedPossibility", tourId: "alcazar" });
    const twice = transitionTisConversation(once, { type: "addSavedPossibility", tourId: "alcazar" });

    expect(once.tripPlanItems).toHaveLength(1);
    expect(once.tripPlanItems[0].tourId).toBe("alcazar");
    expect(once.tripPlanAnnouncement).toBe("Added as a possibility. Nothing has been booked.");
    expect(twice).toBe(once);
  });

  it("saves several different experiences side by side", () => {
    const state = run(
      ...answerAll,
      { type: "addSavedPossibility", tourId: "alcazar" },
      { type: "addSavedPossibility", tourId: "tapas" },
    );

    expect(state.tripPlanItems.map((item) => item.tourId)).toEqual(["alcazar", "tapas"]);
    expect(state.tripPlanItems.every((item) => item.status === "savedPossibility")).toBe(true);
  });

  it("creates the private request only on an explicit action, and announces that nothing was sent", () => {
    const state = run(...answerAll, { type: "preparePrivateRequest" });
    const item = state.tripPlanItems.find((entry) => entry.id === TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID);

    expect(item?.status).toBe("requestInPreparation");
    expect(state.tripPlanAnnouncement).toBe("Request in preparation. Nothing has been sent.");
  });

  it("removes only the targeted item and keeps the other", () => {
    const both = run(
      ...answerAll,
      { type: "addSavedPossibility", tourId: "alcazar" },
      { type: "preparePrivateRequest" },
    );
    const withoutSaved = transitionTisConversation(both, {
      type: "removeTripPlanItem",
      id: experienceItemId("alcazar"),
    });

    expect(withoutSaved.tripPlanItems.map((item) => item.id)).toEqual([TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID]);
    expect(withoutSaved.tripPlanAnnouncement).toBe("Removed from your Trip Plan.");

    const withoutRequest = transitionTisConversation(both, {
      type: "removeTripPlanItem",
      id: TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID,
    });
    expect(withoutRequest.tripPlanItems.map((item) => item.tourId)).toEqual(["alcazar"]);
    expect(withoutRequest.privateRequestDismissed).toBe(true);
  });

  it("moves to the handover only from the deciding phase, and back again", () => {
    const gathering = run({ type: "answer", slot: "party", value: "two" });
    expect(transitionTisConversation(gathering, { type: "reviewHandover" })).toBe(gathering);

    const deciding = run(...answerAll);
    const handover = transitionTisConversation(deciding, { type: "reviewHandover" });
    expect(handover.phase).toBe("handover");
    expect(transitionTisConversation(handover, { type: "backToPlanning" }).phase).toBe("deciding");
  });

  it("builds the Journey Brief from the answers only", () => {
    const brief = buildJourneyBrief(run(...answerAll));

    expect(brief.destination).toBe("Seville");
    expect(brief.travellers).toBe("Two adults");
    expect(brief.dateStatus).toBe("A rough window");
    expect(brief.interests).toEqual(["History", "Local food"]);
    expect(brief.preferences).toEqual(["Private, if available", "A day either way"]);
  });

  it("resets every answer, turn and Trip Plan item", () => {
    const reset = run(
      ...answerAll,
      { type: "addSavedPossibility", tourId: "alcazar" },
      { type: "addOwnWords", text: "hola" },
      "reset",
    );

    expect(reset).toEqual(createInitialTisConversationState());
  });

  it("states what the operator decides, and treats extras as questions rather than arrangements", () => {
    expect(TIS_OPERATOR_DECIDES).toContain("Availability on the requested dates");
    expect(TIS_OPERATOR_DECIDES).toContain("Final price and what it includes");
    expect(TIS_OPERATOR_ASK_OPTIONS.map((option) => option.value)).toEqual([
      "stay",
      "transfers",
      "food",
      "accessibility",
    ]);
    expect(operatorAskLabel("stay")).toBe("Somewhere to stay");
  });

  it("toggles operator questions without ever arranging them", () => {
    const asked = run(...answerAll, { type: "toggleOperatorAsk", value: "stay" });
    expect(asked.operatorAsks).toEqual(["stay"]);

    const withTransfers = transitionTisConversation(asked, { type: "toggleOperatorAsk", value: "transfers" });
    expect(withTransfers.operatorAsks).toEqual(["stay", "transfers"]);

    const removed = transitionTisConversation(withTransfers, { type: "toggleOperatorAsk", value: "stay" });
    expect(removed.operatorAsks).toEqual(["transfers"]);

    // A question for the operator must never become a Trip Plan item.
    expect(removed.tripPlanItems).toEqual([]);
  });

  it("never carries a currency value or a confirmed state anywhere in the model", () => {
    const state = run(
      ...answerAll,
      { type: "addSavedPossibility", tourId: "alcazar" },
      { type: "preparePrivateRequest" },
    );
    const serialised = JSON.stringify({ state, questions: TIS_QUESTIONS, operatorDecides: TIS_OPERATOR_DECIDES });

    // Price is the operator's to publish and ours to display, never ours to author.
    expect(serialised).not.toMatch(/[€$£]|\d+[.,]\d{2}|\bEUR\b/);
    expect(state.tripPlanItems.map((item) => item.status).sort()).toEqual([
      "requestInPreparation",
      "savedPossibility",
    ]);
    expect(serialised).not.toMatch(/"status":"(confirmed|booked|sent)"/);
  });

  describe("catalogue matching", () => {
    const catalogue = [
      { id: "alcazar", tags: ["history", "architecture", "royal", "families"] },
      { id: "cathedral", tags: ["history", "architecture", "culture", "families"] },
      { id: "highlights", tags: ["first visit", "orientation", "walking"] },
      { id: "tapas", tags: ["food", "wine", "culture", "evening"] },
    ];

    it("returns food experiences for a food interest, not the default tour", () => {
      const result = selectRecommendations(["food"], catalogue);

      expect(result.matchedOnInterest).toBe(true);
      expect(result.tourIds[0]).toBe("tapas");
      expect(result.tourIds).not.toContain("alcazar");
    });

    it("ranks by how many interests a tour actually satisfies", () => {
      const result = selectRecommendations(["history", "architecture"], catalogue, 2);

      expect(result.tourIds).toEqual(["alcazar", "cathedral"]);
    });

    it("reports honestly when nothing in the catalogue matches", () => {
      // "A relaxed pace" is a preference for the operator to apply, not a catalogue tag.
      const result = selectRecommendations(["slowPace"], catalogue, 2);

      expect(result.matchedOnInterest).toBe(false);
      expect(result.tourIds).toHaveLength(2);
    });
  });

  describe("operator neutrality in results", () => {
    const operatorOf = (id: string) => (id.startsWith("rival-") ? "Rival Operator" : "House Operator");
    const twoOperatorCatalogue = [
      { id: "house-alcazar", tags: ["history"], matchTerms: ["alcazar"] },
      { id: "house-cathedral", tags: ["history"], matchTerms: ["cathedral"] },
      { id: "house-ronda", tags: ["history"], matchTerms: ["ronda", "setenil"] },
      { id: "rival-ronda", tags: ["history"], matchTerms: ["ronda", "setenil"] },
    ];

    it("leads with the best match, then pairs the same destination across operators", () => {
      const result = selectRecommendations(["history"], twoOperatorCatalogue, 3, operatorOf);

      expect(result.tourIds[0]).toBe("house-alcazar");
      expect(result.tourIds.slice(1)).toEqual(["house-ronda", "rival-ronda"]);
    });

    it("never pairs different products that merely share an activity word", () => {
      // "tapas" is an activity, not a place. Claiming these are the same trip would be false.
      expect(sharesDestinationTerm(["tapas", "seville"], ["tapas", "alora"])).toBe(false);
      expect(sharesDestinationTerm(["ronda", "setenil"], ["ronda"])).toBe(true);
    });

    it("shows a single operator rather than padding with a rival that does not match", () => {
      const result = selectRecommendations(["history"], twoOperatorCatalogue.slice(0, 2), 3, operatorOf);

      expect(result.tourIds.every((id) => operatorOf(id) === "House Operator")).toBe(true);
    });
  });

  describe("arrangement requests", () => {
    const askForSpa = {
      type: "requestArrangement",
      requestId: "spa",
      label: "Spa and wellness",
    } as const satisfies TisConversationAction;

    it("records an unlisted ask as a request, never as a saved possibility", () => {
      const state = run(...answerAll, askForSpa);
      const item = state.tripPlanItems.find((entry) => entry.id === arrangementItemId("spa"));

      expect(item?.kind).toBe("arrangementRequest");
      expect(item?.status).toBe("requestInPreparation");
      expect(state.tripPlanItems.some((entry) => entry.status === "savedPossibility")).toBe(false);
    });

    it("declines to invent the thing it does not have", () => {
      const state = run(...answerAll, askForSpa);

      expect(state.turns.at(-1)?.text).toContain("I will not invent one");
      expect(state.tripPlanAnnouncement).toBe("Added as a question for the operator. Nothing has been arranged.");
    });

    it("does not duplicate the same request", () => {
      const state = run(...answerAll, askForSpa, askForSpa);

      expect(state.tripPlanItems.filter((entry) => entry.kind === "arrangementRequest")).toHaveLength(1);
    });

    it("can be removed again", () => {
      const state = run(...answerAll, askForSpa, {
        type: "removeTripPlanItem",
        id: arrangementItemId("spa"),
      });

      expect(state.tripPlanItems.some((entry) => entry.kind === "arrangementRequest")).toBe(false);
    });
  });

  describe("saving and sending", () => {
    it("holds no saved journey or enquiry until the traveller acts", () => {
      const state = run(...answerAll);

      expect(state.savedJourney).toBeNull();
      expect(state.enquiry).toBeNull();
    });

    it("records a saved journey once, keeping the first reference", () => {
      const state = run(
        ...answerAll,
        { type: "saveJourney", reference: "PU-AAAAA", at: "2026-09-18T10:00:00.000Z" },
        { type: "saveJourney", reference: "PU-BBBBB", at: "2026-09-18T11:00:00.000Z" },
      );

      expect(state.savedJourney?.reference).toBe("PU-AAAAA");
    });

    it("records contact details only when the enquiry is deliberately sent", () => {
      const contact = { name: "Ana", email: "ana@example.com", phone: "" };
      const state = run(...answerAll, { type: "sendEnquiry", contact, at: "2026-09-18T10:00:00.000Z" });

      expect(state.enquiry?.contact).toEqual(contact);
    });
  });
});
