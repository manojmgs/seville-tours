import { describe, expect, it } from "vitest";

import { answerQuestion } from "@/lib/marco/knowledge-base";
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
  whatsapp: "+34600000000",
  giftCards: true,
  giftUrl: "https://example.com/gift",
};

const tours: MarcoTour[] = [
  {
    id: "alcazar",
    name: "Seville Alcázar Guided Tour",
    badge: "Most Popular",
    emoji: "🏰",
    price: "€50",
    duration: "1.5 hours",
    desc: "Skip-the-line palace tour.",
    url: "https://fareharbor.com/embeds/book/sevilletoursco/items/577856/",
    bookDirectUrl: "/en/book/seville-alcazar-guided-tour/",
    bookable: true,
    priceKnown: true,
    tags: ["history", "architecture"],
    matchTerms: ["alcazar"],
  },
  {
    id: "granada",
    name: "Granada & the Alhambra",
    badge: "Day Trip",
    emoji: "🕌",
    price: "From €295",
    duration: "Full day",
    desc: "Private day trip to Granada.",
    url: "/en/tours/luxury-day-trip-from-seville-to-granada-the-alhambra-private/",
    bookDirectUrl: "/en/book/luxury-day-trip-from-seville-to-granada-the-alhambra-private/",
    bookable: false,
    priceKnown: false,
    tags: ["day trip", "history"],
    matchTerms: ["granada"],
  },
];

describe("answerQuestion — intent routing corrections", () => {
  it("does not return general booking instructions for a cancellation question", () => {
    const answer = answerQuestion("Can I cancel my booking?", tours, config);
    expect(answer.kind).toBe("escalate");
    expect(answer.text).not.toContain("book and pay instantly online");
  });

  it("routes a cancellation-policy question to cancellation handling", () => {
    const answer = answerQuestion("What is your cancellation policy?", tours, config);
    expect(answer.kind).toBe("escalate");
  });

  it("does not return pricing for a walking-amount question", () => {
    const answer = answerQuestion("How much walking is there?", tours, config);
    expect(answer.kind).toBe("escalate");
    expect(answer.text).not.toContain("•");
    expect(answer.text).not.toContain("€50");
  });

  it("routes a limited-walking suitability question away from an invented answer", () => {
    const answer = answerQuestion("Is this suitable if we prefer limited walking?", tours, config);
    expect(answer.kind).toBe("escalate");
  });

  it("returns the corrected private/group information for a group-tours question", () => {
    const answer = answerQuestion("Do you have group tours?", tours, config);
    expect(answer.kind).toBe("reply");
    expect(answer.text).toContain("small-group");
    expect(answer.text).not.toContain("Every tour we run is private");
  });

  it("still returns price information for a valid price question", () => {
    const answer = answerQuestion("How much does the Alcázar tour cost?", tours, config);
    expect(answer.kind).toBe("reply");
    expect(answer.text).toContain("€50");
  });

  it("still returns booking information for a valid booking question", () => {
    const answer = answerQuestion("How do I book a tour?", tours, config);
    expect(answer.kind).toBe("reply");
    expect(answer.text).toContain(config.operatorName);
  });

  it("still escalates honestly for an unsupported operational question", () => {
    const answer = answerQuestion("Is there parking near the meeting point?", tours, config);
    expect(answer.kind).toBe("escalate");
  });

  it("uses the corrected private/group wording in Spanish", () => {
    const answer = answerQuestion("¿Es privado el tour?", tours, config, "es");
    expect(answer.kind).toBe("reply");
    expect(answer.text).not.toContain("Todos nuestros tours son privados");
  });
});

describe("answerQuestion — regression protection", () => {
  it("keeps existing price values and mapping unchanged", () => {
    const answer = answerQuestion("What's the price?", tours, config);
    expect(answer.kind).toBe("reply");
    expect(answer.text).toContain("Seville Alcázar Guided Tour — €50");
  });

  it("keeps existing booking-answer behaviour available", () => {
    const answer = answerQuestion("How can I reserve a tour?", tours, config);
    expect(answer.kind).toBe("reply");
  });

  it("keeps honest escalation available for unverifiable facts", () => {
    const answer = answerQuestion("Is it wheelchair accessible?", tours, config);
    expect(answer.kind).toBe("escalate");
  });
});
