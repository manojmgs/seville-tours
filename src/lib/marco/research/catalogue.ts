import type { MarcoTour, RecommendationConfirmationItem } from "@/components/marco-chat/types";
import { attributionFor, type TisAttribution } from "@/lib/marco/showcase/tis-partner-catalogue";

/**
 * Catalogue presentation for the Carlos research demos.
 *
 * Every fact comes from the pre-generated WordPress manifest via `getMarcoTours`.
 * We never author a price, never check availability at runtime, and never claim a
 * match that the traveller did not actually express.
 */

const CONFIRMATION_LABELS: Record<RecommendationConfirmationItem, string> = {
  "price-unit": "Whether the price is per person or per group",
  format: "Whether a private version exists",
  availability: "Whether the date is free",
  date: "The exact date and start time",
  "final-price": "The final price",
  inclusions: "Whether monument tickets are included",
};

export type ResearchPossibility = Readonly<{
  tour: MarcoTour;
  attribution: TisAttribution;
  /** Honest reason, or an explicit statement that nothing they said matches. */
  reason: string;
  matchedOnSomethingSaid: boolean;
  notChecked: readonly string[];
}>;

/** Fixed slate across operators, so the choice of operator is a real one. */
const DEMO_SLATE: readonly { tourId: string; interest: string; reason: string }[] = [
  {
    tourId: "alcazar",
    interest: "history",
    reason: "You said history, and this is the operator's published monument tour.",
  },
  {
    tourId: "tapas",
    interest: "food",
    reason: "You said local food, and this is the operator's published food tour.",
  },
  {
    tourId: "highlights",
    interest: "architecture",
    reason: "You said architecture, and this is published as a private orientation walk.",
  },
  {
    tourId: "aloratur-caminito-alora-tapas",
    interest: "dayTrip",
    reason: "You said day trips — this one is published by a different operator, with their permission.",
  },
];

const MAX_POSSIBILITIES = 3;

export function researchPossibilities(
  tours: readonly MarcoTour[],
  interests: readonly string[],
): readonly ResearchPossibility[] {
  const all = DEMO_SLATE.flatMap((slate) => {
    const tour = tours.find((entry) => entry.id === slate.tourId);
    if (!tour) return [];

    const matchedOnSomethingSaid = interests.includes(slate.interest);

    return [
      {
        tour,
        attribution: attributionFor(tour.id),
        reason: matchedOnSomethingSaid
          ? slate.reason
          : "This does not match anything you told me. It is here so you can see the whole shelf.",
        matchedOnSomethingSaid,
        notChecked: notCheckedFor(tour),
      },
    ];
  });

  // Matched possibilities lead; we never pad the list ahead of something they actually said.
  const matched = all.filter((entry) => entry.matchedOnSomethingSaid);
  const rest = all.filter((entry) => !entry.matchedOnSomethingSaid);

  return [...matched, ...rest].slice(0, MAX_POSSIBILITIES);
}

/** Distinct operators behind the shown possibilities, so the traveller can choose one. */
export function operatorsFor(possibilities: readonly ResearchPossibility[]): readonly string[] {
  return Array.from(new Set(possibilities.map((entry) => entry.attribution.operator)));
}

export function notCheckedFor(tour: MarcoTour): readonly string[] {
  const items = (tour.confirmationItems ?? []).map((item) => CONFIRMATION_LABELS[item]);
  return tour.priceKnown ? items : ["The final price", ...items];
}

/** The operator's own published price, with the basis always attached. */
export function priceWithBasis(possibility: ResearchPossibility): string {
  return `${possibility.tour.price} ${possibility.attribution.priceBasis}`;
}

export function sourceHost(attribution: TisAttribution): string {
  return new URL(attribution.sourceUrl).hostname;
}
