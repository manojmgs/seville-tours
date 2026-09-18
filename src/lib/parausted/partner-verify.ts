import "server-only";

import { maskVoucherCode } from "./mask";
import { normalizeGiftCardCode } from "./redeem";

/**
 * Server-only, READ-ONLY ParaUsted voucher verification (partner API).
 *
 * Boundary: ParaUsted owns voucher issuance, balance, and redemption. This helper
 * calls the authenticated read-only partner endpoint with a server-only bearer token
 * and returns a small typed result. It is *advisory*: it never mutates voucher state
 * and the later atomic redemption endpoint (see `partner-redeem.ts`) remains
 * authoritative. It NEVER calls `/redeem`, NEVER throws to the caller, and NEVER
 * logs the full voucher code or the service token.
 *
 * Verification endpoint:
 *   GET ${PARAUSTED_BASE_URL}/api/partner/vouchers/{encodedCode}
 *   Authorization: Bearer ${PARAUSTED_SERVICE_TOKEN}   (scope: voucher:read)
 *
 * MUST run server-side only. Both env vars are non-`NEXT_PUBLIC_` so they can never
 * reach the browser bundle.
 */

const DEFAULT_BASE_URL = "https://parausted.es";

/** Letters, digits and dashes; up to 32 chars. ParaUsted is authoritative on exact shape. */
const CODE_PATTERN = /^[A-Z0-9-]{1,32}$/;

const REQUEST_TIMEOUT_MS = 8_000;
const DEFAULT_RETRY_AFTER_SECONDS = 60;
const MAX_RETRY_AFTER_SECONDS = 3_600;

/**
 * Small typed internal result. All malformed, unknown, cross-tenant, expired,
 * voided, exchanged, redeemed, zero-balance, misconfigured, network, and timeout
 * outcomes collapse into a single generic `{ eligible: false }` — the browser must
 * not be able to distinguish provider states.
 */
export type ParaUstedVerifyResult =
  | { eligible: true; maskedCode: string; balanceCents: number }
  | { eligible: false }
  | { eligible: false; rateLimited: true; retryAfterSeconds: number };

type EligiblePayload = {
  success: true;
  eligible: true;
  voucherCode: string;
  balanceCents: number;
};

function getBaseUrl(): string {
  return (process.env.PARAUSTED_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function isEligiblePayload(payload: unknown): payload is EligiblePayload {
  if (typeof payload !== "object" || payload === null) return false;
  const candidate = payload as Record<string, unknown>;
  return (
    candidate.success === true &&
    candidate.eligible === true &&
    typeof candidate.voucherCode === "string" &&
    candidate.voucherCode.length > 0 &&
    typeof candidate.balanceCents === "number" &&
    Number.isInteger(candidate.balanceCents) &&
    candidate.balanceCents > 0
  );
}

/** Accepts RFC delta-seconds only; never forwards an arbitrary provider header. */
function retryAfterSeconds(response: Response): number {
  const raw = response.headers.get("retry-after")?.trim();
  if (!raw || !/^\d+$/.test(raw)) return DEFAULT_RETRY_AFTER_SECONDS;
  const seconds = Number(raw);
  if (!Number.isSafeInteger(seconds) || seconds < 1) return DEFAULT_RETRY_AFTER_SECONDS;
  return Math.min(seconds, MAX_RETRY_AFTER_SECONDS);
}

/**
 * Verifies a ParaUsted voucher read-only. Validates/normalizes the code locally,
 * GETs the partner endpoint with the service token, and validates the response.
 * Any failure (missing config, network, timeout, malformed body, ineligible state)
 * resolves to `{ eligible: false }`.
 */
export async function verifyParaUstedVoucher(rawCode: string): Promise<ParaUstedVerifyResult> {
  const code = normalizeGiftCardCode(rawCode);
  if (!CODE_PATTERN.test(code)) {
    return { eligible: false };
  }

  const token = process.env.PARAUSTED_SERVICE_TOKEN;
  if (!token) {
    // Fail safe. Never print the secret value; this only signals absence.
    console.error("[parausted] PARAUSTED_SERVICE_TOKEN is not configured");
    return { eligible: false };
  }

  const url = `${getBaseUrl()}/api/partner/vouchers/${encodeURIComponent(code)}`;
  const masked = maskVoucherCode(code);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    // Network error or timeout. Log a masked breadcrumb only — never the URL (it
    // contains the code) nor the token.
    console.error(`[parausted] verify network error for ${masked}`);
    return { eligible: false };
  }

  if (response.status === 429) {
    return {
      eligible: false,
      rateLimited: true,
      retryAfterSeconds: retryAfterSeconds(response),
    };
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.ok && isEligiblePayload(payload)) {
    return {
      eligible: true,
      maskedCode: maskVoucherCode(payload.voucherCode),
      balanceCents: payload.balanceCents,
    };
  }

  return { eligible: false };
}
