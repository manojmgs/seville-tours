// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TisTripPlan } from "@/components/marco-showcase/TisTripPlan";
import type { MarcoTour } from "@/components/marco-chat/types";
import {
  experienceItemId,
  TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID,
  type TisPhase,
  type TisTripPlanItem,
} from "@/lib/marco/showcase/tis-conversation-state";

const alcazar: MarcoTour = {
  id: "alcazar",
  name: "Seville Alcázar Guided Tour",
  badge: "Most Popular",
  emoji: "🏰",
  price: "€50",
  duration: "1.5 hours",
  desc: "A grounded Alcázar experience.",
  url: "/en/book/seville-alcazar-guided-tour/",
  bookDirectUrl: "/en/book/seville-alcazar-guided-tour/",
  bookable: true,
  priceKnown: true,
  priceSourceStatus: "operator-published",
  operatorUrl: "/en/tours/seville-alcazar-guided-tour/",
  confirmationItems: ["price-unit", "format", "availability"],
  fareHarborItemId: "577856",
  tags: ["history"],
  matchTerms: ["alcazar"],
};

const savedItem: TisTripPlanItem = {
  id: experienceItemId("alcazar"),
  kind: "experience",
  status: "savedPossibility",
  tourId: "alcazar",
};

const requestItem: TisTripPlanItem = {
  id: TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID,
  kind: "privateRequest",
  status: "requestInPreparation",
};

let isDesktopViewport = true;

function mockMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("min-width") ? isDesktopViewport : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  isDesktopViewport = true;
  mockMatchMedia();
});

afterEach(cleanup);

function renderTripPlan(items: readonly TisTripPlanItem[], phase: TisPhase, dispatch = vi.fn()) {
  render(<TisTripPlan tours={[alcazar]} items={items} phase={phase} dispatch={dispatch} />);
  return { dispatch };
}

describe("TisTripPlan", () => {
  it("shows the empty state and zero counts when there are no items", () => {
    renderTripPlan([], "gathering");

    expect(screen.getByText("Your selected possibilities and requests will appear here.")).toBeTruthy();
    expect(screen.getByText("0 saved possibilities · 0 requests in preparation · 0 confirmed items")).toBeTruthy();
    expect(screen.getByText("No confirmed items yet.")).toBeTruthy();
  });

  it("renders the saved Alcázar card with the existing price and booking link, and dispatches removal", () => {
    const { dispatch } = renderTripPlan([savedItem], "deciding");

    expect(screen.getByText("Seville Alcázar Guided Tour")).toBeTruthy();
    expect(screen.getByText("€50")).toBeTruthy();
    expect(screen.getByText("Not selected")).toBeTruthy();
    expect(screen.getByText("Nothing booked")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Check dates" }).getAttribute("href")).toBe(alcazar.url);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "removeTripPlanItem",
      id: experienceItemId("alcazar"),
    });
  });

  it("renders the private request card with separate interests and preferences, and only a remove action", () => {
    const { dispatch } = renderTripPlan([requestItem], "deciding");

    expect(screen.getByText("Private Seville experience")).toBeTruthy();
    expect(screen.getByText("Historical Seville")).toBeTruthy();
    expect(screen.getByText("Local food")).toBeTruthy();
    expect(screen.getByText("Private, if available")).toBeTruthy();
    expect(screen.getByText("Relaxed pace")).toBeTruthy();
    expect(screen.getByText("Exact date or date range")).toBeTruthy();
    expect(screen.getByText("Not sent yet")).toBeTruthy();
    expect(screen.getByText("Nothing has been sent to an operator.")).toBeTruthy();
    expect(screen.queryByText(/€\d/)).toBeNull();
    expect(screen.queryByText(/historical seville and local food/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Remove request" }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "removeTripPlanItem",
      id: TIS_PRIVATE_REQUEST_TRIP_PLAN_ITEM_ID,
    });
  });

  it("shows a truthful empty state once the traveller has moved past gathering without a request", () => {
    renderTripPlan([], "deciding");

    expect(screen.getByText("No private request is currently being prepared.")).toBeTruthy();
    expect(screen.queryByText("No requests in preparation yet.")).toBeNull();
  });

  it("renders as an always-visible region on desktop with no collapse toggle", () => {
    isDesktopViewport = true;
    renderTripPlan([], "gathering");

    expect(screen.getByRole("complementary", { name: "Your Trip Plan" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Trip Plan ·/ })).toBeNull();
  });

  it("renders as a collapsible mobile summary that expands, closes, and returns focus", () => {
    isDesktopViewport = false;
    renderTripPlan([savedItem], "deciding");

    const summary = screen.getByRole("button", { name: "Trip Plan · 1 possibility · 0 requests" });
    expect(summary.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region", { name: "Your Trip Plan" })).toBeNull();

    fireEvent.click(summary);
    expect(summary.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("region", { name: "Your Trip Plan" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close Trip Plan" }));
    expect(screen.queryByRole("region", { name: "Your Trip Plan" })).toBeNull();
    expect(document.activeElement).toBe(summary);
  });

  it("never calls fetch or opens a window from any Trip Plan action", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    isDesktopViewport = false;
    renderTripPlan([savedItem, requestItem], "deciding");

    fireEvent.click(screen.getByRole("button", { name: /Trip Plan ·/ }));
    fireEvent.click(screen.getByRole("button", { name: "Remove request" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    openSpy.mockRestore();
  });
});
