import "server-only";

import { maskVoucherCode } from "./mask";
import { normalizeGiftCardCode } from "./redeem";

/**
 * Server-to-server ParaUsted voucher redemption (partner API) — the COMMIT adapter.
 *
 * Boundary: ParaUsted owns voucher issuance, balance, and redemption. This helper
 * can perform irreversible partial or full redemption and returns a typed
 * discriminated union. It NEVER throws to the caller and NEVER logs the full
 * voucher code or the service token.
 *
 * ISOLATED: Carlos commits redemption in the authenticated ParaUsted dashboard.
 * Seville Tours has no commit route and no browser call site; this adapter remains
 * server-only contract code. Read-only verification lives in `partner-verify.ts`.
 *
 * MUST run server-side only (route handler / server action). The token is read
 * from a non-`NEXT_PUBLIC_` env var so it can never reach the browser bundle.
 */

// Re-exported so existing importers keep working after the mask helper moved to
// its own side-effect-free module (shared with the read-only verify adapter).
export { maskVoucherCode };

const DEFAULT_BASE_URL = "https://parausted.es";

/** Letters, digits and dashes; up to 32 chars. ParaUsted is authoritative on exact shape. */
const CODE_PATTERN = /^[A-Z0-9-]{1,32}$/;

const MAX_NOTES_LENGTH = 500;
const MAX_AMOUNT_CENTS = 100_000_000;
const MAX_IDEMPOTENCY_KEY_LENGTH = 255;
const PARTNER_REFERENCE_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;
const REQUEST_TIMEOUT_MS = 10_000;

/** Stable error keys returned by the partner API (treated as a closed enum). */
export type ParaUstedRedemptionErrorKey =
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "invalid_code"
  | "invalid_request"
  | "invalid_amount"
  | "not_found"
  | "already_redeemed"
  | "expired"
  | "voided"
  | "exchanged"
  | "not_redeemable"
  | "already_processed"
  | "amount_exceeds_balance"
  | "idempotency_conflict"
  | "ambiguous"
  | "unknown";

export type ParaUstedRedemptionSuccess = {
  ok: true;
  /** Masked voucher code, safe to surface in the UI and logs. */
  maskedCode: string;
  /** Integer cents redeemed in this call. */
  amountCents: number;
  /** Integer cents balance before this redemption. */
  balanceBeforeCents: number;
  /** Integer cents balance remaining after this redemption. */
  balanceAfterCents: number;
  /** ParaUsted redemption ledger id. */
  redemptionId: string;
  status: "partially_redeemed" | "redeemed";
  replay: boolean;
  retrySafe: boolean;
};

export type ParaUstedRedemptionResult =
  | ParaUstedRedemptionSuccess
  | { ok: false; error: ParaUstedRedemptionErrorKey };

const KNOWN_ERROR_KEYS = new Set<ParaUstedRedemptionErrorKey>([
  "unauthorized",
  "forbidden",
  "rate_limited",
  "invalid_code",
  "invalid_request",
  "invalid_amount",
  "not_found",
  "already_redeemed",
  "expired",
  "voided",
  "exchanged",
  "not_redeemable",
  "already_processed",
  "amount_exceeds_balance",
  "idempotency_conflict",
  "ambiguous",
  "unknown",
]);

type RedeemSuccessPayload = {
  success: true;
  voucherCode: string;
  amountCents: number;
  balanceBefore: number;
  balanceAfter: number;
  status: "partially_redeemed" | "redeemed";
  redemptionId: string;
  replay: boolean;
  retrySafe: boolean;
};

export type RedeemParaUstedVoucherInput = {
  rawCode: string;
  /** Stable persisted reference. The same operation MUST always reuse it verbatim. */
  idempotencyKey: string;
  /** Omit only when the confirmed booking value equals/exceeds verified balance. */
  amountCents?: number;
  partnerReference?: string;
  /** Reconciliation context only. Never include guest PII. */
  notes?: string;
};

function getBaseUrl(): string {
  return (process.env.PARAUSTED_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function isSuccessPayload(payload: unknown): payload is RedeemSuccessPayload {
  if (typeof payload !== "object" || payload === null) return false;
  const candidate = payload as Record<string, unknown>;
  return (
    candidate.success === true &&
    typeof candidate.voucherCode === "string" &&
    Number.isSafeInteger(candidate.amountCents) &&
    (candidate.amountCents as number) > 0 &&
    Number.isSafeInteger(candidate.balanceBefore) &&
    (candidate.balanceBefore as number) >= 0 &&
    Number.isSafeInteger(candidate.balanceAfter) &&
    (candidate.balanceAfter as number) >= 0 &&
    typeof candidate.redemptionId === "string" &&
    (candidate.status === "partially_redeemed" || candidate.status === "redeemed") &&
    typeof candidate.replay === "boolean" &&
    typeof candidate.retrySafe === "boolean"
  );
}

function resolveErrorKey(status: number, payload: unknown): ParaUstedRedemptionErrorKey {
  const fromBody =
    typeof (payload as { error?: unknown })?.error === "string"
      ? (payload as { error: string }).error
      : null;
  if (fromBody && KNOWN_ERROR_KEYS.has(fromBody as ParaUstedRedemptionErrorKey)) {
    return fromBody as ParaUstedRedemptionErrorKey;
  }

  switch (status) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 429:
      return "rate_limited";
    case 400:
      return "invalid_request";
    case 404:
      return "not_found";
    case 409:
      return "unknown";
    default:
      return "unknown";
  }
}

/**
 * Redeems a ParaUsted voucher server-side using a persisted booking reference as
 * the idempotency key. Network/timeout failures are `ambiguous`: callers must retain
 * the same key and reconcile by calling again, allowing ParaUsted to replay safely.
 * ParaUsted currently has no redemption lookup endpoint, so same-key replay is the
 * only authoritative reconciliation mechanism.
 */
export async function redeemParaUstedVoucher(
  input: RedeemParaUstedVoucherInput,
): Promise<ParaUstedRedemptionResult> {
  const { rawCode, idempotencyKey, amountCents, partnerReference, notes } = input;
  const code = normalizeGiftCardCode(rawCode);
  if (!CODE_PATTERN.test(code)) {
    return { ok: false, error: "invalid_code" };
  }
  const stableKey = idempotencyKey.trim();
  if (stableKey.length === 0 || stableKey.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    return { ok: false, error: "invalid_request" };
  }
  if (
    amountCents !== undefined &&
    (!Number.isSafeInteger(amountCents) || amountCents <= 0 || amountCents > MAX_AMOUNT_CENTS)
  ) {
    return { ok: false, error: "invalid_amount" };
  }
  if (partnerReference !== undefined && !PARTNER_REFERENCE_PATTERN.test(partnerReference.trim())) {
    return { ok: false, error: "invalid_request" };
  }

  const token = process.env.PARAUSTED_SERVICE_TOKEN;
  if (!token) {
    console.error("[parausted] PARAUSTED_SERVICE_TOKEN is not configured");
    return { ok: false, error: "unauthorized" };
  }

  const trimmedNotes =
    typeof notes === "string" ? notes.trim().slice(0, MAX_NOTES_LENGTH) : undefined;
  const trimmedReference =
    typeof partnerReference === "string" ? partnerReference.trim() : undefined;
  const url = `${getBaseUrl()}/api/partner/vouchers/${encodeURIComponent(code)}/redeem`;
  const masked = maskVoucherCode(code);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": stableKey,
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...(amountCents === undefined ? {} : { amountCents }),
        ...(trimmedReference ? { partnerReference: trimmedReference } : {}),
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    console.error(`[parausted] redeem network error for ${masked}`);
    return { ok: false, error: "ambiguous" };
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.ok && isSuccessPayload(payload)) {
    return {
      ok: true,
      maskedCode: maskVoucherCode(payload.voucherCode),
      amountCents: payload.amountCents,
      balanceBeforeCents: payload.balanceBefore,
      balanceAfterCents: payload.balanceAfter,
      redemptionId: payload.redemptionId,
      status: payload.status,
      replay: payload.replay,
      retrySafe: payload.retrySafe,
    };
  }

  const error = resolveErrorKey(response.status, payload);
  console.warn(`[parausted] redeem failed for ${masked} (status ${response.status}, error ${error})`);
  return { ok: false, error };
}
