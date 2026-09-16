import { describe, expect, it } from "vitest";

import {
  TIS_TRUSTED_SOURCE_SNAPSHOTS,
  validateTrustedSourceSnapshots,
} from "@/lib/marco/showcase/trusted-source-snapshots";

describe("TIS trusted-source snapshots", () => {
  it("contains unique, valid snapshots referenced entirely in memory", () => {
    expect(validateTrustedSourceSnapshots(TIS_TRUSTED_SOURCE_SNAPSHOTS)).toEqual([]);
    expect(
      new Set(TIS_TRUSTED_SOURCE_SNAPSHOTS.map((snapshot) => snapshot.id)).size,
    ).toBe(TIS_TRUSTED_SOURCE_SNAPSHOTS.length);
  });

  it("contains no contact details, numeric prices, images, or copied descriptions", () => {
    const serialized = JSON.stringify(TIS_TRUSTED_SOURCE_SNAPSHOTS);
    expect(serialized).not.toMatch(/mailto:|tel:|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
    expect(serialized).not.toMatch(/[€$£]|priceAmount|imageUrl|description/i);
  });

  it("never presents an external possibility as a connected operator", () => {
    const externalPossibilities = TIS_TRUSTED_SOURCE_SNAPSHOTS.filter(
      (snapshot) => snapshot.sourceKind === "reviewedPublicOperatorSnapshot",
    );
    expect(externalPossibilities).toHaveLength(2);
    for (const snapshot of externalPossibilities) {
      expect(snapshot.relationshipStatus).toBe("publicPossibility");
      expect(snapshot.reviewStatus).not.toBe("operatorConfirmed");
      expect(snapshot.facts.some((fact) => /availability/i.test(fact.key))).toBe(false);
    }
  });

  it("keeps the connected experience availability explicitly unconfirmed", () => {
    const snapshot = TIS_TRUSTED_SOURCE_SNAPSHOTS.find(
      (candidate) => candidate.id === "seville-tours-alcazar",
    );
    const availability = snapshot?.facts.find((fact) => fact.key === "dateAvailability");
    expect(availability?.requiresConfirmation).toBe(true);
    expect(availability?.value).toMatch(/unknown until/i);
  });

  it("blocks external event demonstration until a real official record is reviewed", () => {
    const snapshot = TIS_TRUSTED_SOURCE_SNAPSHOTS.find(
      (candidate) => candidate.id === "official-event-snapshot-required",
    );
    expect(snapshot?.reviewStatus).toBe("requiresConfirmation");
    expect(snapshot?.facts).toContainEqual(
      expect.objectContaining({
        value: "Approved event snapshot required before external demonstration",
        requiresConfirmation: true,
      }),
    );
  });
});