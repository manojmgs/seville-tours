import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WordPressRestContentView } from "@/components/wordpress-rest/WordPressRestContent";
import { RelatedProductsSection } from "@/components/wordpress-rest/RelatedProductsSection";
import {
  getDeterministicTourContentBySlug,
  getStaticTourSlugs,
} from "@/lib/wordpress-rest/tour-manifest";

type TourPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 604800;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getStaticTourSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: TourPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getDeterministicTourContentBySlug(slug);

  if (!content) {
    return {
      title: "Tour not found | Seville Tours Co.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: {
      canonical: content.seo.canonical,
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
      title: content.seo.title,
      description: content.seo.description,
      url: content.seo.canonical,
      type: "website",
      siteName: "Seville Tours Co.",
      images: content.featuredImage
        ? [
            {
              url: content.featuredImage.url,
              alt: content.featuredImage.alt || content.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo.title,
      description: content.seo.description,
      images: content.featuredImage ? [content.featuredImage.url] : undefined,
    },
  };
}

export default async function TourPage({ params }: TourPageProps) {
  const { slug } = await params;
  const content = await getDeterministicTourContentBySlug(slug);

  if (!content) {
    notFound();
  }

  return (
    <>
      <WordPressRestContentView content={content} />
      <Suspense fallback={null}>
        <RelatedProductsSection
          relatedProductsUrl={content.commerce?.relatedProductsUrl}
          currentSlug={content.slug}
        />
      </Suspense>
    </>
  );
}
