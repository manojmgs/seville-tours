import { getTourAvailabilityHint } from "@/lib/fareharbor/availability";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type TourAvailabilityHintProps = {
  bookingUrl?: string;
  locale: Locale;
};

const DATE_LOCALE_TAG: Record<Locale, string> = {
  en: "en-GB",
  es: "es-ES",
  fr: "fr-FR",
  ar: "ar-EG",
};

/**
 * Read-only availability hint for a FareHarbor-backed tour.
 *
 * Display-only: it shows indicative upcoming dates and never implies a held seat,
 * payment, or confirmation. Renders nothing for non-FareHarbor tours or when no
 * upcoming dates are available.
 */
export async function TourAvailabilityHint({ bookingUrl, locale }: TourAvailabilityHintProps) {
  const dates = await getTourAvailabilityHint(bookingUrl);

  if (dates.length === 0) {
    return null;
  }

  const copy = siteCopy(locale).book.availability;
  const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALE_TAG[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Madrid",
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="card-glow rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
          {copy.title}
        </p>

        <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{copy.note}</p>

        <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
          {copy.nextDatesLabel}
        </p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {dates.map((availabilityDate) => (
            <li
              key={availabilityDate.date}
              className="inline-flex min-h-11 items-center rounded-[0.85rem] border border-[color:var(--border-soft)] bg-[var(--surface-cream)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
            >
              {dateFormatter.format(new Date(`${availabilityDate.date}T12:00:00`))}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
