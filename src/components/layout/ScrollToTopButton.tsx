"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type ScrollToTopButtonProps = {
  locale?: Locale;
};

export function ScrollToTopButton({ locale = "en" }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
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

  // The showcase is a self-contained demo surface; this floating button overlaps its content.
  if (!isVisible || pathname?.includes("/tis-showcase")) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-[70] inline-flex min-h-11 items-center justify-center rounded-full border border-[color:rgba(184,144,58,0.22)] bg-[rgba(255,253,249,0.96)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_18px_40px_rgba(17,17,17,0.14)] backdrop-blur-xl transition hover:border-[color:var(--brand-green-700)] hover:text-[var(--brand-green-700)] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:right-6"
      aria-label={copy.shared.top}
    >
      {copy.shared.top}
    </button>
  );
}