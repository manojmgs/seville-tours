/**
 * Feature-flag layer (source-swappable).
 *
 * Callers depend only on the {@link FlagSource} port and {@link FlagKey} union, never
 * on where a flag lives. The v0 source reads environment variables; a Supabase
 * `tenant_feature_flags` source can replace it later without touching call sites.
 */

/** Every feature flag the app knows about. Add keys here as flags are introduced. */
export type FlagKey = "whatsapp_concierge_plan_trip";

/** Evaluation context — the operator/tenant a flag is resolved for. */
export type FlagContext = {
  tenantId: string;
};

/** A pluggable flag backend (env today; Supabase/remote later). */
export interface FlagSource {
  isEnabled(key: FlagKey, context: FlagContext): Promise<boolean> | boolean;
}
