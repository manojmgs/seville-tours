"use client";

import { useEffect, useState } from "react";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type ScrollToTopButtonProps = {
  locale?: Locale;
};

export function ScrollToTopButton({ locale = "en" }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const copy = siteCopy(locale);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 900);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-[70] inline-flex min-h-11 items-center justify-center rounded-full border border-[color:rgba(184,144,58,0.22)] bg-[rgba(255,253,249,0.96)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_18px_40px_rgba(17,17,17,0.14)] backdrop-blur-xl transition hover:border-[color:var(--brand-green-700)] hover:text-[var(--brand-green-700)]"
      aria-label={copy.shared.top}
    >
      {copy.shared.top}
    </button>
  );
}