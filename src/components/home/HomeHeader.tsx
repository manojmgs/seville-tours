"use client";

import Link from "next/link";
import { useState } from "react";
import { HomeScrollLink } from "./HomeScrollLink";
import { PlanTripModal } from "./PlanTripModal";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type HomeHeaderProps = {
  locale?: Locale;
};

export function HomeHeader({ locale = "en" }: HomeHeaderProps) {
  const [isPlanTripOpen, setIsPlanTripOpen] = useState(false);
  const copy = siteCopy(locale);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[color:rgba(0,0,0,0.12)] bg-[linear-gradient(180deg,rgba(6,59,49,0.92),rgba(10,12,10,0.86))] text-white backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/`}
            className="font-display text-[1.2rem] font-semibold tracking-[-0.03em] sm:text-[1.35rem]"
          >
            Seville <span className="text-[var(--brand-gold-100)]">Tours</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 text-sm font-semibold text-white/72 sm:flex">
              <HomeScrollLink
                targetId="tours"
                className="rounded-full px-3 py-1.5 transition hover:bg-white/8 hover:text-white"
              >
                {copy.shared.tours}
              </HomeScrollLink>
              <HomeScrollLink
                targetId="gift-cards"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-white/8 hover:text-white"
              >
                <span aria-hidden="true" className="text-[var(--brand-gold-300)]">✦</span>
                {copy.shared.giftCard}
              </HomeScrollLink>
              <Link
                href={`/${locale}/contact-seville-tours-co/`}
                className="rounded-full px-3 py-1.5 transition hover:bg-white/8 hover:text-white"
              >
                {copy.shared.contactCarlos}
              </Link>
            </nav>

            {/* Mobile gift icon — visible below sm */}
            <HomeScrollLink
              targetId="gift-cards"
              aria-label={copy.shared.giftCard}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[color:rgba(184,144,58,0.35)] text-[var(--brand-gold-100)] transition hover:bg-white/8 active:scale-95 sm:hidden"
            >
              <span className="text-base leading-none" aria-hidden="true">✦</span>
            </HomeScrollLink>

            <button
              type="button"
              onClick={() => setIsPlanTripOpen(true)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--brand-gold-100)] px-4 py-2 text-sm font-semibold text-[var(--surface-dark)] shadow-[0_8px_24px_rgba(184,144,58,0.18)] transition hover:brightness-95 active:scale-95"
            >
              {copy.shared.planTrip}
            </button>
          </div>
        </div>
      </header>

      {isPlanTripOpen ? (
        <PlanTripModal locale={locale} open onClose={() => setIsPlanTripOpen(false)} />
      ) : null}
    </>
  );
}