import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TisTravellerExperience } from "@/components/marco-showcase/TisTravellerExperience";
import { TIS_PARTNER_TOURS } from "@/lib/marco/showcase/tis-partner-catalogue";
import { buildParaUstedMerchantUrl } from "@/lib/parausted/merchant-url";
import { getMarcoTours } from "@/lib/marco/tours";
import { normalizeLocale, supportedLocales } from "@/lib/i18n/site";
import type { Locale } from "@/lib/i18n/types";

export const metadata: Metadata = {
  title: "TIS Traveller Playback",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type TisTravellerPlaybackPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TisTravellerPlaybackPage({ params }: TisTravellerPlaybackPageProps) {
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

  return (
    <TisTravellerExperience
      tours={[...tours, ...TIS_PARTNER_TOURS]}
      locale={locale}
      giftUrl={buildParaUstedMerchantUrl(locale)}
    />
  );
}