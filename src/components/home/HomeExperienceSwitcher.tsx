"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { buildContactInquiryUrl, buildWhatsAppUrl } from "@/lib/wordpress-rest/urls";
import { HomeScrollLink } from "./HomeScrollLink";
import { LanguageDropdown } from "./LanguageDropdown";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type HomeExperienceSwitcherProps = {
  locale?: Locale;
};

type HeroMode = "private" | "luxury";

export function HomeExperienceSwitcher({ locale = "en" }: HomeExperienceSwitcherProps) {
  const [mode, setMode] = useState<HeroMode>("private");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimer = useRef<NodeJS.Timeout | null>(null);

  const isLuxury = mode === "luxury";

  const handleModeChange = (newMode: HeroMode) => {
    if (newMode === mode) return;
    
    setIsTransitioning(true);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    
    // Smooth transition
    transitionTimer.current = setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);
    }, 400);
  };

  const localized = siteCopy(locale);
  const trustCards = localized.home.sections.trustProof?.cards ?? [];
  const googleCard = trustCards.find((c) => c.source === "Google");
  const andaluciaCard = trustCards.find((c) => c.source === "Andalucía");
  const luxuryMicro = andaluciaCard ? `${andaluciaCard.registrationId ?? ""}` : "";

  const experienceContent = {
    private: {
      eyebrow: localized.home.hero.badge,
      titleTop: localized.home.hero.titleTop,
      titleBottom: localized.home.hero.titleBottom,
      body: localized.home.hero.body,
      primaryCta: localized.shared.exploreTours,
      primaryHref: "#tours",
      secondaryCta: localized.shared.whatsappCarlos,
      secondaryHref: buildWhatsAppUrl("Hello Carlos, I would like to ask about a private tour in Seville."),
      trust: localized.home.hero.privateTrust,
    },
    luxury: {
      eyebrow: localized.home.hero.luxuryEyebrow,
      titleTop: localized.home.hero.luxuryTitleTop,
      titleBottom: localized.home.hero.luxuryTitleBottom,
      body: localized.home.hero.luxuryBody,
      primaryCta: localized.shared.requestLuxuryProposal,
      primaryHref: buildContactInquiryUrl({ interest: "luxury" }),
      secondaryCta: localized.shared.whatsappCarlos,
      secondaryHref: buildWhatsAppUrl("Hello Carlos, I would like to ask about luxury planning in Seville."),
      trust: localized.home.hero.luxuryTrust,
    },
  };

  const current = experienceContent[mode];

  return (
    <div className="relative z-40 transition-colors duration-500 ease-in-out motion-reduce:transition-none">
      {/* Experience Selector Row */}
      <div className={`relative z-50 border-b border-white/5 transition-colors duration-500 backdrop-blur-xl ${isLuxury ? "bg-[rgba(7,6,5,0.85)]" : "bg-[rgba(6,59,49,0.88)]"}`}>
        <div className="mx-auto flex items-center justify-between gap-4 px-4 py-2 md:py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#C6D4CC] pl-1">EXPERIENCE</span>
            <div className={`inline-flex items-center rounded-[20px] p-[3px] border transition-colors duration-500 ${isLuxury ? "bg-[rgba(255,255,255,0.03)] border-[rgba(184,144,58,0.12)]" : "bg-[rgba(255,255,255,0.02)] border-white/6"}`}>
              <button
                type="button"
                onClick={() => handleModeChange("private")}
                className={`rounded-2xl px-3.5 py-[5px] text-[10px] sm:text-[11px] font-medium tracking-wide transition-all duration-300 ${
                  !isLuxury 
                    ? "bg-[linear-gradient(180deg,#063b31,#0d6f55,#06503f)] text-white shadow-[0_6px_18px_rgba(6,80,63,0.22)]" 
                    : "text-[#9aa39b] hover:text-white"
                }`}
              >
                ✦ Private
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("luxury")}
                className={`rounded-2xl px-3.5 py-[5px] text-[10px] sm:text-[11px] font-medium tracking-wide transition-all duration-300 ${
                  isLuxury 
                    ? "bg-[rgba(184,144,58,0.12)] border border-[var(--brand-gold-100)] text-[var(--brand-gold-100)] shadow-[0_2px_12px_rgba(184,144,58,0.18)]" 
                    : "text-[#9aa39b] hover:text-white"
                }`}
              >
                ◆ Luxury
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageDropdown currentLocale={locale as Locale} />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home-hero" className={`relative overflow-hidden transition-colors duration-500 pb-6 sm:pb-14 ${isLuxury ? "hero-luxury" : "hero-mesh"} motion-reduce:transition-none`}>
        <div className={`relative z-10 w-full mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8 mt-2 sm:mt-4 transition-all duration-400 transform ${isTransitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"} motion-reduce:transition-none`}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-x-12 items-start min-h-[480px] sm:min-h-[620px] py-8 md:py-12">
            <div className="max-w-[620px]">
              <div className={`flex flex-wrap items-center gap-2 rounded-[20px] px-3.5 py-1.5 mb-5 transition-colors duration-400 ${
                isLuxury ? "bg-[rgba(184,144,58,0.18)] border border-[rgba(184,144,58,0.25)]" : "bg-[#0F6E56]/90 border border-[#0F6E56]"
              }`}>
                <div className={`w-[5px] h-[5px] rounded-full opacity-80 transition-colors duration-400 ${isLuxury ? "bg-[var(--brand-gold-300)]" : "bg-white"}`} />
                <span className={`text-[10px] font-medium tracking-[0.05em] uppercase transition-colors duration-400 ${isLuxury ? "text-[#D4AF5A]" : "text-white"}`}>
                  {current.eyebrow}
                </span>

                {/* Micro trust badge */}
                <div className="ml-1">
                  {!isLuxury ? (
                    googleCard && (
                      <HomeScrollLink
                        targetId="trust-proof-heading"
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs tracking-wide font-medium text-[var(--surface-dark)] bg-[rgba(255,253,249,0.94)]/90 border border-[color:rgba(6,80,63,0.06)]"
                      >
                        <span className="text-[var(--brand-gold-300)] mr-1 text-sm font-medium">{googleCard.rating}</span>
                        <span className="text-xs">{googleCard.source} · {googleCard.reviews}</span>
                      </HomeScrollLink>
                    )
                  ) : (
                    luxuryMicro && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide text-[var(--brand-gold-100)] bg-[rgba(255,255,255,0.02)] border border-[color:rgba(184,144,58,0.10)]">
                        {luxuryMicro}
                      </span>
                    )
                  )}
                </div>
              </div>

            <h1 className={`mb-3.5 text-[32px] sm:text-[40px] lg:text-[46px] leading-[1.05] transition-colors duration-400 ${
              isLuxury ? "font-display italic font-medium tracking-[0.01em] text-[#F0EDE8]" : "font-sans font-bold tracking-tight text-white/95"
            }`}>
              <span className="block">{current.titleTop}</span>
              <span className="block">{current.titleBottom}</span>
            </h1>

            <p className={`mb-7 text-[13px] sm:text-[14px] leading-[1.6] max-w-[340px] transition-colors duration-400 ${
              isLuxury ? "text-[rgba(240,237,232,0.45)] tracking-[0.01em] font-normal" : "text-[rgba(255,255,255,0.78)] font-medium"
            }`}>
              {current.body}
            </p>

            <div className="flex gap-2 sm:gap-3 mb-8 max-w-[360px]">
              {!isLuxury ? (
                <HomeScrollLink
                  targetId="tours"
                  className="flex-[5.5] flex items-center justify-center gap-1.5 rounded-[12px] bg-[var(--brand-gold-300)] border border-[var(--brand-gold-300)] px-4 py-[13px] text-[13px] font-bold tracking-[0.02em] text-[#0D2418] shadow-[0_6px_24px_rgba(184,144,58,0.18)] transition hover:brightness-105"
                >
                  {current.primaryCta}
                </HomeScrollLink>
              ) : (
                <Link
                  href={current.primaryHref}
                  className="flex-[5.5] flex items-center justify-center gap-1.5 rounded-[12px] bg-[var(--brand-gold-300)] border border-[var(--brand-gold-300)] px-4 py-[13px] text-[13px] font-bold tracking-[0.02em] text-[#0D0D0D] shadow-[0_6px_24px_rgba(184,144,58,0.18)] transition hover:brightness-105"
                >
                  {current.primaryCta}
                </Link>
              )}
              {isLuxury ? (
                <a
                  href={current.secondaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-[5.5] flex items-center justify-center gap-1.5 rounded-[12px] bg-[var(--brand-gold-300)] border border-[var(--brand-gold-300)] px-4 py-[13px] text-[13px] font-bold tracking-[0.02em] text-[#0D0D0D] shadow-[0_6px_24px_rgba(184,144,58,0.18)] transition hover:brightness-105"
                >
                  {current.secondaryCta}
                </a>
              ) : (
                <a
                  href={current.secondaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-[4.5] flex items-center justify-center gap-1.5 rounded-[12px] min-h-[44px] px-4 py-[13px] text-[13px] font-bold tracking-[0.02em] transition bg-[rgba(255,255,255,0.06)] border border-[rgba(246,244,240,0.35)] text-[#f6f4f0] hover:bg-[rgba(255,255,255,0.12)]"
                >
                  {current.secondaryCta}
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 max-w-[380px]">
              {current.trust.map((item) => (
                <div key={item.title} className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2 transition-colors duration-400 ${
                  isLuxury ? "bg-[rgba(255,255,255,0.03)] border border-[rgba(184,144,58,0.15)]" : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]"
                }`}>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-bold leading-tight transition-colors ${
                      isLuxury ? "text-[#D4AF5A]" : "text-white/90"
                    }`}>{item.title}</span>
                    <span className={`text-[9.5px] leading-tight mt-0.5 transition-colors ${
                      isLuxury ? "text-[rgba(240,237,232,0.4)]" : "text-[rgba(255,255,255,0.5)]"
                    }`}>{item.body}</span>
                  </div>
                </div>
              ))}
            </div>
            </div>

            {/* Right panel */}
            <aside className="hidden md:block">
              <div className={`w-full rounded-3xl p-6 backdrop-blur-sm border transition-colors duration-400 ${isLuxury ? "bg-[rgba(2,2,2,0.56)] border-[rgba(184,144,58,0.12)] text-white" : "bg-[rgba(255,255,255,0.06)] border-[rgba(6,80,63,0.08)] text-[#E9F3EE]"}`}>
                <h3 className={`mb-3 text-lg font-semibold ${isLuxury ? "text-[var(--brand-gold-100)]" : "text-[var(--brand-green-100)]"}`}>
                  {isLuxury ? localized.home.hero.luxuryAsideTitle : localized.home.hero.privateAsideTitle}
                </h3>
                <ul className="grid gap-3">
                  {(isLuxury ? localized.home.hero.luxuryAsideItems : localized.home.hero.privateAsideItems).map((item, i) => {
                    const dotCn = isLuxury
                      ? ["bg-[rgba(184,144,58,0.85)]/90 ring-1 ring-white/18", "bg-[rgba(184,144,58,0.6)] ring-1 ring-white/12", "bg-[rgba(184,144,58,0.5)] ring-1 ring-white/12", "bg-[rgba(184,144,58,0.4)] ring-1 ring-white/12"][i]
                      : ["bg-[var(--brand-green-700)]/90 ring-1 ring-white/20", "bg-[var(--brand-green-500)]/80 ring-1 ring-white/20", "bg-[var(--brand-green-700)]/70 ring-1 ring-white/20", "bg-[var(--brand-green-500)]/60 ring-1 ring-white/20"][i];
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-1 inline-block h-2 w-2 rounded-full ${dotCn}`} />
                        <span className="text-sm font-medium">{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}