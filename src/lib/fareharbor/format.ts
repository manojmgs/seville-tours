import type { Locale } from "@/lib/i18n/types";

/** Maps an app locale to a BCP-47 tag for Intl formatting. */
export const INTL_LOCALE_TAG: Record<Locale, string> = {
  en: "en-GB",
  es: "es-ES",
  fr: "fr-FR",
  ar: "ar-EG",
};

/** Formats a cents amount as a localized currency string. */
export function formatMoneyCents(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE_TAG[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Extracts the wall-clock "HH:MM" from a tour-local ISO datetime without timezone shifts. */
export function slotTime(isoDateTime: string): string {
  return isoDateTime.slice(11, 16);
}

/** Returns the slot duration in whole minutes. */
export function durationMinutes(startAt: string, endAt: string): number {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / 60000);
}

/** Formats an ISO date ("2026-06-20") as a localized weekday/day/month label. */
export function formatBookingDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(`${isoDate}T12:00:00`));
}

/** Localized "Month YYYY" label for a calendar header. */
export function formatMonthLabel(year: number, month: number, locale: Locale): string {
  const padded = String(month).padStart(2, "0");
  return new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date(`${year}-${padded}-01T12:00:00`));
}

/**
 * Localized single-letter weekday headers, Monday-first to match the booking
 * calendar grid (FareHarbor weeks start on Monday).
 */
export function weekdayInitials(locale: Locale): string[] {
  const formatter = new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], {
    weekday: "short",
    timeZone: "Europe/Madrid",
  });
  // 2026-06-01 is a Monday; build seven consecutive days from it.
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(`2026-06-0${index + 1}T12:00:00`)).slice(0, 2),
  );
}

