import type { MarcoConfig } from "./types";

/**
 * Fill tenant tokens in a copy template so all user-facing strings stay
 * operator-agnostic. Supported tokens: {persona} {operator} {brand}
 * {destination} {region} {giftProvider}. Unknown tokens are left untouched.
 */
export function fillTokens(template: string, config: MarcoConfig): string {
  return template
    .replaceAll("{persona}", config.persona)
    .replaceAll("{operator}", config.operatorName)
    .replaceAll("{brand}", config.brandName)
    .replaceAll("{destination}", config.destination)
    .replaceAll("{region}", config.region)
    .replaceAll("{giftProvider}", config.giftProviderName);
}
