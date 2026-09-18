// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RecommendationReceipt } from "@/components/marco-chat/RecommendationReceipt";
import type { MarcoTour, RecommendationResult } from "@/components/marco-chat/types";

const dayTrip: MarcoTour = {
  id: "granada",
  name: "Granada & the Alhambra",
  badge: "Day Trip",
  emoji: "🕌",
  price: "From €295",
  duration: "Full day",
  desc: "A private day trip.",
  url: "/en/tours/granada",
  bookDirectUrl: "/en/book/granada",
  bookable: false,
  priceKnown: false,
  priceSourceStatus: "confirmation-required",
  operatorUrl: "https://example.com/granada",
  sourceUpdatedAt: "2026-05-01T12:00:00.000Z",
  confirmationItems: ["date", "final-price", "inclusions"],
  tags: ["day trip"],
  matchTerms: ["granada"],
};

const onlineTour: MarcoTour = {
  ...dayTrip,
  id: "alcazar",
  name: "Seville Alcázar Guided Tour",
  price: "€50",
  priceSourceStatus: "operator-published",
  bookable: true,
  fareHarborItemId: "577856",
  confirmationItems: ["price-unit", "format", "availability"],
};

const recommendation: RecommendationResult = {
  tourIds: ["granada", "cordoba"],
  reasonCode: "daytrip-interest",
  usedInputs: ["interest"],
};

describe("RecommendationReceipt", () => {
  it("starts collapsed and exposes an accessible disclosure", () => {
    render(
      <RecommendationReceipt
        tour={dayTrip}
        recommendation={recommendation}
        operatorName="Carlos"
        primaryColor="#1A3A2A"
        accentColor="#C9A84C"
        locale="en"
      />,
    );

    const toggle = screen.getByRole("button", { name: "Why this recommendation fits" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Why this fits")).toBeNull();

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-controls")).toBeTruthy();
    expect(screen.getByText("You said you wanted a day trip further afield.")).toBeTruthy();
    expect(screen.getByText("Source record updated May 1, 2026; this is not a live availability check.")).toBeTruthy();
    expect(screen.getByText("Booking is handled with the operator.")).toBeTruthy();
    expect(screen.queryByText(/available now|places available|confirmed availability/i)).toBeNull();
  });

  it("distinguishes online booking guidance from operator confirmation", () => {
    render(
      <RecommendationReceipt
        tour={onlineTour}
        recommendation={{
          tourIds: ["alcazar", "cathedral"],
          reasonCode: "short-visit",
          usedInputs: ["duration"],
        }}
        operatorName="Carlos"
        primaryColor="#1A3A2A"
        accentColor="#C9A84C"
        locale="en"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Why this recommendation fits" }));
    expect(screen.getByText("Online booking is available.")).toBeTruthy();
    expect(screen.getByText("Check dates when opening the booking flow.")).toBeTruthy();
    expect(screen.getByText("You said you are only here for a few hours.")).toBeTruthy();
    expect(screen.queryByText("You said you wanted a day trip further afield.")).toBeNull();
  });
});