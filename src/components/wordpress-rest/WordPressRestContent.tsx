import Link from "next/link";
import { TourGallery } from "@/components/wordpress-rest/TourGallery";
import { PageReturnLinks } from "@/components/navigation/PageReturnLinks";
import type { TourPage } from "@/lib/wordpress-rest/types";
import { buildContactInquiryUrl } from "@/lib/wordpress-rest/urls";
import { siteCopy, type Locale } from "@/lib/i18n/site";

function buildTourStructuredData(content: TourPage) {
  const canonicalUrl = content.seo.canonical;
  const images = [
    content.featuredImage?.url,
    ...(content.commerce?.galleryImages?.map((image) => image.url) ?? []),
  ].filter((value): value is string => Boolean(value));
  const price = content.commerce?.price;
  const bookingUrl = content.commerce?.booking?.url;

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: content.title,
    description: content.seo.description ?? content.title,
    url: canonicalUrl,
    image: images.length > 0 ? images : undefined,
  };

  if (content.commerce?.isBookable && price && bookingUrl) {
    structuredData.offers = {
      "@type": "Offer",
      url: bookingUrl,
      price: price.amountMinor / 100,
      priceCurrency: price.currencyCode,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    };
  }

  return structuredData;
}

type WordPressRestContentProps = {
  content: TourPage;
  locale?: Locale;
};

export function WordPressRestContentView({
  content,
  locale = "en",
}: WordPressRestContentProps) {
  const copy = siteCopy(locale);
  const price = content.commerce?.price;
  const isBookable = content.commerce?.isBookable ?? false;
  const isRequestOnly = content.commerce?.isRequestOnly ?? !isBookable;
  const isLuxuryRequestFlow = content.slug.startsWith("luxury-day-trip-");
  const contactHref = buildContactInquiryUrl(
    isLuxuryRequestFlow
      ? { tour: content.slug, interest: "luxury" }
      : content.slug,
  );
  const galleryImages = content.commerce?.galleryImages ?? [];
  const reviews = content.commerce?.reviews;
  const asideClasses = isRequestOnly
    ? "luxury-panel rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:rgba(184,144,58,0.2)] p-6 text-white shadow-sm lg:sticky lg:top-8"
    : "rounded-[calc(var(--radius-card)+0.25rem)] bg-[linear-gradient(160deg,var(--brand-green-900),var(--brand-green-700))] p-6 text-white shadow-sm lg:sticky lg:top-8";

  return (
    <main className="page-shell min-h-screen text-[var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildTourStructuredData(content)),
        }}
      />
      <article className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageReturnLinks backLabel="Back to previous" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="min-w-0">
            {galleryImages.length > 0 || content.featuredImage ? (
              <TourGallery
                images={galleryImages}
                title={content.title}
                fallbackImage={content.featuredImage}
              />
            ) : null}
          </section>

          <aside className={asideClasses}>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-gold-100)]">
              {copy.wordpress.sevilleTours}
            </p>

            <h1 className="font-display text-balance text-4xl font-semibold tracking-[-0.03em] text-[var(--brand-gold-100)] sm:text-5xl">
              {content.title}
            </h1>

            {isBookable && price ? (
              <p className="mt-4 text-lg font-semibold text-white">
                {price.formatted} {price.vatLabel}
              </p>
            ) : null}

            {isRequestOnly ? (
              <p className="mt-4 inline-flex rounded-full border border-[color:rgba(184,144,58,0.28)] bg-[rgba(184,144,58,0.14)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-gold-100)]">
                {isLuxuryRequestFlow ? "Luxury proposal" : "Custom proposal"}
              </p>
            ) : null}

            {content.seo.description ? (
              <div
                className="mt-6 text-base leading-7 text-white/82"
                dangerouslySetInnerHTML={{ __html: content.excerptHtml }}
              />
            ) : null}

            {isBookable ? (
              <Link
                href={`/book/${content.slug}`}
                className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-[1.1rem] bg-[var(--brand-gold-100)] px-6 py-3 text-base font-semibold text-[var(--surface-dark)] transition hover:bg-[var(--brand-gold-300)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-100)]"
              >
                {copy.wordpress.bookYourTour}
              </Link>
            ) : (
              <Link
                href={contactHref}
                className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-[1.1rem] bg-[var(--brand-gold-100)] px-6 py-3 text-base font-semibold text-[var(--surface-dark)] transition hover:bg-[var(--brand-gold-300)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-100)]"
              >
                {isLuxuryRequestFlow
                  ? copy.shared.startLuxuryPlanning
                  : copy.wordpress.requestAvailabilityPricing}
              </Link>
            )}
          </aside>
        </div>

        <section className="card-glow mt-10 rounded-[calc(var(--radius-card)+0.25rem)] bg-[var(--surface-card)] p-6 shadow-sm ring-1 ring-[color:var(--border-soft)] sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-stone-950">
            {copy.wordpress.description}
          </h2>

          <div
            className="mt-6 max-w-none text-base leading-8 text-stone-800 [&_a]:text-[var(--brand-green-700)] [&_img]:rounded-2xl [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-5 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: content.contentHtml }}
          />
        </section>

        <section className="card-glow mt-6 rounded-[calc(var(--radius-card)+0.25rem)] bg-[var(--surface-card)] p-6 shadow-sm ring-1 ring-[color:var(--border-soft)] sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                {copy.wordpress.reviews} ({reviews?.reviewCount ?? 0})
              </h2>
              {reviews && reviews.reviewCount > 0 && reviews.averageRating > 0 ? (
                <p className="mt-2 text-sm font-semibold text-[var(--brand-green-700)]">
                  Average rating {reviews.averageRating.toFixed(1)} / 5
                </p>
              ) : null}
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              {copy.wordpress.externalReviews}
            </p>
          </div>

          {reviews && reviews.reviewCount > 0 ? (
            <p className="mt-4 text-base leading-7 text-stone-700">
              This tour currently has {reviews.reviewCount} review
              {reviews.reviewCount === 1 ? "" : "s"} recorded in WooCommerce.
            </p>
          ) : (
            <p className="mt-4 text-base leading-7 text-stone-700">
              Be the first to review &quot;{content.title}&quot;.
            </p>
          )}
        </section>

      </article>
    </main>
  );
}