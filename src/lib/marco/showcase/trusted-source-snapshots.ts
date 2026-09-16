import type { TrustedSourceSnapshot } from "./types";

export const TIS_TRUSTED_SOURCE_SNAPSHOTS = [
  {
    id: "seville-tours-alcazar",
    sourceKind: "connectedOperatorSnapshot",
    publisherDisplayName: "Seville Tours Co.",
    sourceUrl: "/en/tours/seville-alcazar-guided-tour/",
    capturedAt: "2026-09-16T00:00:00.000Z",
    reviewStatus: "operatorConfirmed",
    relationshipStatus: "connectedOperator",
    facts: [
      {
        key: "productionExperienceId",
        value: "alcazar",
        sourceStatus: "operatorConfirmed",
        requiresConfirmation: false,
        reviewedAt: "2026-09-16T00:00:00.000Z",
      },
      {
        key: "dateAvailability",
        value: "Unknown until the supported booking path is checked",
        sourceStatus: "requiresConfirmation",
        requiresConfirmation: true,
      },
    ],
    validityNote: "A reviewed snapshot, not a live availability or price assertion.",
  },
  {
    id: "reviewed-local-operator-possibility",
    sourceKind: "reviewedPublicOperatorSnapshot",
    publisherDisplayName: "Reviewed local operator possibility",
    sourceUrl: "urn:para-usted:tis:reviewed-local-operator-possibility",
    capturedAt: "2026-09-16T00:00:00.000Z",
    reviewStatus: "requiresConfirmation",
    relationshipStatus: "publicPossibility",
    facts: [
      {
        key: "showcaseIdentity",
        value: "Neutral structural placeholder; real operator approval required",
        sourceStatus: "requiresConfirmation",
        requiresConfirmation: true,
      },
    ],
    validityNote: "No partnership, availability, price, or operator commitment is claimed.",
  },
  {
    id: "reviewed-malaga-operator-possibility",
    sourceKind: "reviewedPublicOperatorSnapshot",
    publisherDisplayName: "Reviewed Málaga operator possibility",
    sourceUrl: "urn:para-usted:tis:reviewed-malaga-operator-possibility",
    capturedAt: "2026-09-16T00:00:00.000Z",
    reviewStatus: "requiresConfirmation",
    relationshipStatus: "publicPossibility",
    facts: [
      {
        key: "destination",
        value: "Málaga",
        sourceStatus: "sourceCaptured",
        requiresConfirmation: false,
      },
      {
        key: "showcaseIdentity",
        value: "Neutral structural placeholder; suitability and operator approval required",
        sourceStatus: "requiresConfirmation",
        requiresConfirmation: true,
      },
    ],
    validityNote: "A staged public possibility, not a partner or live operational offer.",
  },
  {
    id: "official-event-snapshot-required",
    sourceKind: "officialSourceSnapshot",
    publisherDisplayName: "Official event source pending approval",
    sourceUrl: "urn:para-usted:tis:official-event-snapshot-required",
    capturedAt: "2026-09-16T00:00:00.000Z",
    reviewStatus: "requiresConfirmation",
    relationshipStatus: "officialInformationSource",
    facts: [
      {
        key: "externalDemonstrationStatus",
        value: "Approved event snapshot required before external demonstration",
        sourceStatus: "requiresConfirmation",
        requiresConfirmation: true,
      },
    ],
    validityNote: "This is not a live event; replace it with a captured and reviewed official record.",
  },
] as const satisfies readonly TrustedSourceSnapshot[];

export function validateTrustedSourceSnapshots(
  snapshots: readonly TrustedSourceSnapshot[],
): string[] {
  const errors: string[] = [];
  const ids = snapshots.map((snapshot) => snapshot.id);

  if (new Set(ids).size !== ids.length) errors.push("Snapshot IDs must be unique.");

  for (const snapshot of snapshots) {
    if (
      snapshot.sourceKind === "reviewedPublicOperatorSnapshot" &&
      snapshot.relationshipStatus !== "publicPossibility"
    ) {
      errors.push(`${snapshot.id} must remain a public possibility.`);
    }

    if (
      snapshot.relationshipStatus === "publicPossibility" &&
      snapshot.facts.some(
        (fact) =>
          /availability/i.test(fact.key) &&
          (!fact.requiresConfirmation || /available|confirmed/i.test(String(fact.value))),
      )
    ) {
      errors.push(`${snapshot.id} must not claim live availability.`);
    }
  }

  return errors;
}