import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TisShowcaseLauncher } from "@/components/marco-showcase/TisShowcaseLauncher";
import { normalizeLocale, supportedLocales } from "@/lib/i18n/site";
import type { Locale } from "@/lib/i18n/types";

export const metadata: Metadata = {
  title: "TIS Showcase Launcher",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type TisShowcasePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TisShowcasePage({ params }: TisShowcasePageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;

  if (!locale || !supportedLocales.includes(locale)) {
    notFound();
  }

  return <TisShowcaseLauncher />;
}