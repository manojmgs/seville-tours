import "server-only";

import { cache } from "react";
import { getTourManifestEntryBySlug } from "@/lib/wordpress-rest/tour-manifest";
import { getBookingEngine } from "@/lib/booking-engine";
import type { MarcoTour } from "@/components/marco-chat/types";

/**
 * Build-time tour source for the Marco advisor.
 *
 * Marco recommends by stable decision-tree ids; each id maps to a WordPress slug.
 * Commerce facts (price, FareHarbor booking URL, hero image) come from the
 * pre-generated manifest — never fetched at runtime — and are merged with the
 * curated presentation metadata below (emoji, badge, duration, concise blurb),
 * which the manifest does not carry.
 */

type MarcoCatalogEntry = {
  id: string;
  slug: string;
  name: string;
  badge: string;
  emoji: string;
  /** Manifest has no duration field, so it is curated here. */
  duration: string;
  desc: string;
  tags: string[];
  /**
   * Distinctive, accent-insensitive tokens (EN/ES/FR) that let a guest surface
   * this tour by name from free text, e.g. "alcazar", "catedral", "alhambra".
   */
  matchTerms: string[];
  /** Fallbacks used only when the manifest lacks the field (e.g. day trips). */
  fallbackPrice: string;
};

const MARCO_CATALOG: readonly MarcoCatalogEntry[] = [
  {
    id: "alcazar",
    slug: "seville-alcazar-guided-tour",
    name: "Seville Alcázar Guided Tour",
    badge: "Most Popular",
    emoji: "🏰",
    duration: "1.5 hours",
    desc: "Skip the line into Europe's oldest royal palace — Mudéjar architecture, Game of Thrones locations and the royal gardens, with real historical depth.",
    tags: ["history", "architecture", "royal", "families", "couples"],
    matchTerms: ["alcazar", "alcazares", "royal palace", "palacio real"],
    fallbackPrice: "€50",
  },
  {
    id: "cathedral",
    slug: "cathedral-of-seville-guided-tour",
    name: "Cathedral of Seville Guided Tour",
    badge: "Classic",
    emoji: "⛪",
    duration: "1.5 hours",
    desc: "The world's largest Gothic cathedral, the Giralda tower and Columbus's tomb — essential Seville with a licensed historian.",
    tags: ["history", "architecture", "culture", "families"],
    matchTerms: ["cathedral", "catedral", "cathedrale", "giralda", "columbus", "colon"],
    fallbackPrice: "€45",
  },
  {
    id: "highlights",
    slug: "highlights-of-seville",
    name: "Highlights of Seville Tour",
    badge: "First Day",
    emoji: "🗺️",
    duration: "2.5 hours",
    desc: "A private orientation walk through the essential stories and corners of Seville — the perfect first-day tour for first-time visitors.",
    tags: ["first visit", "orientation", "walking", "families", "couples"],
    matchTerms: ["highlights", "orientation", "lo mejor", "essentiels", "walking tour"],
    fallbackPrice: "€65",
  },
  {
    id: "tapas",
    slug: "private-seville-tapas-tour",
    name: "Private Seville Tapas Tour",
    badge: "Food & History",
    emoji: "🍷",
    duration: "3 hours",
    desc: "Taste Seville through a historical lens — private pacing, off-the-beaten-track bars and the story behind every dish.",
    tags: ["food", "wine", "culture", "evening", "couples"],
    matchTerms: ["tapas", "food tour", "gastronomy", "gastronomia", "gastronomie"],
    fallbackPrice: "€75",
  },
  {
    id: "granada",
    slug: "luxury-day-trip-from-seville-to-granada-the-alhambra-private",
    name: "Granada & the Alhambra",
    badge: "Day Trip",
    emoji: "🕌",
    duration: "Full day",
    desc: "A private day trip from Seville to Granada and the Alhambra Palace, with chauffeur service available.",
    tags: ["day trip", "alhambra", "luxury", "architecture", "history"],
    matchTerms: ["granada", "alhambra", "generalife"],
    fallbackPrice: "From €295",
  },
  {
    id: "cordoba",
    slug: "luxury-day-trip-from-seville-to-cordoba-private",
    name: "Córdoba Private Day Trip",
    badge: "Day Trip",
    emoji: "🕍",
    duration: "Full day",
    desc: "Visit the Mezquita and Córdoba's Jewish Quarter from Seville with private guidance and flexible pacing.",
    tags: ["day trip", "history", "architecture", "couples", "luxury"],
    matchTerms: ["cordoba", "cordoue", "mezquita", "mosque", "juderia"],
    fallbackPrice: "From €250",
  },
];

function toDisplayPrice(formatted: string | undefined, fallback: string): string {
  if (!formatted) return fallback;
  // Manifest prices are locale-formatted (e.g. "50,00 €"); normalise to "€50".
  const amount = formatted.replace(/[^0-9.,]/g, "").split(/[.,]/)[0];
  return amount ? `€${amount}` : fallback;
}

async function buildTour(
  entry: MarcoCatalogEntry,
  locale: string,
): Promise<MarcoTour> {
  const manifest = await getTourManifestEntryBySlug(entry.slug);
  const bookingUrl = manifest?.commerce?.booking?.url;
  const heroImage = manifest?.commerce?.galleryImages?.[0]?.url;
  const amountMinor = manifest?.commerce?.price?.amountMinor ?? 0;
  // Self-serve requires BOTH a FareHarbor flow and a fixed, published price.
  // Private/quote tours (no URL or €0) must route to "Book direct with us".
  const priceKnown = amountMinor > 0;
  const bookable = Boolean(bookingUrl) && priceKnown;
  // Item id powers the inline live-availability picker; only self-serve tours have one.
  const fareHarborItemId = bookable
    ? (getBookingEngine().extractItemId(bookingUrl) ?? undefined)
    : undefined;

  return {
    id: entry.id,
    name: entry.name,
    badge: entry.badge,
    emoji: entry.emoji,
    price: priceKnown
      ? toDisplayPrice(manifest?.commerce?.price?.formatted, entry.fallbackPrice)
      : entry.fallbackPrice,
    duration: entry.duration,
    desc: entry.desc,
    // Prefer the FareHarbor self-serve flow; otherwise send guests to the tour
    // page, from which they can enquire. Keeps manual WhatsApp as the fallback.
    url: bookable ? (bookingUrl as string) : `/${locale}/tours/${entry.slug}/`,
    bookDirectUrl: `/${locale}/book/${entry.slug}/`,
    bookable,
    priceKnown,
    fareHarborItemId,
    img: heroImage,
    tags: entry.tags,
    matchTerms: entry.matchTerms,
  };
}

/**
 * Resolve every Marco tour for a locale. Safe to call from server components;
 * memoised per request so multiple mounts share one manifest read.
 */
export const getMarcoTours = cache(
  async (locale: string): Promise<MarcoTour[]> => {
    return Promise.all(MARCO_CATALOG.map((entry) => buildTour(entry, locale)));
  },
);
