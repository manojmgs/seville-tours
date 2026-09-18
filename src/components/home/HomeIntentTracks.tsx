"use client";

import { siteCopy, type Locale } from "@/lib/i18n/site";
import { HomeScrollLink } from "./HomeScrollLink";

type HomeIntentTracksProps = {
  locale?: Locale;
};

/** Fired to ask HomeHeader to open the Plan-a-Trip concierge. */
export const OPEN_PLAN_TRIP_EVENT = "st:open-plan-trip";

const CTA_BASE =
  "mt-auto inline-flex min-h-11 w-fit items-center justify-center gap-1.5 rounded-[1.1rem] px-5 py-3 text-sm font-semibold transition";

export function HomeIntentTracks({ locale = "en" }: HomeIntentTracksProps) {
  const { tracks } = siteCopy(locale).home;

  const openPlanner = () => {
    window.dispatchEvent(new Event(OPEN_PLAN_TRIP_EVENT));
  };

  return (
    <section
      id="ways-to-travel"
      aria-labelledby="ways-to-travel-heading"
      className="py-10 sm:py-14 [content-visibility:auto] [contain-intrinsic-size:1px_720px]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
          {tracks.eyebrow}
        </p>
        <h2
          id="ways-to-travel-heading"
          className="font-display mt-3 text-4xl font-semibold tracking-[-0.03em]"
        >
          {tracks.heading}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
          {tracks.intro}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {/* Private */}
          <article className="card-glow flex h-full flex-col rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[var(--surface-cream)] p-6">
            <span className="inline-flex w-fit rounded-full border border-[color:rgba(6,80,63,0.12)] bg-[rgba(6,80,63,0.08)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
              {tracks.cards.private.badge}
            </span>
            <h3 className="font-display mt-4 text-2xl font-semibold tracking-[-0.03em]">
              {tracks.cards.private.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              {tracks.cards.private.body}
            </p>
            <HomeScrollLink
              targetId="tours"
              className={`${CTA_BASE} bg-[var(--brand-green-700)] text-white hover:brightness-110`}
            >
              {tracks.cards.private.cta}
            </HomeScrollLink>
          </article>

          {/* Luxury */}
          <article className="card-glow luxury-shine luxury-glow flex h-full flex-col rounded-[var(--radius-card)] border border-[color:rgba(184,144,58,0.28)] bg-[var(--surface-dark)] p-6 text-white">
            <span className="inline-flex w-fit rounded-full border border-[color:rgba(184,144,58,0.3)] bg-[rgba(184,144,58,0.12)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-gold-100)]">
              {tracks.cards.luxury.badge}
            </span>
            <h3 className="gold-shimmer-text font-display mt-4 text-2xl font-semibold tracking-[-0.03em]">
              {tracks.cards.luxury.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted-dark)]">
              {tracks.cards.luxury.body}
            </p>
            <HomeScrollLink
              targetId="luxury"
              className={`${CTA_BASE} luxury-shine bg-[var(--brand-gold-100)] text-[var(--surface-dark)] hover:bg-[var(--brand-gold-300)]`}
            >
              {tracks.cards.luxury.cta}
            </HomeScrollLink>
          </article>

          {/* Plan my trip */}
          <article className="card-glow flex h-full flex-col rounded-[var(--radius-card)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-6">
            <span className="inline-flex w-fit rounded-full border border-[color:rgba(184,144,58,0.3)] bg-[rgba(184,144,58,0.1)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-gold-500)]">
              {tracks.cards.planner.badge}
            </span>
            <h3 className="font-display mt-4 text-2xl font-semibold tracking-[-0.03em]">
              {tracks.cards.planner.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              {tracks.cards.planner.body}
            </p>
            <button
              type="button"
              onClick={openPlanner}
              className={`${CTA_BASE} border border-[color:var(--brand-green-700)] text-[var(--brand-green-700)] hover:bg-[rgba(6,80,63,0.06)]`}
            >
              {tracks.cards.planner.cta}
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
