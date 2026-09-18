// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { JourneyBrief } from "@/components/marco-chat/JourneyBrief";
import { getChatCopy } from "@/components/marco-chat/chat-copy";
import { deriveJourneyBrief } from "@/lib/marco/journey-brief";

afterEach(cleanup);

function renderBrief(
  input: Parameters<typeof deriveJourneyBrief>[0] = {
    locale: "en",
    destination: "Seville",
    answers: { interest: "food" },
  },
) {
  return render(
    <JourneyBrief
      brief={deriveJourneyBrief(input)}
      copy={getChatCopy(input.locale)}
      providerName="ParaUsted"
      accentColor="#C9A84C"
    />,
  );
}

describe("JourneyBrief", () => {
  it("renders only meaningful fields after a controlled answer", () => {
    renderBrief();

    const toggle = screen.getByRole("button", { name: /your journey brief/i });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Destination")).toBeNull();

    fireEvent.click(toggle);

    expect(screen.getByText("What you shared")).toBeTruthy();
    expect(screen.getByText("Destination")).toBeTruthy();
    expect(screen.getByText("Seville")).toBeTruthy();
    expect(screen.getByText("Your preferences")).toBeTruthy();
    expect(screen.getByText("Interests")).toBeTruthy();
    expect(screen.getByText("Food & wine")).toBeTruthy();
    expect(screen.queryByText("Walking preference")).toBeNull();
    expect(screen.queryByText("Timing preference")).toBeNull();
    expect(screen.queryByText("Operator confirmation needed")).toBeNull();
  });

  it("keeps preferences, separate interests, and unresolved dates visibly distinct", () => {
    renderBrief({
      locale: "en",
      destination: "Seville",
      format: "private",
      answers: { group: "family" },
      dateText: "this Friday",
      partySize: 4,
      interests: ["history", "food"],
      walkingPreference: "minimal",
      timingPreference: "flexible",
      selectedTourIds: ["alcazar"],
      operatorConfirmations: ["Confirm the requested date with the operator."],
    });

    fireEvent.click(screen.getByRole("button", { name: /your journey brief/i }));

    expect(screen.getByText("Private")).toBeTruthy();
    expect(screen.getAllByText("Preference").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("History & architecture")).toBeTruthy();
    expect(screen.getByText("Food & wine")).toBeTruthy();
    expect(screen.getByText("this Friday")).toBeTruthy();
    expect(screen.getByText("Needs confirmation")).toBeTruthy();
    expect(screen.getByText("Confirm the requested date with the operator.")).toBeTruthy();
    expect(screen.getByText("alcazar")).toBeTruthy();
    expect(screen.queryByText("travellerProvided")).toBeNull();
    expect(screen.queryByText(/price|availability|booking|lead|matched/i)).toBeNull();
  });

  it("supports keyboard expansion and localized labels", () => {
    renderBrief({
      locale: "es",
      destination: "Sevilla",
      answers: { interest: "history" },
    });

    const toggle = screen.getByRole("button", { name: /tu resumen de viaje/i });
    fireEvent.keyDown(toggle, { key: "Enter" });

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Lo que has compartido")).toBeTruthy();
    expect(screen.getByText("Historia y arquitectura")).toBeTruthy();

    fireEvent.keyDown(toggle, { key: " " });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });
});