import type { Locale } from "@/lib/i18n/types";

/**
 * Builds the outbound ParaUsted hosted merchant URL for Seville Tours.
 *
 * V1 integration is hosted-link only: Seville Tours is a marketing/referrer
 * surface and must never pass amount, recipient, message, merchant_id,
 * gift_card_id, voucher code, payment/refund status, or any PII. ParaUsted
 * owns purchase, payment confirmation, voucher issuance, and redemption.
 */
const DEFAULT_BASE_URL = "https://parausted.es";
const MERCHANT_SLUG = "seville-tours-co";

type ParaUstedLocale = "es" | "en";

/** ParaUsted V1 only serves es/en; everything else falls back to en. */
function toParaUstedLocale(locale: Locale): ParaUstedLocale {
  return locale === "es" ? "es" : "en";
}

export function buildParaUstedMerchantUrl(locale: Locale): string {
  const base = (process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  return `${base}/${toParaUstedLocale(locale)}/m/${MERCHANT_SLUG}`;
}
