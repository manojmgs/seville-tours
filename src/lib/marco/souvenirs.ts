/**
 * Operator souvenir shelves — print-on-demand keepsakes listed under each
 * operator's own slug.
 *
 * Three rules this module encodes:
 * 1. The operator decides what is listed and how it is branded (their name, the
 *    city, or nothing). We supply templates; the published product is theirs.
 * 2. Nothing is made before it is ordered, so there is no stock, no minimum and
 *    no capacity — which is why this is goods, never a travel service.
 * 3. A shelf entry is only presentable as the operator's once they approve it.
 *    Until then it carries `status: "sample"` and the UI must say so.
 */

import { PARAUSTED_ALCAZAR_FIXED_GIFT_CARD } from "@/lib/parausted/gift-cards";

export type SouvenirBranding = "operator" | "city" | "unbranded";

export type SouvenirFulfilment = "ship-home" | "waiting-on-arrival" | "collect-on-the-day";

export type SouvenirStatus = "sample" | "operator-approved";

/** A customer-selected print-on-demand choice, e.g. size or colour. */
export type SouvenirOption = {
  label: string;
  values: readonly string[];
};

export type SouvenirProduct = {
  id: string;
  name: string;
  blurb: string;
  emoji: string;
  /** Operator-set price. We never author one. */
  price: string;
  branding: SouvenirBranding;
  options: readonly SouvenirOption[];
  fulfilment: readonly SouvenirFulfilment[];
  /** Marco tour ids this keepsake relates to; empty means it suits the whole shelf. */
  tourIds: readonly string[];
  /** The template the operator started from, kept for provenance. */
  templateId: string;
  status: SouvenirStatus;
  /** Operator-published validity, e.g. "365 days". Only set when the operator states one. */
  validity?: string;
  /**
   * ParaUsted gift-card id when this entry is a real, purchasable product.
   * Present means purchase, payment, issuance and redemption belong to
   * ParaUsted — we only deep-link to their hosted product page.
   */
  paraUstedGiftCardId?: string;
};

export type OperatorShelf = {
  /** Matches the operator's own page slug. */
  operatorSlug: string;
  operatorName: string;
  city: string;
  products: readonly SouvenirProduct[];
};

const SEVILLE_TOURS_SHELF: OperatorShelf = {
  operatorSlug: "seville-tours-co",
  operatorName: "Seville Tours Co.",
  city: "Sevilla",
  products: [
    {
      id: "alcazar-gift-card",
      name: "Alc\u00e1zar tour gift card",
      blurb:
        "The operator's published gift card for the Alc\u00e1zar guided tour. Bought and issued by ParaUsted; the date is chosen later.",
      emoji: "\ud83c\udf81",
      price: `\u20ac${PARAUSTED_ALCAZAR_FIXED_GIFT_CARD.amountEur}`,
      branding: "operator",
      options: [],
      fulfilment: ["ship-home"],
      tourIds: ["alcazar"],
      templateId: "parausted-fixed-gift-card",
      status: "operator-approved",
      validity: "365 days",
      paraUstedGiftCardId: PARAUSTED_ALCAZAR_FIXED_GIFT_CARD.giftCardId,
    },
    {
      id: "route-print",
      name: "Route print",
      blurb: "The walk you actually did, drawn as a map worth framing, with the date.",
      emoji: "🗺️",
      price: "€28",
      branding: "unbranded",
      options: [{ label: "Size", values: ["A4", "A3", "50×70cm"] }],
      fulfilment: ["ship-home", "waiting-on-arrival"],
      tourIds: [],
      templateId: "tpl-route-map-01",
      status: "sample",
    },
    {
      id: "azulejo-print",
      name: "Azulejo pattern print",
      blurb: "The tilework from the palace, as a print. City name only — no logo.",
      emoji: "🟦",
      price: "€24",
      branding: "city",
      options: [{ label: "Size", values: ["A4", "A3"] }],
      fulfilment: ["ship-home", "waiting-on-arrival", "collect-on-the-day"],
      tourIds: ["alcazar"],
      templateId: "tpl-pattern-tile-03",
      status: "sample",
    },
    {
      id: "journey-book",
      name: "Printed journey book",
      blurb: "What you wanted, what you chose, where you walked — as a book.",
      emoji: "📖",
      price: "€45",
      branding: "unbranded",
      options: [{ label: "Cover", values: ["Softcover", "Hardcover"] }],
      fulfilment: ["ship-home"],
      tourIds: [],
      templateId: "tpl-journey-book-01",
      status: "sample",
    },
    {
      id: "city-tee",
      name: "Sevilla tee",
      blurb: "City typography, printed after you order it. Pick your size.",
      emoji: "👕",
      price: "€32",
      branding: "city",
      options: [
        { label: "Size", values: ["XS", "S", "M", "L", "XL", "XXL"] },
        { label: "Colour", values: ["Natural", "Black", "Olive"] },
      ],
      fulfilment: ["ship-home", "waiting-on-arrival"],
      tourIds: [],
      templateId: "tpl-city-type-02",
      status: "sample",
    },
    {
      id: "operator-tote",
      name: "Operator tote",
      blurb: "Carries the operator's mark, because they chose to put it there.",
      emoji: "👜",
      price: "€22",
      branding: "operator",
      options: [{ label: "Size", values: ["Standard", "Large"] }],
      fulfilment: ["ship-home", "collect-on-the-day"],
      tourIds: [],
      templateId: "tpl-tote-01",
      status: "sample",
    },
  ],
};

const SHELVES: readonly OperatorShelf[] = [SEVILLE_TOURS_SHELF];

export function shelfForOperator(operatorSlug: string): OperatorShelf | undefined {
  return SHELVES.find((shelf) => shelf.operatorSlug === operatorSlug);
}

/**
 * Keepsakes tied to a specific tour first, then the operator's general shelf, so
 * the most relevant object leads without hiding the rest.
 */
export function shelfProductsForTour(
  shelf: OperatorShelf,
  tourId?: string,
): readonly SouvenirProduct[] {
  if (!tourId) return shelf.products;
  const related = shelf.products.filter((product) => product.tourIds.includes(tourId));
  const general = shelf.products.filter((product) => product.tourIds.length === 0);
  return [...related, ...general];
}
