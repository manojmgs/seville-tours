import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchDemoShell } from "@/components/marco-research/ResearchDemoShell";
import { TIS_PARTNER_TOURS } from "@/lib/marco/showcase/tis-partner-catalogue";
import { getMarcoTours } from "@/lib/marco/tours";
import { normalizeLocale, supportedLocales } from "@/lib/i18n/site";
import type { Locale } from "@/lib/i18n/types";

export const metadata: Metadata = {
  title: "Seville Tours Co. research demos",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SevilleToursResearchPageProps = {
  params: Promise<{ locale: string }>;
};

/** Development-only research entry point. Catalogue facts come from the generated manifest. */
export default async function SevilleToursResearchPage({ params }: SevilleToursResearchPageProps) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;

  if (!locale || !supportedLocales.includes(locale)) {
    notFound();
  }

  const tours = await getMarcoTours(locale);

  if (tours.length === 0) {
    notFound();
  }

  return <ResearchDemoShell tours={[...tours, ...TIS_PARTNER_TOURS]} locale={locale} />;
}
