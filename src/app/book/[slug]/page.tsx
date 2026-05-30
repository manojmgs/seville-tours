import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { PageReturnLinks } from "@/components/navigation/PageReturnLinks";
import {
  getStaticTourSlugs,
  getTourManifestEntryBySlug,
} from "@/lib/wordpress-rest/tour-manifest";
import { buildContactInquiryUrl } from "@/lib/wordpress-rest/urls";
import { siteCopy } from "@/lib/i18n/site";
import { getRequestLocale } from "@/lib/i18n/request-locale";

type BookingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 604800;

const getBookingContentBySlug = cache(async (slug: string) => {
  return getTourManifestEntryBySlug(slug);
});

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getStaticTourSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = siteCopy(locale);
  const { slug } = await params;
  const content = await getBookingContentBySlug(slug);

  if (!content) {
    return {
      title: `Booking not found | Seville Tours Co.`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const isBookable = content.commerce?.isBookable ?? false;

  return {
    title: isBookable
      ? `${copy.shared.bookYourTour} ${content.title} | Seville Tours Co.`
      : `${copy.shared.requestAvailabilityPricing} ${content.title} | Seville Tours Co.`,
    description: content.seo.description,
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: content.title,
      description: content.seo.description,
      locale: locale === "ar" ? "ar_EG" : locale === "fr" ? "fr_FR" : locale === "es" ? "es_ES" : "en_US",
    },
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const locale = await getRequestLocale();
  const copy = siteCopy(locale);
  const { slug } = await params;
  const content = await getBookingContentBySlug(slug);

  if (!content) {
    notFound();
  }

  const bookingUrl = content.commerce?.booking?.url;
  const isBookable = content.commerce?.isBookable ?? false;
  const isLuxuryRequestFlow = content.slug.startsWith("luxury-day-trip-");
  const contactHref = buildContactInquiryUrl(
    isLuxuryRequestFlow
      ? { tour: content.slug, interest: "luxury" }
      : content.slug,
  );

  if (!isBookable || !bookingUrl) {
    return (
      <main className="page-shell min-h-screen px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:rgba(184,144,58,0.18)] luxury-panel p-8 text-white">
          <PageReturnLinks locale={locale} backLabel={copy.returnLinks.backToTour} />

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-gold-300)]">
            {isLuxuryRequestFlow ? copy.book.luxuryRequestRoute : copy.book.requestRoute}
          </p>

          <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            {copy.book.requestAvailabilityPricing}
          </h1>

          <h2 className="mt-4 text-xl font-semibold text-[var(--brand-gold-100)]">
            {content.title}
          </h2>

          <div
            className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-muted-dark)]"
            dangerouslySetInnerHTML={{ __html: content.excerptHtml }}
          />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={contactHref}
              className="inline-flex min-h-11 items-center justify-center rounded-[1.1rem] bg-[var(--brand-gold-100)] px-6 py-3 text-sm font-semibold text-[var(--surface-dark)] transition hover:bg-[var(--brand-gold-300)]"
            >
              {isLuxuryRequestFlow ? copy.shared.startLuxuryPlanning : copy.shared.contactCarlos}
            </Link>
            <Link
              href={`/tours/${content.slug}/`}
              className="inline-flex min-h-11 items-center justify-center rounded-[1.1rem] border border-[color:rgba(184,144,58,0.28)] px-6 py-3 text-sm font-semibold text-[var(--brand-gold-100)] transition hover:bg-white/8"
            >
              {copy.shared.returnToTourPage}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell min-h-screen text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <PageReturnLinks backLabel="Back to tour" />

        <div className="card-glow mt-6 rounded-[calc(var(--radius-card)+0.25rem)] bg-[var(--surface-card)] p-5 shadow-sm ring-1 ring-[color:var(--border-soft)] sm:p-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
            {copy.book.secureBooking}
          </p>

          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Book {content.title}
          </h1>

          {content.commerce?.price ? (
            <p className="mt-3 text-lg font-semibold text-stone-800">
              {content.commerce.price.formatted}{" "}
              {content.commerce.price.vatLabel}
            </p>
          ) : null}
        </div>

        <div className="card-glow mt-6 overflow-hidden rounded-[calc(var(--radius-card)+0.25rem)] bg-[var(--surface-card)] shadow-sm ring-1 ring-[color:var(--border-soft)]">
          <iframe
            title={`Book ${content.title}`}
            src={bookingUrl}
            className="min-h-[760px] w-full border-0 md:min-h-[820px] lg:min-h-[900px]"
            loading="lazy"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-[1.25rem] border border-[color:var(--border-soft)] bg-white/70 p-4 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {copy.book.openInNewTabHint}
          </p>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-green-700)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--brand-green-900)]"
          >
            {copy.shared.openSecureBooking}
          </a>
        </div>
      </section>
    </main>
  );
}