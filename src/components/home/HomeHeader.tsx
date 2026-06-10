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

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-4 text-sm font-semibold text-white/72 sm:flex">
              <HomeScrollLink
                targetId="tours"
                className="transition hover:text-white"
              >
                {copy.shared.tours}
              </HomeScrollLink>
              <Link
                href={`/${locale}/contact-seville-tours-co/`}
                className="transition hover:text-white"
              >
                {copy.shared.contactCarlos}
              </Link>
            </nav>

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