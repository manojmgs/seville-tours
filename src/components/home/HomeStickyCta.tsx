"use client";

import { useEffect, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/wordpress-rest/urls";
import { HomeScrollLink } from "./HomeScrollLink";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type HomeStickyCtaProps = {
  heroId: string;
  footerId: string;
  locale?: Locale;
};

export function HomeStickyCta({ heroId, footerId, locale = "en" }: HomeStickyCtaProps) {
  const [showCta, setShowCta] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const copy = siteCopy(locale);

  useEffect(() => {
    const heroElement = document.getElementById(heroId);
    const footerElement = document.getElementById(footerId);

    if (!heroElement || !footerElement) {
      return;
    }

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setShowCta(!entry.isIntersecting);
      },
      {
        threshold: 0.2,
      },
    );

    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      },
    );

    heroObserver.observe(heroElement);
    footerObserver.observe(footerElement);

    return () => {
      heroObserver.disconnect();
      footerObserver.disconnect();
    };
  }, [footerId, heroId]);

  if (!showCta || footerVisible) {
    return null;
  }

  return (
    <section className="fixed inset-x-0 bottom-4 z-40 px-4 sm:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-[1.35rem] border border-[color:rgba(6,80,63,0.12)] bg-[rgba(255,253,249,0.94)] p-3 shadow-[0_18px_40px_rgba(17,17,17,0.14)] backdrop-blur-xl">
        <a
          href={buildWhatsAppUrl("Hello Carlos, I would like to ask about a private tour in Seville.")}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(37,211,102,0.24)]"
        >
          {copy.shared.whatsappCarlos}
        </a>
        <HomeScrollLink
          targetId="tours"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
        >
          {copy.shared.browse}
        </HomeScrollLink>
      </div>
    </section>
  );
}