import { TIS_TRUSTED_SOURCE_SNAPSHOTS } from "./trusted-source-snapshots";
import type { ProhibitedClaim, TisScenarioFixture, TrustedSourceSnapshot } from "./types";

const TRUTHFULNESS_PROTECTIONS = [
  "automaticLead",
  "inferredPartnership",
  "inventedAvailability",
  "inventedPriceUnit",
  "combinedPrivatePackage",
  "walkingSuitability",
  "automaticItineraryModification",
  "automaticOperatorSend",
] as const satisfies readonly ProhibitedClaim[];

export const TIS_SCENARIO_FIXTURES = [
  {
    id: "fixed-seville-experience",
    displayName: "Fixed Seville experience",
    travellerMessage:
      "We have a few hours in Seville and would like to visit the Alcázar on Friday. We are two adults.",
    journeyStage: "readyToBook",
    recognisedContext: {
      destinations: ["Seville"],
      interests: ["Alcázar"],
      partySize: 2,
      dateText: "Friday",
    },
    expectedOutcome: "bookableExperience",
    expectedRecommendationType: "fixedExperience",
    allowedTravellerActions: [
      "checkDates",
      "bookNow",
      "continueRefining",
      "saveForLater",
      "reject",
      "stop",
    ],
    prohibitedClaims: TRUTHFULNESS_PROTECTIONS,
    sourceSnapshotIds: ["seville-tours-alcazar"],
    realToday: true,
    stagedForTis: false,
    futureOnly: false,
    createsLeadOnDisplay: false,
    modifiesItineraryAutomatically: false,
    sendsToOperatorAutomatically: false,
    stopCondition: "travellerStops",
  },
  {
    id: "custom-private-seville-direction",
    displayName: "Custom private Seville direction",
    travellerMessage:
      "We are a family of four visiting Seville. We are interested in history and food, prefer a relaxed pace, and would like a private experience.",
    journeyStage: "planning",
    recognisedContext: {
      destinations: ["Seville"],
      interests: ["history", "food"],
      partySize: 4,
      formatPreference: "private",
      pacePreference: "relaxed",
    },
    oneMaterialQuestion: "What date or date range will you be in Seville?",
    expectedOutcome: "operatorConfirmation",
    expectedRecommendationType: "customPrivateDirection",
    allowedTravellerActions: ["continueRefining", "saveForLater", "reject", "stop"],
    prohibitedClaims: TRUTHFULNESS_PROTECTIONS,
    sourceSnapshotIds: ["seville-tours-alcazar"],
    realToday: true,
    stagedForTis: true,
    futureOnly: false,
    createsLeadOnDisplay: false,
    modifiesItineraryAutomatically: false,
    sendsToOperatorAutomatically: false,
    stopCondition: "travellerStops",
  },
  {
    id: "two-operator-possibilities",
    displayName: "Two operator possibilities",
    travellerMessage:
      "Show me two local possibilities for a private history-focused visit in Seville for two people.",
    journeyStage: "comparing",
    recognisedContext: {
      destinations: ["Seville"],
      interests: ["history"],
      partySize: 2,
      formatPreference: "private",
    },
    expectedOutcome: "operatorConfirmation",
    expectedRecommendationType: "publicOperatorPossibility",
    allowedTravellerActions: [
      "selectOperator",
      "selectMultipleOperators",
      "continueRefining",
      "saveForLater",
      "reject",
      "stop",
    ],
    prohibitedClaims: TRUTHFULNESS_PROTECTIONS,
    sourceSnapshotIds: ["seville-tours-alcazar", "reviewed-local-operator-possibility"],
    realToday: false,
    stagedForTis: true,
    futureOnly: false,
    createsLeadOnDisplay: false,
    modifiesItineraryAutomatically: false,
    sendsToOperatorAutomatically: false,
    stopCondition: "travellerStops",
  },
  {
    id: "seville-to-malaga-continuation",
    displayName: "Seville-to-Málaga continuation",
    travellerMessage:
      "After Seville, we are continuing to Málaga and would like a private city experience with less walking.",
    journeyStage: "planning",
    recognisedContext: {
      destinations: ["Seville", "Málaga"],
      formatPreference: "private",
      walkingPreference: "lessWalking",
    },
    expectedOutcome: "operatorConfirmation",
    expectedRecommendationType: "publicOperatorPossibility",
    allowedTravellerActions: [
      "selectOperator",
      "continueRefining",
      "saveForLater",
      "reject",
      "stop",
    ],
    prohibitedClaims: TRUTHFULNESS_PROTECTIONS,
    sourceSnapshotIds: ["reviewed-malaga-operator-possibility"],
    realToday: false,
    stagedForTis: true,
    futureOnly: false,
    createsLeadOnDisplay: false,
    modifiesItineraryAutomatically: false,
    sendsToOperatorAutomatically: false,
    stopCondition: "travellerStops",
  },
  {
    id: "journey-watch-official-event",
    displayName: "Journey Watch official event",
    travellerMessage:
      "Watch official sources for cultural events in Seville during my trip and tell me if something relevant appears.",
    journeyStage: "preTripMonitoring",
    recognisedContext: {
      destinations: ["Seville"],
      interests: ["cultural events"],
    },
    oneMaterialQuestion: "Which event themes matter most to you?",
    expectedOutcome: "informationalUpdate",
    expectedRecommendationType: "officialEvent",
    allowedTravellerActions: [
      "openOfficialSource",
      "saveForLater",
      "dismiss",
      "continueRefining",
      "stop",
    ],
    prohibitedClaims: TRUTHFULNESS_PROTECTIONS,
    sourceSnapshotIds: ["official-event-snapshot-required"],
    realToday: false,
    stagedForTis: true,
    futureOnly: true,
    createsLeadOnDisplay: false,
    modifiesItineraryAutomatically: false,
    sendsToOperatorAutomatically: false,
    stopCondition: "travellerStops",
  },
] as const satisfies readonly TisScenarioFixture[];

export function validateTisScenarioFixtures(
  fixtures: readonly TisScenarioFixture[],
  snapshots: readonly TrustedSourceSnapshot[] = TIS_TRUSTED_SOURCE_SNAPSHOTS,
): string[] {
  const errors: string[] = [];
  const fixtureIds = fixtures.map((fixture) => fixture.id);
  const snapshotIds = new Set(snapshots.map((snapshot) => snapshot.id));

  if (fixtures.length !== 5) errors.push("Exactly five TIS fixtures are required.");
  if (new Set(fixtureIds).size !== fixtureIds.length) errors.push("Fixture IDs must be unique.");

  for (const fixture of fixtures) {
    for (const snapshotId of fixture.sourceSnapshotIds) {
      if (!snapshotIds.has(snapshotId)) errors.push(`${fixture.id} references missing ${snapshotId}.`);
    }
    if (
      fixture.createsLeadOnDisplay ||
      fixture.modifiesItineraryAutomatically ||
      fixture.sendsToOperatorAutomatically
    ) {
      errors.push(`${fixture.id} must not trigger an automatic side effect.`);
    }
    for (const protection of TRUTHFULNESS_PROTECTIONS) {
      if (!fixture.prohibitedClaims.includes(protection)) {
        errors.push(`${fixture.id} is missing the ${protection} protection.`);
      }
    }
  }

  return errors;
}