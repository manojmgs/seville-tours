/**
 * Catalogue facts for the Carlos concept videos.
 *
 * Copied verbatim from the validated research demo at
 * `/en/tis-showcase/seville-tours-research`, which resolves them from the local
 * generated WordPress manifest. Captured 2026-09-21. Kept as a video-only module
 * so rendering never touches application code or the network.
 *
 * Re-verify against the demo before re-rendering if the manifest is regenerated.
 */

export type VideoTourFact = Readonly<{
  title: string;
  operator: string;
  price: string;
  duration: string;
  why: string;
  notChecked: readonly string[];
}>;

export const SOURCE_LINE = "Fuente: sevilletoursco.com · leído el 18-09-2026";

const NOT_CHECKED_ES = [
  "Si el precio es por persona o por grupo",
  "Si existe una versión privada",
  "Si la fecha está libre",
] as const;

export const DEMO1_TOURS: readonly VideoTourFact[] = [
  {
    title: "Seville Alcázar Guided Tour",
    operator: "Seville Tours Co.",
    price: "€50 por persona",
    duration: "1,5 horas",
    why: "Dijo historia, y este es el tour de monumento que ya publicas.",
    notChecked: NOT_CHECKED_ES,
  },
  {
    title: "Private Seville Tapas Tour",
    operator: "Seville Tours Co.",
    price: "€65 por persona",
    duration: "3 horas",
    why: "Dijo comida local, y este es el tour gastronómico que ya publicas.",
    notChecked: NOT_CHECKED_ES,
  },
  {
    title: "Highlights of Seville Tour",
    operator: "Seville Tours Co.",
    price: "€130 por persona",
    duration: "2,5 horas",
    why: "Dijo arquitectura, y este se publica como paseo privado de orientación.",
    notChecked: NOT_CHECKED_ES,
  },
];

/** Carlos's own published Granada day trip. Price is quote-based, not fixed. */
export const GRANADA_FACT: VideoTourFact = {
  title: "Granada y la Alhambra · día privado desde Sevilla",
  operator: "Seville Tours Co.",
  price: "Desde €295 por persona",
  duration: "Día completo",
  why: "Producto propio publicado. El precio final se confirma contigo.",
  notChecked: ["El precio final", "Si la fecha está libre", "Si incluye entradas"],
};

export const ALCAZAR_GIFT_CARD = {
  title: "Tarjeta regalo · Alcázar",
  price: "€50",
  validity: "365 días de validez",
  issuer: "ParaUsted",
} as const;
