import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WordPressRestContentView } from "@/components/wordpress-rest/WordPressRestContent";
import { RelatedProductsSection } from "@/components/wordpress-rest/RelatedProductsSection";
import { TourAvailabilityHint } from "@/components/booking/TourAvailabilityHint";
import {
  getDeterministicTourContentBySlug,
  getStaticTourSlugs,
} from "@/lib/wordpress-rest/tour-manifest";
import { normalizeLocale, supportedLocales } from "@/lib/i18n/site";
import { getTourTranslation, applyTourTranslation } from "@/lib/i18n/tour-translations";
import type { Locale } from "@/lib/i18n/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sevilletoursco.com";

type TourPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const revalidate = 604800;

export async function generateStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  const slugs = await getStaticTourSlugs();
  return supportedLocales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: TourPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;
  if (!locale) return {};

  const content = await getDeterministicTourContentBySlug(slug);
  if (!content) {
    return {
      title: "Tour not found | Seville Tours Co.",
      robots: { index: false, follow: false },
    };
  }

  const translation = getTourTranslation(slug, locale);
  const page = applyTourTranslation(content, translation);

  const ogLocaleByLocale: Record<Locale, string> = {
    en: "en_US",
    es: "es_ES",
    fr: "fr_FR",
    ar: "ar_EG",
  };

  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: {
      canonical: `${SITE_URL}/en/tours/${slug}/`,
      languages: Object.fromEntries(
        supportedLocales.map((l) => [l, `${SITE_URL}/${l}/tours/${slug}/`]),
      ),
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
      title: page.seo.title,
      description: page.seo.description,
      url: `${SITE_URL}/${locale}/tours/${slug}/`,
      type: "website",
      siteName: "Seville Tours Co.",
      locale: ogLocaleByLocale[locale],
      images: page.featuredImage
        ? [{ url: page.featuredImage.url, alt: page.featuredImage.alt || page.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo.title,
      description: page.seo.description,
      images: page.featuredImage ? [page.featuredImage.url] : undefined,
    },
  };
}

export default async function TourPage({ params }: TourPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;

  if (!locale || !supportedLocales.includes(locale)) {
    notFound();
  }

  const content = await getDeterministicTourContentBySlug(slug);
  if (!content) {
    notFound();
  }

  const translation = getTourTranslation(slug, locale);
  const page = applyTourTranslation(content, translation);

  return (
    <>
      <WordPressRestContentView content={page} locale={locale} />
      <Suspense fallback={null}>
        <TourAvailabilityHint
          bookingUrl={content.commerce?.booking?.url}
          locale={locale}
        />
      </Suspense>
      <Suspense fallback={null}>
        <RelatedProductsSection
          relatedProductsUrl={content.commerce?.relatedProductsUrl}
          currentSlug={content.slug}
        />
      </Suspense>
    </>
  );
}
