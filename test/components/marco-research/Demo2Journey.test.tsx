// @vitest-environment jsdom
import type { ReactElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RESEARCH_PROHIBITED_CLAIMS } from "@/lib/marco/research/claims";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import SevilleToursResearchPage from "@/app/[locale]/tis-showcase/seville-tours-research/page";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  notFoundMock.mockClear();
});

async function openDemo2() {
  vi.stubEnv("NODE_ENV", "development");
  const page = await SevilleToursResearchPage({ params: Promise.resolve({ locale: "en" }) });
  render(page as ReactElement);
  fireEvent.click(screen.getByRole("button", { name: /Demo 2: Four-day private journey/ }));
}

function advanceTo(stageLabel: string) {
  for (let step = 0; step < 8; step += 1) {
    if (screen.queryByText(new RegExp(`· ${stageLabel}$`))) return;
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
  }
  throw new Error(`Never reached stage ${stageLabel}`);
}

describe("Demo 2 — journey and professional collaboration", () => {
  it("opens on the request with days 3 and 4 left undecided", async () => {
    await openDemo2();

    expect(screen.getByText("Step 1 of 8 · The request")).toBeTruthy();
    expect(screen.getByText("Day 3 · Not decided")).toBeTruthy();
    expect(screen.getByText("Day 4 · Not decided")).toBeTruthy();
    expect(screen.getByText("Days 3 and 4 stay empty. We do not invent an itinerary.")).toBeTruthy();
  });

  it("uses the operator's own published Granada product, with its price basis", async () => {
    await openDemo2();

    expect(screen.getAllByText(/Seville Tours Co\. · From €295 per person/).length).toBeGreaterThan(0);
  });

  it("lists blocking unknowns and never produces an inclusive price", async () => {
    await openDemo2();
    advanceTo("Blocking unknowns");

    expect(screen.getByText("Price — still open")).toBeTruthy();
    expect(screen.getByText("Availability — still open")).toBeTruthy();
    expect(screen.getByText("There is no inclusive price here, and there will not be one.")).toBeTruthy();
  });

  it("separates what has not happened in the action brief", async () => {
    await openDemo2();
    advanceTo("Carlos's action brief");

    expect(screen.getByText("What has not happened")).toBeTruthy();
    expect(screen.getByText("No bespoke price produced")).toBeTruthy();
    expect(screen.getByText("No partnership implied")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Find another professional" })).toBeTruthy();
  });

  it("labels the Granada candidate as a concept because no permissioned record exists", async () => {
    await openDemo2();
    advanceTo("Professional discovery");

    expect(screen.getByText("Granada professional · concept only")).toBeTruthy();
    expect(
      screen.getByText("No permissioned record exists for a Granada operator, so nobody is named."),
    ).toBeTruthy();
  });

  it("shows the anonymous opportunity without traveller identity", async () => {
    await openDemo2();
    advanceTo("Anonymous opportunity");

    expect(screen.getByText("Traveller identity has not been shared.")).toBeTruthy();
    expect(screen.getByText("Two adults, a relative may join")).toBeTruthy();
    expect(screen.queryByText(/@/)).toBeNull();
    expect(screen.getByRole("button", { name: "Need one detail" })).toBeTruthy();
  });

  it("splits shared from not shared and prepares rather than sends", async () => {
    await openDemo2();
    advanceTo("Traveller reviews sharing");

    expect(screen.getByText("Shared")).toBeTruthy();
    expect(screen.getByText("Not shared")).toBeTruthy();
    expect(screen.getByText("Passport or identification information")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Prepare for review" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Send" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Share" })).toBeNull();
  });

  it("issues a versioned receipt that states no transmission occurred", async () => {
    await openDemo2();
    advanceTo("Introduction context prepared");

    expect(screen.getByText("No transmission performed")).toBeTruthy();
    expect(screen.getByText("No booking created")).toBeTruthy();
    expect(screen.getByText("Availability not confirmed")).toBeTruthy();
    expect(screen.getByText("No price quoted")).toBeTruthy();
    expect(screen.getByText("A versioned receipt. It can be corrected or withdrawn.")).toBeTruthy();
  });

  it("leaves the commercial model unanswered", async () => {
    await openDemo2();
    advanceTo("Commercial model stays open");

    expect(screen.getByText("Who receives payment?")).toBeTruthy();
    expect(screen.getByText("Is there a referral fee?")).toBeTruthy();
    expect(
      screen.getByText("This concept answers none of these. No commission is calculated and no settlement exists."),
    ).toBeTruthy();
  });

  it("makes no unsupported positive claim across every stage", async () => {
    await openDemo2();

    for (let step = 0; step < 7; step += 1) {
      const rendered = document.body.textContent ?? "";
      for (const claim of RESEARCH_PROHIBITED_CLAIMS) {
        expect(rendered).not.toContain(claim);
      }
      fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    }
  });

  it("resets independently of Demo 1", async () => {
    await openDemo2();
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Step 2 of 8 · Blocking unknowns")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));
    fireEvent.click(screen.getByRole("button", { name: /Demo 2: Four-day private journey/ }));

    expect(screen.getByText("Step 1 of 8 · The request")).toBeTruthy();
  });
});
