import { PARAUSTED_ALCAZAR_FIXED_GIFT_CARD } from "@/lib/parausted/gift-cards";
import {
  buildParaUstedGiftCardProductUrl,
  buildParaUstedMerchantUrl,
} from "@/lib/parausted/merchant-url";
import { siteCopy, type Locale } from "@/lib/i18n/site";

export function GiftVoucherConfigurator({ locale = "en" }: { locale?: Locale }) {
  const copy = siteCopy(locale);
  const gift = copy.home.gift;
  const merchantUrl = buildParaUstedMerchantUrl(locale);
  const alcazarGiftCardUrl = buildParaUstedGiftCardProductUrl(locale, PARAUSTED_ALCAZAR_FIXED_GIFT_CARD.giftCardId);

  return (
    <section id="gift-cards" className="bg-[var(--surface-card)] py-12 [content-visibility:auto] [contain-intrinsic-size:1px_900px]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[calc(var(--radius-card)+0.35rem)] border border-[color:var(--border-soft)] bg-[var(--surface-cream)] p-6 card-glow lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
              {gift.eyebrow}
            </p>
            <div className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl">
              {gift.titleTop}<br />
              <em className="not-italic text-[var(--brand-green-700)]">{gift.titleBottom}</em>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              {gift.intro}
            </p>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[color:rgba(6,80,63,0.16)] bg-[linear-gradient(145deg,#0b4d3c,#0f7357)] text-white shadow-[0_20px_60px_rgba(6,80,63,0.18)]">
                <div className="relative p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.12),transparent_22%),radial-gradient(circle_at_78%_24%,rgba(255,255,255,0.08),transparent_18%),linear-gradient(120deg,transparent_24%,rgba(255,255,255,0.08)_36%,transparent_58%)]" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/70">
                        Seville Tours Co.
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white/90">
                        {gift.previewType}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/80">
                      {gift.previewBadge}
                    </div>
                  </div>

                  <div className="relative mt-8 rounded-[1.5rem] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/72">
                      {gift.previewBadge}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/74">
                      {gift.previewHint}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.25rem] border border-[color:rgba(6,80,63,0.16)] bg-white p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    {gift.fixedTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    {gift.fixedDescription}
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {gift.fixedSkus.map((sku) => (
                      <li
                        key={sku.title}
                        className="flex items-center justify-between gap-3 rounded-[0.85rem] border border-[color:var(--border-soft)] bg-[var(--surface-cream)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)]"
                      >
                        <span>{sku.title}</span>
                        <span className="shrink-0 text-[var(--brand-green-700)]">{sku.price}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={alcazarGiftCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[1.1rem] bg-[var(--brand-green-700)] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)]"
                  >
                    {gift.paraustedCta}
                  </a>
                </div>

                <div className="rounded-[1.25rem] border border-[color:rgba(6,80,63,0.16)] bg-white p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    {gift.flexibleTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    {gift.flexibleDescription}
                  </p>
                  <a
                    href={merchantUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[1.1rem] bg-[var(--brand-green-700)] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)]"
                  >
                    {gift.paraustedCta}
                  </a>
                </div>

                <div className="rounded-[1.25rem] border border-[color:rgba(184,144,58,0.28)] bg-[rgba(184,144,58,0.06)] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--brand-gold-500)]">
                    {gift.luxuryTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    {gift.luxuryDescription}
                  </p>
                  <a
                    href={merchantUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[1.1rem] bg-[var(--surface-dark)] px-6 py-3 text-center text-sm font-semibold tracking-[0.08em] text-[var(--brand-gold-100)] transition hover:bg-[var(--surface-dark-soft)]"
                  >
                    {gift.paraustedCta}
                  </a>
                </div>

                <div className="rounded-[1.25rem] border border-[color:rgba(6,80,63,0.16)] bg-white px-4 py-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    {gift.redemptionTitle}
                  </p>
                  <ol className="mt-3 grid gap-2">
                    {gift.redemptionSteps.map((step, index) => (
                      <li
                        key={step}
                        className="flex gap-3 text-sm leading-6 text-[var(--text-muted)]"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-cream)] text-xs font-bold text-[var(--brand-green-700)]">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-[1.25rem] border border-[color:rgba(184,144,58,0.16)] bg-white px-4 py-4 text-sm leading-7 text-[var(--text-muted)]">
                  {gift.terms}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-[color:rgba(184,144,58,0.18)] bg-white p-5 text-sm leading-7 text-[var(--text-muted)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--brand-gold-500)]">
              {copy.shared.terms}
            </p>
            <p className="mt-3">{gift.terms}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}