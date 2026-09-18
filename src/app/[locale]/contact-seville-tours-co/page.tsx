import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { InquirySubmissionForm } from "@/components/contact/InquirySubmissionForm";
import { PageReturnLinks } from "@/components/navigation/PageReturnLinks";
import { buildContactInquiryUrl, buildWhatsAppUrl } from "@/lib/wordpress-rest/urls";
import { buildParaUstedMerchantUrl } from "@/lib/parausted/merchant-url";
import { siteCopy, normalizeLocale, supportedLocales } from "@/lib/i18n/site";
import type { Locale } from "@/lib/i18n/types";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    tour?: string;
    interest?: string;
    type?: string;
    amount?: string;
    experience?: string;
    duration?: string;
    places?: string;
    interests?: string;
    name?: string;
    contact?: string;
    message?: string;
  }>;
};

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;
  if (!locale) return {};

  const copy = siteCopy(locale);

  return {
    title: copy.shared.contactCard.title,
    description: copy.shared.contactCard.intro,
    alternates: {
      canonical: "https://sevilletoursco.com/en/contact-seville-tours-co/",
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: copy.shared.contactCard.title,
      description: copy.shared.contactCard.intro,
      locale: locale === "ar" ? "ar_EG" : locale === "fr" ? "fr_FR" : locale === "es" ? "es_ES" : "en_US",
    },
  };
}

function formatTourName(slug?: string): string | undefined {
  if (!slug) return undefined;
  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatInterest(interest?: string): string | undefined {
  if (!interest) return undefined;
  switch (interest) {
    case "luxury": return "Luxury proposal";
    case "plan-trip": return "Plan trip request";
    case "gift-voucher": return "Gift voucher request";
    case "whatsapp": return "WhatsApp Carlos";
    default:
      return interest
        .split("-")
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");
  }
}

function formatVoucherType(type?: string): string | undefined {
  if (!type) return undefined;
  if (type === "private") return "Private tours";
  if (type === "luxury") return "Luxury escapes";
  return type;
}

function buildEnquiryTitle(tourName?: string, interestName?: string): string | undefined {
  if (tourName && interestName) return `${interestName} for ${tourName}`;
  return tourName ?? interestName;
}

function parseList(value?: string): string[] {
  if (!value) return [];
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;

  if (!locale || !supportedLocales.includes(locale)) {
    notFound();
  }

  const copy = siteCopy(locale);
  const {
    tour, interest, type, amount, experience, duration,
    places, interests, name, contact, message,
  } = await searchParams;

  // Gift purchases live entirely on ParaUsted; never route gift intent through WhatsApp.
  if (interest === "gift-voucher") {
    redirect(buildParaUstedMerchantUrl(locale));
  }

  const formattedTourName = formatTourName(tour);
  const formattedInterest = formatInterest(interest);
  const formattedVoucherType = formatVoucherType(type);
  const enquiryTitle = buildEnquiryTitle(formattedTourName, formattedInterest);
  const selectedPlaces = parseList(places);
  const selectedInterests = parseList(interests);
  const isLuxuryInterest = interest === "luxury";
  const isGiftVoucherInterest = interest === "gift-voucher";
  const isPlanTripInterest = interest === "plan-trip";
  const isWhatsappInterest = interest === "whatsapp";
  const submissionMode = isLuxuryInterest ? "luxury" : "general";
  const whatsappHref = buildWhatsAppUrl(
    formattedTourName && formattedInterest
      ? `Hello Carlos, I would like to ask about a ${formattedInterest.toLowerCase()} for ${formattedTourName}.`
      : formattedTourName
        ? `Hello Carlos, I would like to ask about ${formattedTourName}.`
        : formattedInterest
          ? `Hello Carlos, I would like to ask about ${formattedInterest.toLowerCase()}.`
          : "Hello Carlos, I would like to ask about a private tour in Seville.",
  );
  const mailtoSubject = encodeURIComponent(
    enquiryTitle ? `Enquiry about ${enquiryTitle}` : "Seville Tours enquiry",
  );

  return (
    <main className="page-shell min-h-screen px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <article className="card-glow rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-6 sm:p-8">
          <PageReturnLinks locale={locale} backLabel={copy.returnLinks.back} />

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
            {copy.shared.contactCard.title}
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            {copy.shared.contactCard.heading[isPlanTripInterest ? "planTrip" : isGiftVoucherInterest ? "giftVoucher" : isWhatsappInterest ? "whatsapp" : "default"]}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-muted)]">
            {copy.shared.contactCard.intro}
          </p>

          {enquiryTitle ? (
            <div className="mt-6 rounded-[1.25rem] border border-[color:rgba(6,80,63,0.12)] bg-[var(--brand-green-100)] p-4 text-sm text-[var(--brand-green-900)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em]">
                {copy.shared.contactCard.currentEnquiry}
              </p>
              <p className="mt-2 font-semibold">{enquiryTitle}</p>
              <p className="mt-1 leading-6 text-[color:rgba(6,80,63,0.82)]">
                {formattedTourName && formattedInterest
                  ? "Carlos can use this tour and request context to reply with the right next step in one answer."
                  : formattedTourName
                    ? "Carlos can use this selected tour to reply with availability, booking guidance, or a custom proposal."
                    : "Carlos can use this request context to reply with the right next step or manual confirmation."}
              </p>
            </div>
          ) : null}

          {(isPlanTripInterest || isWhatsappInterest) && (
            <div className="mt-4 rounded-[1.25rem] border border-[color:rgba(184,144,58,0.18)] bg-[rgba(184,144,58,0.08)] p-4 text-sm leading-7 text-[var(--foreground)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--brand-gold-500)]">
                {copy.shared.contactCard.manualConfirmationTitle}
              </p>
              <p className="mt-2">
                {copy.shared.contactCard.manualConfirmationBody}
              </p>
            </div>
          )}

          {isLuxuryInterest ? (
            <div className="mt-4 rounded-[1.25rem] border border-[color:rgba(184,144,58,0.18)] bg-[rgba(184,144,58,0.08)] p-4 text-sm leading-7 text-[var(--foreground)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--brand-gold-500)]">
                {copy.shared.contactCard.luxuryNotesTitle}
              </p>
              <p className="mt-2">
                {copy.shared.contactCard.luxuryNotesBody}
              </p>
            </div>
          ) : null}

          {(experience || duration || formattedVoucherType || amount) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {experience ? (
                <div className="rounded-[1.1rem] border border-[color:var(--border-soft)] bg-white p-4 text-sm">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    {copy.shared.contactCard.summaryLabels.experience}
                  </p>
                  <p className="mt-2 font-semibold capitalize">{experience}</p>
                </div>
              ) : null}
              {duration ? (
                <div className="rounded-[1.1rem] border border-[color:var(--border-soft)] bg-white p-4 text-sm">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    {copy.shared.contactCard.summaryLabels.duration}
                  </p>
                  <p className="mt-2 font-semibold">{duration}</p>
                </div>
              ) : null}
              {formattedVoucherType ? (
                <div className="rounded-[1.1rem] border border-[color:var(--border-soft)] bg-white p-4 text-sm">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    {copy.shared.contactCard.summaryLabels.voucherType}
                  </p>
                  <p className="mt-2 font-semibold">{formattedVoucherType}</p>
                </div>
              ) : null}
              {amount ? (
                <div className="rounded-[1.1rem] border border-[color:var(--border-soft)] bg-white p-4 text-sm">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    {copy.shared.contactCard.summaryLabels.amount}
                  </p>
                  <p className="mt-2 font-semibold">€{amount}</p>
                </div>
              ) : null}
            </div>
          )}

          {selectedPlaces.length > 0 || selectedInterests.length > 0 || name || contact || message ? (
            <div className="mt-6 grid gap-4 rounded-[1.25rem] border border-[color:var(--border-soft)] bg-white p-4">
              {selectedPlaces.length > 0 ? (
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    Places
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedPlaces.map((place) => (
                      <span
                        key={place}
                        className="rounded-full bg-[var(--brand-green-100)] px-3 py-1.5 text-sm font-semibold text-[var(--brand-green-900)]"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedInterests.length > 0 ? (
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    Interests
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedInterests.map((entry) => (
                      <span
                        key={entry}
                        className="rounded-full bg-[rgba(184,144,58,0.12)] px-3 py-1.5 text-sm font-semibold text-[color:var(--brand-gold-500)]"
                      >
                        {entry}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {name || contact || message ? (
                <div className="grid gap-2 text-sm leading-7 text-[var(--text-muted)]">
                  {name ? (
                    <p>
                      <strong className="text-[var(--foreground)]">{copy.shared.contactCard.summaryLabels.name}:</strong> {name}
                    </p>
                  ) : null}
                  {contact ? (
                    <p>
                      <strong className="text-[var(--foreground)]">{copy.shared.contactCard.summaryLabels.contact}:</strong> {contact}
                    </p>
                  ) : null}
                  {message ? (
                    <p>
                      <strong className="text-[var(--foreground)]">{copy.shared.contactCard.summaryLabels.message}:</strong> {message}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 grid gap-3 sm:flex">
            <a
              href={whatsappHref}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(37,211,102,0.22)] transition hover:brightness-95"
            >
              {isWhatsappInterest ? copy.shared.contactCard.buttons.openWhatsApp : copy.shared.contactCard.buttons.whatsapp}
            </a>
            <a
              href={`mailto:contact@sevilletoursco.com?subject=${mailtoSubject}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[color:var(--brand-green-700)] hover:text-[var(--brand-green-700)]"
            >
              {copy.shared.contactCard.buttons.email}
            </a>
          </div>

          {isGiftVoucherInterest ? (
            <section className="mt-8 rounded-[calc(var(--radius-card)+0.5rem)] border border-[color:rgba(6,80,63,0.12)] bg-[var(--surface-card)] p-6 text-[var(--foreground)] shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
                {copy.home.gift.eyebrow}
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
                {copy.home.gift.terms}
              </p>
              <a
                href={buildParaUstedMerchantUrl(locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[1.1rem] bg-[var(--brand-green-700)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)]"
              >
                {copy.home.gift.paraustedCta}
              </a>
            </section>
          ) : (
            <InquirySubmissionForm
              mode={submissionMode}
              tourName={formattedTourName}
              interestName={formattedInterest}
              locale={locale}
            />
          )}
        </article>

        <aside className="luxury-panel rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:rgba(184,144,58,0.2)] p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-gold-300)]">{copy.shared.contactCard.title}</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--text-muted-dark)]">
            {(copy.shared.contactCard.aside as string[]).map((item: string) => (
              <p key={item}>{item}</p>
            ))}
          </div>

          <div className="mt-8 rounded-[1.25rem] border border-[color:rgba(184,144,58,0.18)] bg-white/5 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-gold-100)]">
              {copy.shared.contactCard.browsePrompt}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href={`/${locale}/`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-gold-100)] px-5 py-3 text-sm font-semibold text-[var(--surface-dark)] transition hover:bg-[var(--brand-gold-300)]"
              >
                {copy.shared.contactCard.browseButtons.homepage}
              </Link>
              <Link
                href={buildContactInquiryUrl({
                  tour: "discover-spain-with-a-historian",
                  interest: "luxury",
                })}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:rgba(184,144,58,0.3)] px-5 py-3 text-sm font-semibold text-[var(--brand-gold-100)] transition hover:bg-white/8"
              >
                {copy.shared.contactCard.browseButtons.planning}
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
