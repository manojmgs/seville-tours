import type { FlagKey, FlagSource } from "./types";

/**
 * Environment-variable flag source (v0).
 *
 * Maps each flag key to a boolean env var. Single-deployment for now, so tenant is
 * not consulted; a Supabase-backed source will honour {@link FlagContext.tenantId}.
 */

const ENV_VAR_BY_KEY: Record<FlagKey, string> = {
  whatsapp_concierge_plan_trip: "FF_WHATSAPP_CONCIERGE_PLAN_TRIP",
};

function isTruthy(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "on", "yes"].includes(normalized);
}

export const envFlagSource: FlagSource = {
  isEnabled(key) {
    return isTruthy(process.env[ENV_VAR_BY_KEY[key]]);
  },
};
