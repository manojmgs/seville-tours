"use client";

import { useEffect, useState, useRef } from "react";
import { type Locale, supportedLocales } from "@/lib/i18n/site";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  ar: "AR",
};

type LanguageDropdownProps = {
  currentLocale: Locale;
};

export function LanguageDropdown({ currentLocale }: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    /* eslint-disable-next-line react-hooks/immutability */
    document.cookie = `st-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Change language"
        className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-[color:rgba(184,144,58,0.22)] bg-white/6 px-4 py-2 text-[0.7rem] font-extrabold tracking-[0.12em] text-[var(--brand-gold-100)] transition hover:bg-white/12 active:scale-95"
      >
        {localeLabels[currentLocale]}
        <span className={`text-[0.6rem] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">▼</span>
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 top-full z-[60] mt-2 min-w-[80px] overflow-hidden rounded-2xl border border-[color:rgba(184,144,58,0.28)] bg-[rgba(7,10,8,0.95)] py-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
          role="listbox"
        >
          {supportedLocales.map((locale) => {
            const isActive = locale === currentLocale;
            return (
              <li key={locale} role="none">
                <button
                  onClick={() => switchLocale(locale)}
                  className={`flex w-full items-center justify-center px-4 py-2.5 text-[0.7rem] font-bold tracking-[0.16em] transition ${
                    isActive 
                      ? "text-[var(--brand-gold-100)] bg-white/10" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                  role="option"
                  aria-selected={isActive}
                >
                  {localeLabels[locale]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
