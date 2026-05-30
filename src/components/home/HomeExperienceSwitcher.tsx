"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { buildContactInquiryUrl, buildWhatsAppUrl } from "@/lib/wordpress-rest/urls";
import { HomeScrollLink } from "./HomeScrollLink";
import { LanguageDropdown } from "./LanguageDropdown";
import { type Locale } from "@/lib/i18n/site";

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

  const experienceContent = {
    private: {
      eyebrow: "Carlos · Licensed historian",
      titleTop: "Seville & Andalucía,",
      titleBottom: "always private.",
      body: "Private tours in Seville, day trips to Córdoba, Granada and Ronda — guided by Carlos, a licensed historian.",
      primaryCta: "Explore tours",
      primaryHref: "#tours",
      secondaryCta: "WhatsApp Carlos",
      secondaryHref: buildWhatsAppUrl("Hello Carlos, I would like to ask about a private tour in Seville."),
      trust: [
        { title: "Official guide", body: "Licensed historian" },
        { title: "Private pace", body: "No crowded groups" },
        { title: "Day trips", body: "Granada · Córdoba · Ronda" },
        { title: "4.9 reviews", body: "Guest proof" },
      ],
    },
    luxury: {
      eyebrow: "Bespoke Andalucía planning",
      titleTop: "Andalucía,",
      titleBottom: "arranged around you.",
      body: "Private drivers, curated dining, flexible pacing and bespoke day trips shaped around your rhythm.",
      primaryCta: "Request proposal",
      primaryHref: buildContactInquiryUrl({ interest: "luxury" }),
      secondaryCta: "WhatsApp Carlos",
      secondaryHref: buildWhatsAppUrl("Hello Carlos, I would like to ask about luxury planning in Seville."),
      trust: [
        { title: "Arrival support", body: "Airport · hotel · station" },
        { title: "Chauffeur options", body: "Mercedes on request" },
        { title: "Dining planning", body: "Local tables · rooftop evenings" },
        { title: "Flexible itinerary", body: "Built around your rhythm" },
      ],
    }
  };

  const current = experienceContent[mode];

  return (
    <div className="relative z-40 transition-colors duration-500 ease-in-out motion-reduce:transition-none">
      {/* Experience Selector Row */}
      <div className={`relative z-50 border-b border-white/5 transition-colors duration-500 backdrop-blur-xl ${isLuxury ? "bg-[rgba(7,6,5,0.85)]" : "bg-[rgba(6,59,49,0.88)]"}`}>
        <div className="mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
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
      <section id="home-hero" className={`relative flex flex-col justify-end min-h-[480px] sm:min-h-[620px] overflow-hidden transition-colors duration-500 pb-6 sm:pb-14 ${isLuxury ? "hero-luxury" : "hero-mesh"} motion-reduce:transition-none`}>
        <div className={`relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 transition-all duration-400 transform ${isTransitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"} motion-reduce:transition-none`}>
          <div className="max-w-[420px]">
            <div className={`inline-flex items-center gap-2 rounded-[20px] px-3.5 py-1.5 mb-5 transition-colors duration-400 ${
              isLuxury ? "bg-[rgba(184,144,58,0.18)] border border-[rgba(184,144,58,0.25)]" : "bg-[#0F6E56]/90 border border-[#0F6E56]"
            }`}>
              <div className={`w-[5px] h-[5px] rounded-full opacity-80 transition-colors duration-400 ${isLuxury ? "bg-[var(--brand-gold-300)]" : "bg-white"}`} />
              <span className={`text-[10px] font-medium tracking-[0.05em] uppercase transition-colors duration-400 ${isLuxury ? "text-[#D4AF5A]" : "text-white"}`}>
                {current.eyebrow}
              </span>
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
                  className="flex-[5.5] flex items-center justify-center gap-1.5 rounded-[12px] bg-[linear-gradient(180deg,#063b31,#0d6f55,#06503f)] px-4 py-[13px] text-[13px] font-bold tracking-[0.02em] text-white shadow-[0_6px_18px_rgba(6,80,63,0.22)] transition hover:brightness-105"
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
                  className="flex-[4.5] flex items-center justify-center gap-1.5 rounded-[12px] px-4 py-[13px] text-[13px] font-bold transition bg-transparent border border-white/20 text-white hover:bg-white/5"
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
        </div>

        {/* Desktop right-side panel to balance hero */}
        <div className="hidden md:block absolute right-8 top-12 z-20">
          <div className={`w-[360px] rounded-3xl p-6 backdrop-blur-sm border transition-colors duration-400 ${isLuxury ? "bg-[rgba(2,2,2,0.56)] border-[rgba(184,144,58,0.12)] text-white" : "bg-[rgba(255,255,255,0.06)] border-[rgba(6,80,63,0.08)] text-[#E9F3EE]"}`}>
            <h3 className={`mb-3 text-lg font-semibold ${isLuxury ? "text-[var(--brand-gold-100)]" : "text-[var(--brand-green-100)]"}`}>
              {isLuxury ? "Bespoke proposal" : "Seville base, Andalucía day trips"}
            </h3>
            <ul className="grid gap-2">
              {isLuxury ? (
                <>
                  <li className="text-sm font-medium">Arrival support</li>
                  <li className="text-sm font-medium">Chauffeur options</li>
                  <li className="text-sm font-medium">Dining planning</li>
                  <li className="text-sm font-medium">Flexible itinerary</li>
                </>
              ) : (
                <>
                  <li className="text-sm font-medium">Alcázar & Cathedral</li>
                  <li className="text-sm font-medium">Granada · Córdoba · Ronda</li>
                  <li className="text-sm font-medium">Private pace</li>
                  <li className="text-sm font-medium">Licensed historian</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}