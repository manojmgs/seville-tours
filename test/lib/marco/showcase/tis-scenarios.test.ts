import { describe, expect, it } from "vitest";

import {
  TIS_SCENARIO_FIXTURES,
  validateTisScenarioFixtures,
} from "@/lib/marco/showcase/tis-scenarios";
import type { TisScenarioFixture } from "@/lib/marco/showcase/types";

const byId = (id: string): TisScenarioFixture => {
  const fixture = TIS_SCENARIO_FIXTURES.find((candidate) => candidate.id === id);
  if (!fixture) throw new Error(`Missing TIS fixture: ${id}`);
  return fixture;
};

describe("TIS scenario fixtures", () => {
  it("contains exactly five unique, internally valid fixture records", () => {
    expect(TIS_SCENARIO_FIXTURES).toHaveLength(5);
    expect(new Set(TIS_SCENARIO_FIXTURES.map((fixture) => fixture.id)).size).toBe(5);
    expect(validateTisScenarioFixtures(TIS_SCENARIO_FIXTURES)).toEqual([]);
  });

  it("keeps exact traveller messages as inert fixture data", () => {
    expect(TIS_SCENARIO_FIXTURES.map((fixture) => fixture.travellerMessage)).toEqual([
      "We have a few hours in Seville and would like to visit the Alcázar on Friday. We are two adults.",
      "We are a family of four visiting Seville. We are interested in history and food, prefer a relaxed pace, and would like a private experience.",
      "Show me two local possibilities for a private history-focused visit in Seville for two people.",
      "After Seville, we are continuing to Málaga and would like a private city experience with less walking.",
      "Watch official sources for cultural events in Seville during my trip and tell me if something relevant appears.",
    ]);
    expect(TIS_SCENARIO_FIXTURES.every((fixture) => !("routingRule" in fixture))).toBe(true);
  });

  it("never creates leads, changes itineraries, or sends to operators automatically", () => {
    for (const fixture of TIS_SCENARIO_FIXTURES) {
      expect(fixture.createsLeadOnDisplay).toBe(false);
      expect(fixture.modifiesItineraryAutomatically).toBe(false);
      expect(fixture.sendsToOperatorAutomatically).toBe(false);
      expect(fixture.prohibitedClaims).toContain("automaticLead");
      expect(fixture.prohibitedClaims).toContain("automaticItineraryModification");
      expect(fixture.prohibitedClaims).toContain("automaticOperatorSend");
    }
  });

  it("keeps custom-private interests separate and contains no quotation", () => {
    const fixture = byId("custom-private-seville-direction");
    expect(fixture.recognisedContext.interests).toEqual(["history", "food"]);
    expect(JSON.stringify(fixture)).not.toMatch(/[€$£]|quotation|numericQuote/i);
    expect(fixture.prohibitedClaims).toContain("combinedPrivatePackage");
  });

  it("defines exactly one material question only for the two required scenarios", () => {
    expect(byId("custom-private-seville-direction").oneMaterialQuestion).toBe(
      "What date or date range will you be in Seville?",
    );
    expect(byId("journey-watch-official-event").oneMaterialQuestion).toBe(
      "Which event themes matter most to you?",
    );
    expect(TIS_SCENARIO_FIXTURES.filter((fixture) => "oneMaterialQuestion" in fixture)).toHaveLength(2);
  });

  it("keeps operator comparison staged and blocks partnership and premature sending", () => {
    const fixture = byId("two-operator-possibilities");
    expect(fixture.stagedForTis).toBe(true);
    expect(fixture.prohibitedClaims).toContain("inferredPartnership");
    expect(fixture.allowedTravellerActions).not.toContain("explicitSend");
    expect(fixture.allowedTravellerActions).not.toContain("reviewSharing");
  });

  it("keeps Seville and Málaga separate and treats less walking only as a preference", () => {
    const fixture = byId("seville-to-malaga-continuation");
    expect(fixture.recognisedContext.destinations).toEqual(["Seville", "Málaga"]);
    expect(fixture.recognisedContext.walkingPreference).toBe("lessWalking");
    expect(fixture.prohibitedClaims).toContain("walkingSuitability");
    expect(fixture.stagedForTis).toBe(true);
  });

  it("keeps the event scenario staged until an approved official snapshot exists", () => {
    const fixture = byId("journey-watch-official-event");
    expect(fixture.stagedForTis).toBe(true);
    expect(fixture.futureOnly).toBe(true);
    expect(fixture.sourceSnapshotIds).toEqual(["official-event-snapshot-required"]);
  });
});