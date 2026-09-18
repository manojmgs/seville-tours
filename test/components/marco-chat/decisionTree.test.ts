import { describe, expect, it } from "vitest";

import { recommend } from "@/components/marco-chat/decisionTree";

describe("recommendation decision tree", () => {
  it.each([
    [
      { duration: "3-plus", interest: "daytrip", group: "couple" },
      ["granada", "cordoba"],
      "daytrip-interest",
      ["interest"],
    ],
    [
      { duration: "3-plus", interest: "food", group: "couple" },
      ["tapas", "highlights"],
      "food-interest",
      ["interest"],
    ],
    [
      { duration: "few-hours", interest: "surprise", group: "couple" },
      ["alcazar", "cathedral"],
      "short-visit",
      ["duration"],
    ],
    [
      { duration: "3-plus", interest: "surprise", group: "family" },
      ["highlights", "alcazar"],
      "family-context",
      ["group"],
    ],
    [
      { duration: "3-plus", interest: "history", group: "couple" },
      ["alcazar", "cathedral"],
      "history-interest",
      ["interest"],
    ],
    [
      { duration: "3-plus", interest: "surprise", group: "couple" },
      ["highlights", "alcazar"],
      "general-introduction",
      [],
    ],
  ] as const)("returns the stable result for %j", (answers, tourIds, reasonCode, usedInputs) => {
    expect(recommend(answers)).toEqual({ tourIds, reasonCode, usedInputs });
  });

  it("keeps day-trip priority over a short visit and family context", () => {
    expect(
      recommend({ duration: "few-hours", interest: "daytrip", group: "family" }),
    ).toEqual({
      tourIds: ["granada", "cordoba"],
      reasonCode: "daytrip-interest",
      usedInputs: ["interest"],
    });
  });
});