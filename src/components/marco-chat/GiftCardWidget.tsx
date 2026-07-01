import type { CSSProperties } from "react";
import { getChatCopy } from "./chat-copy";

type GiftCardWidgetProps = {
  /** Hosted merchant URL. Amount/recipient are chosen there, never here. */
  giftUrl: string;
  /** Gift provider name shown in copy, e.g. "ParaUsted". */
  giftProviderName: string;
  accentColor: string;
  primaryColor: string;
  locale: string;
};

/**
 * Inline gift-card nudge. The gift provider owns purchase, payment, issuance and
 * delivery, so this only explains the offer and links out to the hosted page — it
 * never passes an amount, recipient, or any PII in the URL (V1 integration rule).
 */
export function GiftCardWidget({
  giftUrl,
  giftProviderName,
  accentColor,
  primaryColor,
  locale,
}: GiftCardWidgetProps) {
  const copy = getChatCopy(locale);
  const accentStyle: CSSProperties = { color: accentColor };
  const ctaStyle: CSSProperties = { backgroundColor: accentColor, color: primaryColor };

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[280px] rounded-2xl border border-[rgba(201,168,76,0.3)] bg-gradient-to-br from-[#1A3A2A] to-[#2C5F3F] p-4">
        <p style={accentStyle} className="text-[10px] font-medium uppercase tracking-[0.15em]">
          ✦ {copy.giftEyebrow}
        </p>
        <h3 className="font-display mt-1.5 text-[17px] leading-tight text-white">
          {copy.giftHeading}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-white/65">
          {copy.giftBody(giftProviderName)}
        </p>
        <a
          href={giftUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={ctaStyle}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-[10px] px-4 text-sm font-semibold"
        >
          {copy.giftCta}
        </a>
      </div>
    </div>
  );
}
