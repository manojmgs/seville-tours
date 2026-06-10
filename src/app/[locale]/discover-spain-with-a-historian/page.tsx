import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TripPlannerShowcase } from "@/components/planning/TripPlannerShowcase";
import { PageReturnLinks } from "@/components/navigation/PageReturnLinks";
import { buildContactInquiryUrl } from "@/lib/wordpress-rest/urls";
import { siteCopy, normalizeLocale, supportedLocales } from "@/lib/i18n/site";
import type { Locale } from "@/lib/i18n/types";

type DiscoverPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: DiscoverPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;
  if (!locale) return {};

  const copy = siteCopy(locale);

  return {
    title: copy.discover.title,
    description: copy.discover.intro,
    alternates: {
      canonical: "https://sevilletoursco.com/en/discover-spain-with-a-historian/",
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: copy.discover.title,
      description: copy.discover.intro,
      locale: locale === "ar" ? "ar_EG" : locale === "fr" ? "fr_FR" : locale === "es" ? "es_ES" : "en_US",
    },
  };
}

export default async function DiscoverSpainPage({ params }: DiscoverPageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;

  if (!locale || !supportedLocales.includes(locale)) {
    notFound();
  }

  const copy = siteCopy(locale);

  return (
    <main className="page-shell min-h-screen px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[calc(var(--radius-card)+0.5rem)] border border-[color:rgba(184,144,58,0.18)] luxury-panel text-white shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_22rem] lg:items-start">
          <article>
            <PageReturnLinks locale={locale} backLabel={copy.returnLinks.backToPrevious} className="mb-6 flex items-center gap-3" />
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-gold-300)]">
              {copy.discover.eyebrow}
            </p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              {copy.discover.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-muted-dark)]">
              {copy.discover.intro}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {(copy.discover.cards as Array<{ title: string; body: string }>).map((card: { title: string; body: string }) => (
                <div key={card.title} className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
                  <p className="text-sm font-semibold text-[var(--brand-gold-100)]">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted-dark)]">{card.body}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-[1.5rem] border border-[color:rgba(184,144,58,0.18)] bg-black/20 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-100)]">
              {copy.discover.start}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted-dark)]">
              {copy.discover.startBody}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={buildContactInquiryUrl({
                  tour: "discover-spain-with-a-historian",
                  interest: "luxury",
                })}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-gold-100)] px-5 py-3 text-sm font-semibold text-[var(--surface-dark)] transition hover:bg-[var(--brand-gold-300)]"
              >
                {copy.discover.cta}
              </Link>
              <Link
                href={`/${locale}/`}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:rgba(184,144,58,0.28)] px-5 py-3 text-sm font-semibold text-[var(--brand-gold-100)] transition hover:bg-white/8"
              >
                Back to homepage
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-6xl">
        <TripPlannerShowcase locale={locale} />
      </div>
    </main>
  );
}
