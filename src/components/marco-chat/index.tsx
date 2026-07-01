"use client";

import dynamic from "next/dynamic";
import { WHATSAPP_NUMBER } from "@/lib/wordpress-rest/urls";
import { buildParaUstedMerchantUrl } from "@/lib/parausted/merchant-url";
import type { Locale } from "@/lib/i18n/types";
import type { MarcoConfig, MarcoTour } from "./types";

/**
 * Lazy entry point for the Marco advisor.
 *
 * The whole widget is code-split and client-only (`ssr: false`) so it never runs
 * on the server and never blocks first paint — it loads only when a guest opens
 * the panel. All data is passed in as props; there are no runtime fetches.
 */
const MarcoChatPanel = dynamic(
  () => import("./MarcoChat").then((mod) => mod.MarcoChat),
  { ssr: false },
);

/** Default operator config (the Seville Tours tenant). Override per operator. */
export const DEFAULT_MARCO_CONFIG: MarcoConfig = {
  persona: "Isabel",
  operatorName: "Carlos",
  brandName: "Seville Tours",
  destination: "Seville",
  region: "Andalucía",
  expertTitle: "Seville Expert",
  giftProviderName: "ParaUsted",
  primaryColor: "#1A3A2A",
  accentColor: "#C9A84C",
  whatsapp: WHATSAPP_NUMBER,
  giftCards: true,
  giftUrl: buildParaUstedMerchantUrl("en"),
};

type MarcoChatProps = {
  open: boolean;
  onClose: () => void;
  tours: MarcoTour[];
  locale: Locale;
  /** Optional operator overrides; falls back to {@link DEFAULT_MARCO_CONFIG}. */
  config?: Partial<MarcoConfig>;
};

export function MarcoChat({ open, onClose, tours, locale, config }: MarcoChatProps) {
  const resolvedConfig: MarcoConfig = {
    ...DEFAULT_MARCO_CONFIG,
    giftUrl: buildParaUstedMerchantUrl(locale),
    ...config,
  };
  return (
    <MarcoChatPanel
      open={open}
      onClose={onClose}
      tours={tours}
      config={resolvedConfig}
      locale={locale}
    />
  );
}

export type { MarcoConfig, MarcoTour } from "./types";
