import { siteCopy, type Locale } from "@/lib/i18n/site";

type Props = {
  locale?: Locale;
};

export function HomeTrustProof({ locale = "en" }: Props) {
  const copy = siteCopy(locale);
  const trust = copy.home.sections.trustProof;

  return (
    <section
      aria-labelledby="trust-proof-heading"
      className="bg-[var(--surface-card)] py-10 sm:py-12 [content-visibility:auto] [contain-intrinsic-size:1px_420px]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
          {trust.eyebrow}
        </p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.1fr_1.5fr] lg:items-start lg:gap-8">
          <div>
            <h2
              id="trust-proof-heading"
              className="font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl"
            >
              {trust.heading}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-muted)]">
              {trust.body}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trust.cards.map((card) => {
              const hasRating = Boolean(card.rating && card.reviews);

              return (
                <article
                  key={card.source}
                  className="rounded-2xl border border-[color:var(--border-soft)] bg-[var(--surface-cream)] p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-green-700)]">
                    {card.source}
                  </p>

                  {hasRating ? (
                    <>
                      <p className="mt-3 text-sm font-semibold text-[var(--brand-gold-500)]" aria-hidden="true">
                        ★★★★★
                      </p>
                      <p className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                        {card.rating}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[var(--brand-green-700)]">
                        {card.reviews}
                      </p>
                      <p className="sr-only">
                        {card.rating} rating on {card.source} based on {card.reviews}
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                      {card.registrationId}
                    </p>
                  )}

                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{card.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}