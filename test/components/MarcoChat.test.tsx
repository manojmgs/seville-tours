// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MarcoChat } from "@/components/marco-chat/MarcoChat";
import type { MarcoConfig, MarcoTour } from "@/components/marco-chat/types";

const config: MarcoConfig = {
  persona: "Isabel",
  operatorName: "Carlos",
  brandName: "Seville Tours",
  destination: "Seville",
  region: "Andalucía",
  expertTitle: "Seville Expert",
  giftProviderName: "ParaUsted",
  primaryColor: "#1A3A2A",
  accentColor: "#C9A84C",
  whatsapp: "34600000000",
  giftCards: false,
  giftUrl: "https://example.com/gift",
};

const tour: MarcoTour = {
  id: "alcazar",
  name: "Alcázar Guided Tour",
  badge: "Popular",
  emoji: "🏛️",
  price: "€50",
  duration: "1.5 hours",
  desc: "A concise guided visit.",
  url: "https://example.com/book",
  bookDirectUrl: "/en/book/alcazar",
  bookable: true,
  priceKnown: true,
  tags: ["history"],
  matchTerms: ["alcazar"],
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function finishGreeting() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2_000);
  });
}

async function finishAnswer() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(700);
  });
}

describe("MarcoChat Journey Brief integration", () => {
  it("appears after the first answer and preserves recommendation and booking actions", async () => {
    const onClose = vi.fn();
    render(
      <MarcoChat
        open
        onClose={onClose}
        tours={[tour]}
        config={config}
        locale="en"
      />,
    );

    expect(screen.queryByText("Your Journey Brief")).toBeNull();
    await finishGreeting();

    fireEvent.click(screen.getByRole("button", { name: "Just a few hours" }));
    expect(screen.getByText("Your Journey Brief")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /your journey brief/i }));
    expect(screen.getByText("Destination")).toBeTruthy();

    await finishAnswer();
    fireEvent.click(screen.getByRole("button", { name: "History & architecture" }));
    await finishAnswer();
    fireEvent.click(screen.getByRole("button", { name: "Just me" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });

    expect(screen.getByText("Alcázar Guided Tour")).toBeTruthy();
    expect(screen.getByText((text) => text.includes("€50"))).toBeTruthy();
    expect(screen.getByRole("button", { name: "Book now" })).toBeTruthy();
    const receiptToggle = screen.getByRole("button", {
      name: "Why this recommendation fits",
    });
    expect(receiptToggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Why this fits")).toBeNull();
    fireEvent.click(receiptToggle);
    expect(receiptToggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Why this fits")).toBeTruthy();
    expect(screen.getByText("You said you are only here for a few hours.")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Close chat" }).at(-1)!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});