import { describe, expect, it } from "vitest";

import { deriveJourneyBrief } from "@/lib/marco/journey-brief";

describe("deriveJourneyBrief", () => {
  it("keeps an explicit private-family request's fields without inventing confirmation", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      answers: { group: "family" },
      format: "private",
      dateText: "this Friday",
      partySize: 4,
      interests: ["history", "food"],
      walkingPreference: "minimal",
      timingPreference: "flexible",
    });

    expect(brief.format).toEqual({ value: "private", origin: "travellerProvided" });
    expect(brief.partyType).toEqual({ value: "family", origin: "travellerSelected" });
    expect(brief.partySize).toEqual({ value: 4, origin: "travellerProvided" });
    expect(brief.walkingPreference).toEqual({ value: "minimal", origin: "travellerProvided" });
    expect(brief.timingPreference).toEqual({ value: "flexible", origin: "travellerProvided" });
    expect(brief.interests).toEqual([
      { value: "history", origin: "travellerProvided" },
      { value: "food", origin: "travellerProvided" },
    ]);
    expect(brief.operatorConfirmations).toEqual([]);
  });

  it("marks an explicit group-tour request as group with no operator confirmation required", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      format: "group",
      selectedTourIds: ["alcazar"],
    });

    expect(brief.format.value).toBe("group");
    expect(brief.operatorConfirmations).toEqual([]);
    expect(brief.tourIds).toEqual(["alcazar"]);
  });

  it("leaves format undecided and asks the one open question when nothing is specified", () => {
    const brief = deriveJourneyBrief({ locale: "en", destination: "Seville" });

    expect(brief.format).toEqual({ value: "undecided", origin: "controlledDerived" });
    expect(brief.openQuestions).toContain("Is this a private or group experience?");
  });

  it("marks a relative date phrase as requiring confirmation, never resolving it", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      dateText: "this Friday",
    });

    expect(brief.date).toEqual({ value: "this Friday", origin: "requiresConfirmation" });
    expect(brief.openQuestions.some((question) => question.includes("this Friday"))).toBe(true);
  });

  it("retains a walking preference without deriving any suitability or tour selection from it", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      walkingPreference: "minimal",
    });

    expect(brief.walkingPreference.value).toBe("minimal");
    expect(brief.tourIds).toEqual([]);
    expect(brief.operatorConfirmations).toEqual([]);
  });

  it("keeps multiple interests as separate entries, never merged into one product", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      interests: ["history", "food"],
    });

    expect(brief.interests).toHaveLength(2);
    expect(brief.interests.map((interest) => interest.value)).toEqual(["history", "food"]);
  });

  it("does not turn multiple interests into an operator requirement", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      format: "private",
      interests: ["history", "food"],
    });

    expect(brief.operatorConfirmations).toEqual([]);
    expect(brief.tourIds).toEqual([]);
  });

  it("passes through explicitly supplied operator confirmation requirements", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      format: "private",
      operatorConfirmations: ["Confirm the requested date with the operator."],
    });

    expect(brief.operatorConfirmations).toEqual([
      "Confirm the requested date with the operator.",
    ]);
  });

  it("never introduces a price field", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      format: "private",
      interests: ["history", "food"],
    });

    expect(brief).not.toHaveProperty("price");
  });

  it("passes through explicitly supplied tour ids without inventing or dropping any", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      selectedTourIds: ["alcazar", "cathedral", "alcazar"],
    });

    expect(brief.tourIds).toEqual(["alcazar", "cathedral"]);
  });

  it("lets an explicit interests override win over the decision-tree chip pick", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      answers: { interest: "history" },
      interests: ["food"],
    });

    expect(brief.interests).toEqual([{ value: "food", origin: "travellerProvided" }]);
  });

  it("keeps the decision-tree party type instead of resetting it to unspecified", () => {
    const brief = deriveJourneyBrief({
      locale: "en",
      destination: "Seville",
      answers: { group: "couple" },
    });

    expect(brief.partyType).toEqual({ value: "couple", origin: "travellerSelected" });
  });
});
