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
const PRODUCTION_BASE_URL = "https://parausted.vercel.app";
const MERCHANT_SLUG = "seville-tours-co";
const GIFT_CARD_PATH_SEGMENT = "gift-cards";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

type ParaUstedLocale = "es" | "en";

/** ParaUsted V1 only serves es/en; everything else falls back to en. */
function toParaUstedLocale(locale: Locale): ParaUstedLocale {
  return locale === "es" ? "es" : "en";
}

function getParaUstedBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL;
  if (!configuredBaseUrl) return PRODUCTION_BASE_URL;

  try {
    const configuredUrl = new URL(configuredBaseUrl);
    if (LOCAL_HOSTNAMES.has(configuredUrl.hostname)) {
      return configuredBaseUrl.replace(/\/+$/, "");
    }
  } catch {
    // Invalid public configuration must fail closed to the production origin.
  }

  return PRODUCTION_BASE_URL;
}

export function buildParaUstedMerchantUrl(locale: Locale): string {
  return `${getParaUstedBaseUrl()}/${toParaUstedLocale(locale)}/m/${MERCHANT_SLUG}`;
}

export function buildParaUstedGiftCardProductUrl(locale: Locale, giftCardId: string): string {
  const normalizedGiftCardId = encodeURIComponent(giftCardId.trim());

  return `${getParaUstedBaseUrl()}/${toParaUstedLocale(locale)}/m/${MERCHANT_SLUG}/${GIFT_CARD_PATH_SEGMENT}/${normalizedGiftCardId}`;
}
