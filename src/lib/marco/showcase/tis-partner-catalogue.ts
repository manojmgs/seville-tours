import type { MarcoTour } from "@/components/marco-chat/types";

/**
 * Partner catalogue shown in the TIS demonstration.
 *
 * Every entry is operator-published information displayed with the operator's
 * written permission, captured on a stated date from a stated source. We never
 * author a price, never check availability, and never combine these into a
 * package. Each operator's booking flow remains their own.
 */

export type TisAttribution = Readonly<{
  operator: string;
  /** Page the published facts were read from. */
  sourceUrl: string;
  /** ISO date the facts were captured, so staleness is visible rather than hidden. */
  capturedOn: string;
  /** Operators publish on different bases; hiding that would misrepresent the price. */
  priceBasis: "per person" | "per group";
  permission: "own-catalogue" | "written-permission";
}>;

const ALORATUR_SOURCE = "https://aloratur.com/actividades/";
const CAPTURED_ON = "2026-09-18";

function aloraturAttribution(sourceUrl: string, priceBasis: TisAttribution["priceBasis"]): TisAttribution {
  return {
    operator: "Áloratur",
    sourceUrl,
    capturedOn: CAPTURED_ON,
    priceBasis,
    permission: "written-permission",
  };
}

const SEVILLE_TOURS_CO_ATTRIBUTION: TisAttribution = {
  operator: "Seville Tours Co.",
  sourceUrl: "https://sevilletoursco.com/",
  capturedOn: CAPTURED_ON,
  priceBasis: "per person",
  permission: "own-catalogue",
};

/** Áloratur, Álora (Málaga). Published prices read from their own activity pages. */
export const TIS_PARTNER_TOURS: readonly MarcoTour[] = [
  {
    id: "aloratur-caminito-guided",
    name: "Caminito del Rey with an official guide",
    badge: "Sells out",
    emoji: "🥾",
    price: "€28",
    duration: "3 hours",
    desc: "The 5 km cliff walkway through the Gaitanes gorge with an official Caminito guide, in small groups.",
    url: "https://aloratur.com/caminito-del-rey-comprar-entradas/",
    bookDirectUrl: "https://aloratur.com/caminito-del-rey-comprar-entradas/",
    bookable: true,
    priceKnown: true,
    priceSourceStatus: "operator-published",
    operatorUrl: "https://aloratur.com/",
    confirmationItems: ["price-unit", "availability", "date"],
    tags: ["nature", "walking", "outdoors", "day trip"],
    matchTerms: ["caminito", "caminito del rey", "gaitanes"],
  },
  {
    id: "aloratur-caminito-bus",
    name: "Caminito del Rey by bus from Málaga",
    badge: "Most booked",
    emoji: "🚌",
    price: "€60",
    duration: "7 hours",
    desc: "Direct coach from Málaga, official tickets, guide from the first moment and a welcome pack.",
    url: "https://aloratur.com/bus-caminito-entradas/",
    bookDirectUrl: "https://aloratur.com/bus-caminito-entradas/",
    bookable: true,
    priceKnown: true,
    priceSourceStatus: "operator-published",
    operatorUrl: "https://aloratur.com/",
    confirmationItems: ["price-unit", "availability", "date"],
    tags: ["nature", "walking", "outdoors", "day trip"],
    matchTerms: ["caminito", "bus caminito", "malaga"],
  },
  {
    id: "aloratur-ronda-setenil",
    name: "Ronda and Setenil de las Bodegas",
    badge: "Best rated",
    emoji: "🌉",
    price: "€26",
    duration: "10 hours",
    desc: "Coach from Málaga to Ronda's Puente Nuevo and the cave streets of Setenil, with an official guide.",
    url: "https://app.turitop.com/booking/box/A436/P56/step1/es/0/aHR0cHM6Ly9hbG9yYXR1ci5jb20v/0/0?returnUrl=aHR0cHM6Ly9hbG9yYXR1ci5jb20vdmlzaXRhci1yb25kYS8=&loading=1",
    bookDirectUrl:
      "https://app.turitop.com/booking/box/A436/P56/step1/es/0/aHR0cHM6Ly9hbG9yYXR1ci5jb20v/0/0?returnUrl=aHR0cHM6Ly9hbG9yYXR1ci5jb20vdmlzaXRhci1yb25kYS8=&loading=1",
    bookable: true,
    priceKnown: true,
    priceSourceStatus: "operator-published",
    operatorUrl: "https://aloratur.com/",
    confirmationItems: ["price-unit", "availability", "date"],
    tags: ["day trip", "history", "architecture", "culture"],
    matchTerms: ["ronda", "setenil", "zahara", "white villages", "pueblos blancos"],
  },
  {
    id: "aloratur-gibraltar-mijas",
    name: "Gibraltar and Mijas pueblo",
    badge: "In demand",
    emoji: "🐒",
    price: "€25",
    duration: "11 hours",
    desc: "Coach from Málaga, transfer from the frontier into Gibraltar, free time, then the white village of Mijas.",
    url: "https://aloratur.com/gibraltar-mijas/",
    bookDirectUrl: "https://aloratur.com/gibraltar-mijas/",
    bookable: true,
    priceKnown: true,
    priceSourceStatus: "operator-published",
    operatorUrl: "https://aloratur.com/",
    confirmationItems: ["price-unit", "availability", "date"],
    tags: ["day trip", "culture", "orientation"],
    matchTerms: ["gibraltar", "mijas"],
  },
  {
    id: "aloratur-caminito-alora-tapas",
    name: "Caminito del Rey, Álora and tapas",
    badge: "In demand",
    emoji: "🍽️",
    price: "€65",
    duration: "10 hours",
    desc: "The walkway plus a guided visit to Álora and local tapas, designed by a local team as one day.",
    url: "https://aloratur.com/bus-alora-caminito/",
    bookDirectUrl: "https://aloratur.com/bus-alora-caminito/",
    bookable: true,
    priceKnown: true,
    priceSourceStatus: "operator-published",
    operatorUrl: "https://aloratur.com/",
    confirmationItems: ["price-unit", "availability", "date"],
    tags: ["nature", "walking", "food", "day trip", "culture"],
    matchTerms: ["alora", "tapas", "caminito"],
  },
  {
    id: "aloratur-caminito-private",
    name: "Private, tailored Caminito del Rey",
    badge: "Private",
    emoji: "🧭",
    price: "€180",
    duration: "3 hours",
    desc: "A fully personalised private visit to the Caminito del Rey, arranged directly with the local operator.",
    url: "https://aloratur.com/caminito-del-rey-guia-privado/",
    bookDirectUrl: "https://aloratur.com/caminito-del-rey-guia-privado/",
    bookable: true,
    priceKnown: true,
    priceSourceStatus: "operator-published",
    operatorUrl: "https://aloratur.com/",
    confirmationItems: ["price-unit", "format", "availability"],
    tags: ["nature", "walking", "outdoors", "private"],
    matchTerms: ["caminito privado", "private caminito"],
  },
  {
    id: "aloratur-via-ferrata",
    name: "Caminito del Rey via ferrata",
    badge: "For the bold",
    emoji: "🧗",
    price: "€59",
    duration: "3 hours",
    desc: "Via ferrata with zip line, Tibetan bridge and monkey bridge beside the Caminito del Rey.",
    url: "https://aloratur.com/via-ferrata-caminito-del-rey/",
    bookDirectUrl: "https://aloratur.com/via-ferrata-caminito-del-rey/",
    bookable: true,
    priceKnown: true,
    priceSourceStatus: "operator-published",
    operatorUrl: "https://aloratur.com/",
    confirmationItems: ["price-unit", "availability", "date"],
    tags: ["nature", "outdoors", "adventure"],
    matchTerms: ["via ferrata", "ferrata"],
  },
];

const PARTNER_ATTRIBUTION: Readonly<Record<string, TisAttribution>> = Object.freeze({
  "aloratur-caminito-guided": aloraturAttribution("https://aloratur.com/caminito-del-rey-comprar-entradas/", "per person"),
  "aloratur-caminito-bus": aloraturAttribution("https://aloratur.com/bus-caminito-entradas/", "per person"),
  "aloratur-ronda-setenil": aloraturAttribution("https://aloratur.com/visitar-ronda/", "per person"),
  "aloratur-gibraltar-mijas": aloraturAttribution("https://aloratur.com/gibraltar-mijas/", "per person"),
  "aloratur-caminito-alora-tapas": aloraturAttribution("https://aloratur.com/bus-alora-caminito/", "per person"),
  // The only per-group price in the catalogue. Showing the basis prevents a false comparison.
  "aloratur-caminito-private": aloraturAttribution("https://aloratur.com/caminito-del-rey-guia-privado/", "per group"),
  "aloratur-via-ferrata": aloraturAttribution("https://aloratur.com/via-ferrata-caminito-del-rey/", "per person"),
});

export function attributionFor(tourId: string): TisAttribution {
  return PARTNER_ATTRIBUTION[tourId] ?? SEVILLE_TOURS_CO_ATTRIBUTION;
}

export { ALORATUR_SOURCE };
