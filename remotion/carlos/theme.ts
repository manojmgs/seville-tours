import { COLORS, FONT_DISPLAY, FONT_SANS } from "../theme";

/** Landscape research videos for WhatsApp review. Separate from the vertical promo. */
export const CARLOS_VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

/** Keeps essential text away from WhatsApp's player chrome. */
export const SAFE_PADDING = 96;

export { COLORS, FONT_DISPLAY, FONT_SANS };

export const LABELS = {
  concept: "Concepto de investigación",
  future: "Flujo propuesto · No disponible hoy",
  noContact: "Ningún operador real ha sido contactado · No se ha transmitido información",
  built: "Base ya construida",
} as const;
