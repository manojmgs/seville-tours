/**
 * Catalogue facts for the Carlos concept videos.
 *
 * Copied deliberately rather than imported: `getMarcoTours` is `server-only` and
 * reads the generated manifest from disk, which must not run inside frame
 * rendering. Each entry records where the fact came from so staleness is visible.
 *
 * Source: public/generated/wordpress-tour-manifest.json via src/lib/marco/tours.ts
 * Partner source: src/lib/marco/showcase/tis-partner-catalogue.ts (written permission on file)
 * Captured: 2026-09-18 · re-verify before any external use.
 */

export type VideoPossibility = {
  name: string;
  operator: string;
  price: string;
  priceBasis: "por persona" | "por grupo";
  duration: string;
  reason: string;
  notChecked: readonly string[];
  source: string;
  permissioned?: boolean;
};

export const DEMO1_POSSIBILITIES: readonly VideoPossibility[] = [
  {
    name: "Seville Alcázar Guided Tour",
    operator: "Seville Tours Co.",
    price: "€50",
    priceBasis: "por persona",
    duration: "1,5 h",
    reason: "Dijo historia, y esto es el tour de monumento que el operador publica.",
    notChecked: ["Si la fecha está libre", "Si existe versión privada", "Si las entradas van incluidas"],
    source: "sevilletoursco.com",
  },
  {
    name: "Highlights of Seville Tour",
    operator: "Seville Tours Co.",
    price: "€65",
    priceBasis: "por persona",
    duration: "2,5 h",
    reason: "Dijo arquitectura; se publica como paseo privado de orientación.",
    notChecked: ["Si la fecha está libre", "Si existe versión privada"],
    source: "sevilletoursco.com",
  },
  {
    name: "Private Seville Tapas Tour",
    operator: "Seville Tours Co.",
    price: "€75",
    priceBasis: "por persona",
    duration: "3 h",
    reason: "Dijo comida local, y esto es el tour gastronómico publicado.",
    notChecked: ["Si la fecha está libre", "El precio final"],
    source: "sevilletoursco.com",
  },
];

/** Carlos's own published Granada product. He is not required to pass it on. */
export const GRANADA_OWN_PRODUCT = {
  name: "Granada y la Alhambra · día privado desde Sevilla",
  operator: "Seville Tours Co.",
  price: "Desde €295",
  priceBasis: "por persona",
  note: "Precio final y disponibilidad los confirma el operador.",
  source: "sevilletoursco.com",
} as const;

export const ALCAZAR_GIFT_CARD = {
  name: "Tarjeta regalo · Alcázar",
  price: "€50",
  validity: "365 días de validez",
  authority: "ParaUsted emite, cobra y canjea",
  source: "src/lib/parausted/gift-cards.ts",
} as const;

export const SOUVENIR_SAMPLES: readonly string[] = [
  "Lámina de la ruta",
  "Foto del guía",
  "Recuerdo del recorrido",
  "Objeto local",
  "Recuerdo en audio",
  "Libro del viaje impreso",
];
