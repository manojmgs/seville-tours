"use client";

import { useMemo, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/wordpress-rest/urls";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type InquiryMode = "luxury" | "gift-voucher" | "general";

type InquirySubmissionFormProps = {
  mode: InquiryMode;
  tourName?: string;
  interestName?: string;
  locale?: Locale;
};

function buildInitialMessage(
  mode: InquiryMode,
  tourName?: string,
  interestName?: string,
): string {
  if (mode === "gift-voucher") {
    return tourName
      ? `I would like a gift voucher for ${tourName}.`
      : "I would like to request a gift voucher.";
  }

  if (mode === "luxury") {
    if (tourName && interestName) {
      return `I would like luxury planning for ${tourName}.`;
    }

    if (tourName) {
      return `I would like luxury planning for ${tourName}.`;
    }

    return "I would like luxury planning for a private trip in Andalucía.";
  }

  return tourName
    ? `I would like to ask about ${tourName}.`
    : "I would like to ask about a private tour in Seville.";
}

export function InquirySubmissionForm({
  mode,
  tourName,
  interestName,
  locale = "en",
}: InquirySubmissionFormProps) {
  const copy = siteCopy(locale);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [dates, setDates] = useState("");
  const [partySize, setPartySize] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState(buildInitialMessage(mode, tourName, interestName));
  const [voucherAmount, setVoucherAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [delivery, setDelivery] = useState(copy.inquiry.placeholders.delivery);

  const modeCopy = useMemo(() => {
    if (mode === "gift-voucher") {
      return {
        title: copy.inquiry.giftTitle,
        description: copy.inquiry.giftDescription,
        cta: copy.inquiry.cta.gift,
        helper: copy.inquiry.giftHelper,
      };
    }

    if (mode === "luxury") {
      return {
        title: copy.inquiry.luxuryTitle,
        description: copy.inquiry.luxuryDescription,
        cta: copy.inquiry.cta.luxury,
        helper: copy.inquiry.luxuryHelper,
      };
    }

    return {
      title: copy.inquiry.privateTitle,
      description: copy.inquiry.privateDescription,
      cta: copy.inquiry.cta.private,
      helper: copy.inquiry.privateHelper,
    };
  }, [copy, mode]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parts: string[] = [];

    parts.push(modeCopy.title);

    if (tourName) {
      parts.push(`${copy.shared.contactCard.summaryLabels.experience}: ${tourName}`);
    }

    if (interestName) {
      parts.push(`${copy.shared.contactCard.summaryLabels.interests}: ${interestName}`);
    }

    if (name.trim()) {
      parts.push(`${copy.inquiry.labels.name}: ${name.trim()}`);
    }

    if (contact.trim()) {
      parts.push(`${copy.inquiry.labels.contact}: ${contact.trim()}`);
    }

    if (dates.trim()) {
      parts.push(`${copy.inquiry.labels.dates}: ${dates.trim()}`);
    }

    if (partySize.trim()) {
      parts.push(`${copy.inquiry.labels.partySize}: ${partySize.trim()}`);
    }

    if (budget.trim()) {
      parts.push(`${copy.inquiry.labels.budget}: ${budget.trim()}`);
    }

    if (mode === "gift-voucher") {
      if (voucherAmount.trim()) {
        parts.push(`${copy.inquiry.labels.voucherAmount}: €${voucherAmount.trim()}`);
      }

      if (recipient.trim()) {
        parts.push(`${copy.inquiry.labels.recipient}: ${recipient.trim()}`);
      }

      parts.push(`${copy.inquiry.labels.delivery}: ${delivery}`);
    }

    if (message.trim()) {
      parts.push(`${copy.inquiry.labels.message}: ${message.trim()}`);
    }

    const text = parts.join("\n");
    const url = buildWhatsAppUrl(text);
    window.location.assign(url);
  }

  return (
    <section className="mt-8 rounded-[calc(var(--radius-card)+0.5rem)] border border-[color:rgba(184,144,58,0.18)] bg-[var(--surface-card)] p-6 text-[var(--foreground)] shadow-[0_24px_80px_rgba(17,17,17,0.08)] sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
            {copy.inquiry.submitForm}
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.03em]">
            {modeCopy.title}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
            {modeCopy.description}
          </p>
        </div>
        <p className="max-w-md rounded-[1.25rem] border border-[color:rgba(184,144,58,0.18)] bg-[rgba(184,144,58,0.08)] px-4 py-3 text-sm leading-7 text-[var(--foreground)]">
          {modeCopy.helper}
        </p>
      </div>

      <form className="mt-8 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
            {copy.inquiry.labels.name}
          </span>
          <input
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={copy.inquiry.placeholders.name}
            autoComplete="name"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
            {copy.inquiry.labels.contact}
          </span>
          <input
            className="input"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder={copy.inquiry.placeholders.contact}
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
            {copy.inquiry.labels.dates}
          </span>
          <input
            className="input"
            value={dates}
            onChange={(event) => setDates(event.target.value)}
            placeholder={copy.inquiry.placeholders.dates}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
            {copy.inquiry.labels.partySize}
          </span>
          <input
            className="input"
            value={partySize}
            onChange={(event) => setPartySize(event.target.value)}
            placeholder={copy.inquiry.placeholders.partySize}
          />
        </label>

        {mode === "gift-voucher" ? (
          <>
            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                {copy.inquiry.labels.voucherAmount}
              </span>
              <input
                className="input"
                value={voucherAmount}
                onChange={(event) => setVoucherAmount(event.target.value)}
                placeholder={copy.inquiry.placeholders.voucherAmount}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                {copy.inquiry.labels.recipient}
              </span>
              <input
                className="input"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder={copy.inquiry.placeholders.recipient}
              />
            </label>

            <label className="block lg:col-span-2">
              <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                {copy.inquiry.labels.delivery}
              </span>
              <input
                className="input"
                value={delivery}
                onChange={(event) => setDelivery(event.target.value)}
                placeholder={copy.inquiry.placeholders.delivery}
              />
            </label>
          </>
        ) : (
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
              {copy.inquiry.labels.budget}
            </span>
            <input
              className="input"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder={copy.inquiry.placeholders.budget}
            />
          </label>
        )}

        <label className="block lg:col-span-2">
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
            {copy.inquiry.labels.message}
          </span>
          <textarea
            className="input min-h-32"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={copy.inquiry.placeholders.message}
          />
        </label>

        <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-[1.1rem] bg-[var(--brand-green-700)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)]"
          >
            {modeCopy.cta}
          </button>
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            {copy.inquiry.footer}
          </p>
        </div>
      </form>
    </section>
  );
}