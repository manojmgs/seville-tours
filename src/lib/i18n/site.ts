import type { Locale, LocaleDirection, SiteCopy } from "./types";
import { enCopy } from "./locales/en";
import { esCopy } from "./locales/es";
import { frCopy } from "./locales/fr";
import { arCopy } from "./locales/ar";

export type { Locale } from "./types";
export { supportedLocales } from "./types";

const rtlLocales = new Set<Locale>(["ar"]);
const localeAliases: Record<string, Locale> = {
  en: "en",
  es: "es",
  fr: "fr",
  ar: "ar",
  "ar-sa": "ar",
  "ar-ae": "ar",
  "ar-eg": "ar",
};

export function normalizeLocale(value?: string | null): Locale | undefined {
  if (!value) {
    return undefined;
  }

  const lower = value.trim().toLowerCase();
  if (lower in localeAliases) {
    return localeAliases[lower];
  }

  const base = lower.split("-")[0];
  return localeAliases[base];
}

export function detectLocale(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) {
    return "en";
  }

  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tagPart, qPart] = part.trim().split(";q=");
      return {
        tag: tagPart,
        quality: qPart ? Number(qPart) : 1,
      };
    })
    .filter(({ tag }) => Boolean(tag))
    .sort((left, right) => right.quality - left.quality);

  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate.tag);
    if (locale) {
      return locale;
    }
  }

  return "en";
}

export function localeDirection(locale: Locale): LocaleDirection {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}

const localeCopies: Record<Locale, SiteCopy> = {
  en: enCopy,
  es: esCopy,
  fr: frCopy,
  ar: arCopy,
};

export function siteCopy(locale: Locale): SiteCopy {
  return localeCopies[locale] ?? enCopy;
}
