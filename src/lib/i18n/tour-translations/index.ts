import type { Locale } from "@/lib/i18n/types";
import type { TourPage } from "@/lib/wordpress-rest/types";
import type { TourTranslation } from "./types";

import { arTourTranslations } from "./ar";
import { esTourTranslations } from "./es";
import { frTourTranslations } from "./fr";

const translationsByLocale: Partial<Record<Locale, Record<string, TourTranslation>>> = {
  es: esTourTranslations,
  fr: frTourTranslations,
  ar: arTourTranslations,
};

/**
 * Returns the manual translation for a tour slug in the given locale,
 * or null if no translation exists (en, or untranslated slug).
 * The caller should fall back to the original WordPress content when null.
 */
export function getTourTranslation(slug: string, locale: Locale): TourTranslation | null {
  if (locale === "en") return null;
  return translationsByLocale[locale]?.[slug] ?? null;
}

/**
 * Merges a translation overlay onto a WordPress-sourced TourPage.
 * Only content fields are replaced; all commerce and media data is preserved.
 */
export function applyTourTranslation(page: TourPage, translation: TourTranslation | null): TourPage {
  if (!translation) return page;

  return {
    ...page,
    title: translation.title,
    excerptHtml: translation.excerptHtml,
    contentHtml: translation.contentHtml,
    seo: {
      ...page.seo,
      ...(translation.seo?.title != null && { title: translation.seo.title }),
      ...(translation.seo?.description != null && { description: translation.seo.description }),
    },
  };
}
