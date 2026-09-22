// @vitest-environment jsdom
import type { ReactElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RESEARCH_PROHIBITED_CLAIMS } from "@/lib/marco/research/claims";
import { DEMO3_EXCLUDED_CONCEPTS } from "@/lib/marco/research/demo3-lifecycle";
import { PARAUSTED_ALCAZAR_FIXED_GIFT_CARD } from "@/lib/parausted/gift-cards";

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

async function openDemo3() {
  vi.stubEnv("NODE_ENV", "development");
  const page = await SevilleToursResearchPage({ params: Promise.resolve({ locale: "en" }) });
  render(page as ReactElement);
  fireEvent.click(screen.getByRole("button", { name: /Demo 3: Gift, remember, refer and return/ }));
}

function advanceTo(stageLabel: string) {
  for (let step = 0; step < 6; step += 1) {
    if (screen.queryByText(new RegExp(`· ${stageLabel}$`))) return;
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
  }
  throw new Error(`Never reached stage ${stageLabel}`);
}

describe("Demo 3 — gift, remember, refer and return", () => {
  it("opens on a completed experience with nothing automatic", async () => {
    await openDemo3();

    expect(screen.getByText("Step 1 of 6 · The experience is over")).toBeTruthy();
    expect(screen.getByText("No automatic marketing")).toBeTruthy();
    expect(screen.getByText("No inferred preference")).toBeTruthy();
  });

  it("states the built gift-card foundation and the ParaUsted authority boundary", async () => {
    await openDemo3();
    advanceTo("What exists today");

    expect(screen.getByText(/Fixed Alcázar gift card · €50 · 365 days validity/)).toBeTruthy();
    expect(screen.getByText(/ParaUsted is the voucher authority/)).toBeTruthy();
    expect(screen.getByText("Read-only advisory verification, which can never redeem")).toBeTruthy();
    expect(screen.getByText("FareHarbor remains the booking and seat-capacity authority")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open the operator gift card" }).getAttribute("href")).toContain(
      `/gift-cards/${PARAUSTED_ALCAZAR_FIXED_GIFT_CARD.giftCardId}`,
    );
  });

  it("keeps purchase distinct from booking, availability and redemption", async () => {
    await openDemo3();
    advanceTo("What exists today");

    expect(screen.getByText("Buying the gift card is not booking a date")).toBeTruthy();
    expect(screen.getByText("The gift card does not confirm availability")).toBeTruthy();
    expect(screen.getByText("Redemption and booking are separate steps")).toBeTruthy();
    expect(screen.getByText("Seville Tours does not create a second voucher ledger")).toBeTruthy();
  });

  it("separates buyer from recipient without claiming automated delivery", async () => {
    await openDemo3();
    advanceTo("Giving it to someone else");

    expect(screen.getByText("The buyer and the recipient are different people")).toBeTruthy();
    expect(screen.getByText("No future date is selected")).toBeTruthy();
    expect(screen.getByText("Automated delivery to a recipient is not claimed here.")).toBeTruthy();
  });

  it("reuses the souvenir shelf with its sample disclosure and nothing-ordered footer", async () => {
    await openDemo3();
    advanceTo("Something to keep");

    expect(screen.getByRole("heading", { name: "Seville Tours Co.'s shelf" })).toBeTruthy();
    expect(
      screen.getAllByText("Sample shelf for this demonstration. Not yet approved by the operator.").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Nothing ordered yet.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /checkout|pay now|complete order/i })).toBeNull();
  });

  it("labels the lifecycle vision as unavailable and excludes network value concepts", async () => {
    await openDemo3();
    advanceTo("Future product direction");

    expect(screen.getByRole("heading", { name: "Future product direction · Not available today" })).toBeTruthy();
    expect(screen.getByText("None of this exists today.")).toBeTruthy();
    expect(
      screen.getByText(
        "No points, no balance held by us, no automatic discount, no network voucher, no settlement, no resale.",
      ),
    ).toBeTruthy();

    // The excluded concepts must never appear as something on offer, i.e. in the continuation list.
    const offered = screen
      .getByText("A possible continuation")
      .parentElement?.textContent?.toLowerCase() ?? "";
    for (const concept of DEMO3_EXCLUDED_CONCEPTS) {
      expect(offered).not.toContain(concept);
    }
  });

  it("makes no unsupported positive claim across every stage", async () => {
    await openDemo3();

    for (let step = 0; step < 5; step += 1) {
      const rendered = document.body.textContent ?? "";
      for (const claim of RESEARCH_PROHIBITED_CLAIMS) {
        expect(rendered).not.toContain(claim);
      }
      fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    }
  });

  it("resets independently", async () => {
    await openDemo3();
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Step 2 of 6 · What exists today")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));
    fireEvent.click(screen.getByRole("button", { name: /Demo 3: Gift, remember, refer and return/ }));

    expect(screen.getByText("Step 1 of 6 · The experience is over")).toBeTruthy();
  });
});
