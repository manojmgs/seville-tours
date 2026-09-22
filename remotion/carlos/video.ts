/**
 * Landscape format for the Carlos concept videos.
 *
 * Separate from the vertical Reel in `remotion/theme.ts`: these are watched on a
 * phone in WhatsApp but recorded from a desktop-style product, so 16:9 keeps the
 * two-pane grammar legible after compression.
 */

export const CARLOS_VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

/** Nothing essential may sit outside this box; WhatsApp crops and compresses. */
export const SAFE = { x: 140, y: 96 } as const;

export const DURATIONS = {
  demo1: 2100, // 70s
  demo2: 2700, // 90s
  demo3: 2250, // 75s
} as const;

/** Persistent Spanish status labels. Every frame carries at least the first one. */
export const LABELS = {
  concept: "Concepto de investigación",
  proposed: "Flujo propuesto · No disponible hoy",
  collaboration: "Ningún operador real ha sido contactado · No se ha transmitido información",
  built: "Base ya construida",
} as const;
