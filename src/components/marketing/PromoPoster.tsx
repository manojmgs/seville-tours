import Link from "next/link";
import type { Locale } from "@/lib/i18n/site";

type PromoPosterProps = {
  locale?: Locale;
  /** Served from /public. Override if the asset paths change. */
  videoSrc?: string;
  posterSrc?: string;
  /** CTA label; defaults to the video's "Start planning" wording. */
  ctaLabel?: string;
  /** Extra classes for the outer wrapper (e.g. sizing on a landing page). */
  className?: string;
};

/**
 * Embeddable promo poster for landing pages.
 *
 * Loops the muted Isabel concierge promo (autoplay, no controls) behind a single
 * clickable "Start planning" pill. Only the pill is a link — the video itself is
 * not wrapped — so the click target is exactly the CTA, matching the in-video
 * button. The link deep-links to `/{locale}/?chat=1`, which opens the concierge
 * chat on arrival (see HomeHeader).
 *
 * Server Component: the looping video needs no client JS.
 */
export function PromoPoster({
  locale = "en",
  videoSrc = "/video/isabel-concierge-promo.mp4",
  posterSrc = "/video/isabel-poster.png",
  ctaLabel = "Start planning",
  className,
}: PromoPosterProps) {
  const chatHref = `/${locale}/?chat=1`;

  return (
    <div
      className={`relative mx-auto aspect-[9/16] w-full max-w-[380px] overflow-hidden rounded-3xl bg-black shadow-[0_24px_60px_rgba(15,36,26,0.35)] ${className ?? ""}`}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={videoSrc}
        poster={posterSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />

      {/* Bottom scrim so the CTA stays legible over any frame. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,transparent,rgba(15,36,26,0.85))]"
      />

      <Link
        href={chatHref}
        aria-label={ctaLabel}
        className="absolute bottom-6 left-1/2 inline-flex min-h-[44px] -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-[linear-gradient(145deg,#E9CE7E,#C9A84C)] px-8 py-4 text-base font-extrabold text-[#0F241A] shadow-[0_16px_40px_rgba(201,168,76,0.45)] transition hover:brightness-95 active:scale-95"
      >
        {ctaLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
