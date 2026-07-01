import { envFlagSource } from "./source.env";
import type { FlagContext, FlagKey, FlagSource } from "./types";

/**
 * Feature-flag resolution entrypoint (server-side).
 *
 * Fail-safe by design: any error, or a missing flag, resolves to OFF so a flag-store
 * problem can never break a user-facing path. The active source is env for now and
 * can be swapped centrally (e.g. to Supabase `tenant_feature_flags`) here.
 */

const DEFAULT_TENANT_ID = process.env.BOOKING_TENANT_ID ?? "seville-tours";

const activeSource: FlagSource = envFlagSource;

export function defaultFlagContext(): FlagContext {
  return { tenantId: DEFAULT_TENANT_ID };
}

export async function isFeatureEnabled(
  key: FlagKey,
  context: FlagContext = defaultFlagContext(),
): Promise<boolean> {
  try {
    return await activeSource.isEnabled(key, context);
  } catch {
    return false;
  }
}

export type { FlagContext, FlagKey, FlagSource } from "./types";
