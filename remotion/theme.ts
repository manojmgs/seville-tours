/**
 * Brand tokens for the Isabel concierge marketing video.
 * Mirrors the SevilleTours palette so the Reel matches the live product.
 */
export const COLORS = {
  green900: "#0F241A",
  green700: "#1A3A2A",
  green500: "#2C5F3F",
  gold: "#C9A84C",
  goldLight: "#E9CE7E",
  cream: "#F5EFE4",
  card: "#FFFFFF",
  white: "#FAF7F2",
  ink: "#182019",
  muted: "#7C8A80",
  whatsapp: "#25D366",
} as const;

export const FONT_DISPLAY = "Georgia, 'Times New Roman', 'Playfair Display', serif";
export const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Vertical Reel / Shorts format. */
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 720, // 24s
} as const;
