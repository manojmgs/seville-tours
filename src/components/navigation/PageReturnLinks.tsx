"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type PageReturnLinksProps = {
  locale?: Locale;
  backLabel?: string;
  className?: string;
};

export function PageReturnLinks({
  locale = "en",
  backLabel = "Back",
  className,
}: PageReturnLinksProps) {
  const router = useRouter();
  const copy = siteCopy(locale);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className={className ?? "mb-5 flex items-center gap-3"}>
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[color:var(--brand-green-700)] hover:text-[var(--brand-green-700)]"
      >
        ← {backLabel || copy.returnLinks.back}
      </button>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:rgba(184,144,58,0.2)] bg-[var(--brand-gold-100)] px-4 py-2 text-sm font-semibold text-[var(--surface-dark)] transition hover:bg-[var(--brand-gold-300)]"
      >
        {copy.shared.home}
      </Link>
    </div>
  );
}