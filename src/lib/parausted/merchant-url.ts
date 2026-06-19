import type { Locale } from "@/lib/i18n/types";

/**
 * Builds outbound ParaUsted hosted URLs for Seville Tours.
 *
 * V1 integration is hosted-link only: Seville Tours is a marketing/referrer
 * surface and must never pass amount, recipient, message, merchant_id,
 * voucher code, payment/refund status, or any PII in the query string.
 * Fixed product URLs may include a ParaUsted gift_card_id in the path because
 * the merchant product route is UUID-based. ParaUsted owns purchase, payment
 * confirmation, voucher issuance, delivery, and redemption.
 */
const DEFAULT_BASE_URL = "https://parausted.es";
const MERCHANT_SLUG = "seville-tours-co";
const GIFT_CARD_PATH_SEGMENT = "gift-cards";

type ParaUstedLocale = "es" | "en";

/** ParaUsted V1 only serves es/en; everything else falls back to en. */
function toParaUstedLocale(locale: Locale): ParaUstedLocale {
  return locale === "es" ? "es" : "en";
}

function getParaUstedBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export function buildParaUstedMerchantUrl(locale: Locale): string {
  return `${getParaUstedBaseUrl()}/${toParaUstedLocale(locale)}/m/${MERCHANT_SLUG}`;
}

export function buildParaUstedGiftCardProductUrl(locale: Locale, giftCardId: string): string {
  const normalizedGiftCardId = encodeURIComponent(giftCardId.trim());

  return `${getParaUstedBaseUrl()}/${toParaUstedLocale(locale)}/m/${MERCHANT_SLUG}/${GIFT_CARD_PATH_SEGMENT}/${normalizedGiftCardId}`;
}
