import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GiftVoucherConfigurator } from "@/components/home/GiftVoucherConfigurator";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeExperienceSwitcher } from "@/components/home/HomeExperienceSwitcher";
import { HomeStickyCta } from "@/components/home/HomeStickyCta";
import { HomeTrustProof } from "@/components/home/HomeTrustProof";
import { buildContactInquiryUrl } from "@/lib/wordpress-rest/urls";
import { siteCopy } from "@/lib/i18n/site";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = siteCopy(locale);

  const titleByLocale: Record<string, string> = {
    en: "Seville Tours, Private Walking Tours & Private Trips",
    es: "Tours privados en Sevilla y excursiones privadas",
    fr: "Visites privées à Séville et excursions privées",
    ar: "جولات خاصة في إشبيلية ورحلات خاصة",
  };

  const title = titleByLocale[locale] ?? titleByLocale.en;

  return {
    title,
    description: copy.home.hero.body,
    alternates: {
      canonical: "https://sevilletoursco.com/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description: copy.home.hero.body,
      locale: locale === "ar" ? "ar_EG" : locale === "fr" ? "fr_FR" : locale === "es" ? "es_ES" : "en_US",
    },
  };
}

const featuredTours = [
  {
    title: "Seville Alcazar Guided Tour",
    href: "/tours/seville-alcazar-guided-tour",
    label: "Most popular",
    description:
      "Skip the line and explore the Royal Alcázar with an official licensed guide.",
    imageUrl:
      "https://sevilletoursco.com/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-15-at-13.08.16-1.webp",
    imageAlt: "seville alcazar guided tour",
  },
  {
    title: "Cathedral of Seville Guided Tour",
    href: "/tours/cathedral-of-seville-guided-tour",
    label: "Classic",
    description:
      "Discover the Cathedral, Giralda and the historic heart of Seville.",
    imageUrl:
      "https://sevilletoursco.com/wp-content/uploads/2020/09/IMG_30082020_175951_1080_x_720_pixel-e1642420238639.jpg",
    imageAlt: "Cathedral of seville guided tour",
  },
  {
    title: "Highlights of Seville Tour",
    href: "/tours/highlights-of-seville",
    label: "First day",
    description:
      "A private orientation walk through the essential stories and corners of Seville.",
    imageUrl:
      "https://sevilletoursco.com/wp-content/uploads/2026/01/IMG_20180706_141116-01.webp",
    imageAlt: "highlights of seville guided tour",
  },
  {
    title: "Private Seville Tapas Tour",
    href: "/tours/private-seville-tapas-tour",
    label: "Food & history",
    description:
      "Taste Seville with a local historical lens and relaxed private pacing.",
    imageUrl:
      "https://sevilletoursco.com/wp-content/uploads/2021/02/WhatsApp-Image-2026-01-15-at-13.15.19-6.jpeg",
    imageAlt: "private tapas tour in seville",
  },
];

const dayTrips = [
  {
    title: "Granada & the Alhambra",
    href: "/tours/luxury-day-trip-from-seville-to-granada-the-alhambra-private",
    description:
      "A private day trip from Seville to Granada and the Alhambra.",
    imageUrl:
      "https://sevilletoursco.com/wp-content/uploads/2022/04/WhatsApp-Image-2025-12-18-at-11.46.49-1.jpeg",
    imageAlt: "granada and alhambra private tour",
  },
  {
    title: "Córdoba Private Day Trip",
    href: "/tours/luxury-day-trip-from-seville-to-cordoba-private",
    description:
      "Visit Córdoba and the Mezquita from Seville with private guidance.",
    imageUrl:
      "https://sevilletoursco.com/wp-content/uploads/2022/04/WhatsApp-Image-2025-12-18-at-11.58.19.jpeg",
    imageAlt: "luxury day trip from seville to cordoba private",
  },
  {
    title: "Ronda & White Villages",
    href: "/tours/luxury-day-trip-from-seville-to-ronda-white-villages-private",
    description:
      "Explore Ronda and the white villages as a private day trip from Seville.",
    imageUrl:
      "https://sevilletoursco.com/wp-content/uploads/2022/04/WhatsApp-Image-2025-12-18-at-11.58.19-2.jpeg",
    imageAlt: "seville to ronda day trip",
  },
];

export default async function HomePage() {
  const locale = await getRequestLocale();
  const copy = siteCopy(locale);

  return (
    <main className="page-shell min-h-screen pb-28 text-[var(--foreground)] sm:pb-0">
      <HomeHeader locale={locale} />

      <HomeExperienceSwitcher locale={locale} />

      <section id="tours" className="bg-[var(--surface-card)] pt-12 sm:pt-16 pb-10 mt-6 sm:mt-8 [content-visibility:auto] [contain-intrinsic-size:1px_980px] rounded-t-2xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
            {copy.shared.featuredTours}
          </p>
          <h2 className="font-display mt-3 text-4xl font-semibold tracking-[-0.03em]">
            {copy.home.sections.toursHeading}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
            {copy.home.sections.toursIntro}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {featuredTours.map((tour) => (
              <Link
                key={tour.href}
                href={tour.href}
                className="card-glow overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[var(--surface-cream)] transition hover:-translate-y-0.5"
              >
                <div className="relative h-44 overflow-hidden p-5 text-white">
                  <Image
                    src={tour.imageUrl}
                    alt={tour.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                    quality={65}
                    fetchPriority="low"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,80,63,0.82),rgba(6,80,63,0.2)_48%,rgba(6,80,63,0.15))]" />
                  <span className="relative inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/90">
                    {tour.label}
                  </span>
                  <h3 className="font-display relative mt-14 text-2xl font-semibold tracking-[-0.03em]">
                    {tour.title}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    {tour.description}
                  </p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-green-700)]">
                    View tour →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeTrustProof locale={locale} />

      <section id="day-trips" className="py-10 [content-visibility:auto] [contain-intrinsic-size:1px_860px]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
            {copy.shared.fromSeville}
          </p>
          <h2 className="font-display mt-3 text-4xl font-semibold tracking-[-0.03em]">
            {copy.home.sections.dayTripsHeading}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
            {copy.home.sections.dayTripsIntro}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {dayTrips.map((trip) => (
              <Link
                key={trip.href}
                href={trip.href}
                className="card-glow rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-5 transition hover:-translate-y-0.5"
              >
                <div className="relative -mx-5 -mt-5 mb-5 h-40 overflow-hidden rounded-t-[var(--radius-card)] bg-stone-200">
                  <Image
                    src={trip.imageUrl}
                    alt={trip.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                    quality={65}
                    fetchPriority="low"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,12,10,0.72),rgba(13,12,10,0.08))]" />
                </div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-500)]">
                  Private route
                </p>
                <h3 className="font-display mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  {trip.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {trip.description}
                </p>
                <span className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-green-700)]">
                  View day trip →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="luxury" className="luxury-panel py-12 text-white [content-visibility:auto] [contain-intrinsic-size:1px_760px]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-gold-300)]">
            {copy.shared.luxuryByRequest}
          </p>
          <h2 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            {copy.home.sections.luxuryHeading}
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-muted-dark)]">
            {copy.home.sections.luxuryIntro}
          </p>

          <div className="mt-8 grid gap-4 rounded-[var(--radius-card)] border border-[color:rgba(184,144,58,0.18)] bg-[rgba(255,255,255,0.02)] p-5 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-[var(--brand-gold-100)]">
                {copy.home.sections.luxuryItems[0].title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted-dark)]">
                {copy.home.sections.luxuryItems[0].body}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--brand-gold-100)]">
                {copy.home.sections.luxuryItems[1].title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted-dark)]">
                {copy.home.sections.luxuryItems[1].body}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--brand-gold-100)]">
                {copy.home.sections.luxuryItems[2].title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted-dark)]">
                {copy.home.sections.luxuryItems[2].body}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-[color:rgba(184,144,58,0.18)] bg-[rgba(0,0,0,0.14)] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-100)]">
              {copy.home.sections.luxuryAccessTitle}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted-dark)]">
              {copy.home.sections.luxuryAccessBody}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:flex">
            <Link
              href={buildContactInquiryUrl({ interest: "luxury" })}
              className="inline-flex min-h-11 items-center justify-center rounded-[1.1rem] bg-[var(--brand-gold-100)] px-6 py-3 font-semibold text-[var(--surface-dark)] transition hover:bg-[var(--brand-gold-300)]"
            >
              {copy.shared.requestLuxuryProposal}
            </Link>
            <Link
              href="/discover-spain-with-a-historian/"
              className="inline-flex min-h-11 items-center justify-center rounded-[1.1rem] border border-[color:rgba(184,144,58,0.35)] px-6 py-3 font-semibold text-[var(--brand-gold-100)] transition hover:bg-white/8"
            >
              {copy.discover.eyebrow}
            </Link>
          </div>
        </div>
      </section>

      <GiftVoucherConfigurator locale={locale} />

      <footer id="home-footer" className="border-t border-[color:rgba(184,144,58,0.18)] bg-[var(--surface-dark)] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold tracking-[-0.03em]">
              {copy.home.footer.title} <span className="text-[var(--brand-gold-300)]">Tours</span>
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted-dark)]">
              {copy.home.footer.body}
            </p>
          </div>
          <Link
            href="/contact-seville-tours-co/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:rgba(184,144,58,0.3)] px-5 py-3 text-sm font-semibold text-[var(--brand-gold-100)] transition hover:bg-white/8"
          >
            {copy.home.footer.cta}
          </Link>
        </div>
      </footer>

      <HomeStickyCta heroId="home-hero" footerId="home-footer" locale={locale} />
    </main>
  );
}