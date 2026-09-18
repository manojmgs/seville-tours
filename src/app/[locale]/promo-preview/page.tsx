import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PromoPoster } from "@/components/marketing/PromoPoster";
import { normalizeLocale, supportedLocales } from "@/lib/i18n/site";
import type { Locale } from "@/lib/i18n/types";

type PromoPreviewProps = {
  params: Promise<{ locale: string }>;
};

// Internal preview only — keep it out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PromoPreviewPage({ params }: PromoPreviewProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;

  if (!locale || !supportedLocales.includes(locale)) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F241A] px-4 py-12">
      <div className="w-full max-w-[380px]">
        <PromoPoster locale={locale} />
        <p className="mt-6 text-center text-sm text-white/70">
          The video loops automatically. Tap “{" "}
          <span className="font-semibold text-[#E9CE7E]">Start planning</span>{" "}
          ” to open the concierge chat.
        </p>
      </div>
    </main>
  );
}
