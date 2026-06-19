import "server-only";

import { randomUUID } from "node:crypto";

import { normalizeGiftCardCode } from "./redeem";

/**
 * Server-to-server ParaUsted voucher redemption (partner API).
 *
 * Boundary: ParaUsted owns voucher issuance, balance, and redemption. This helper
 * calls the authenticated partner endpoint with a server-only bearer token and
 * returns a typed discriminated union. It NEVER throws to the caller and NEVER
 * logs the full voucher code or the service token.
 *
 * MUST run server-side only (route handler / server action). The token is read
 * from a non-`NEXT_PUBLIC_` env var so it can never reach the browser bundle.
 */

const DEFAULT_BASE_URL = "https://parausted.es";

/** Letters, digits and dashes; up to 32 chars. ParaUsted is authoritative on exact shape. */
const CODE_PATTERN = /^[A-Z0-9-]{1,32}$/;

const MAX_NOTES_LENGTH = 500;
const REQUEST_TIMEOUT_MS = 10_000;

/** Stable error keys returned by the partner API (treated as a closed enum). */
export type ParaUstedRedemptionErrorKey =
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "invalid_code"
  | "invalid_request"
  | "not_found"
  | "already_redeemed"
  | "expired"
  | "voided"
  | "exchanged"
  | "not_redeemable"
  | "already_processed"
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
  "not_found",
  "already_redeemed",
  "expired",
  "voided",
  "exchanged",
  "not_redeemable",
  "already_processed",
  "unknown",
]);

type RedeemSuccessPayload = {
  success: true;
  voucherCode: string;
  amountCents: number;
  balanceBefore: number;
  balanceAfter: number;
  redemptionId: string;
};

/** Masks a voucher code for safe display/logging, keeping prefix and final group. */
export function maskVoucherCode(code: string): string {
  const parts = code.split("-");
  if (parts.length >= 3) {
    const [prefix, ...rest] = parts;
    const last = rest.pop() as string;
    const masked = rest.map((part) => "*".repeat(part.length));
    return [prefix, ...masked, last].join("-");
  }
  if (code.length <= 4) return "****";
  return `${code.slice(0, 2)}${"*".repeat(code.length - 4)}${code.slice(-2)}`;
}

function getBaseUrl(): string {
  return (process.env.PARAUSTED_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function isSuccessPayload(payload: unknown): payload is RedeemSuccessPayload {
  if (typeof payload !== "object" || payload === null) return false;
  const candidate = payload as Record<string, unknown>;
  return (
    candidate.success === true &&
    typeof candidate.voucherCode === "string" &&
    typeof candidate.amountCents === "number" &&
    typeof candidate.balanceBefore === "number" &&
    typeof candidate.balanceAfter === "number" &&
    typeof candidate.redemptionId === "string"
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
      return "already_processed";
    default:
      return "unknown";
  }
}

/**
 * Redeems a ParaUsted voucher server-side. Validates/normalizes the code locally,
 * POSTs to the partner endpoint with a fresh idempotency key, and maps the response
 * to a typed result. Network/parse failures resolve to `{ ok: false, error: "unknown" }`.
 */
export async function redeemParaUstedVoucher(
  rawCode: string,
  notes?: string,
): Promise<ParaUstedRedemptionResult> {
  const code = normalizeGiftCardCode(rawCode);
  if (!CODE_PATTERN.test(code)) {
    return { ok: false, error: "invalid_code" };
  }

  const token = process.env.PARAUSTED_SERVICE_TOKEN;
  if (!token) {
    console.error("[parausted] PARAUSTED_SERVICE_TOKEN is not configured");
    return { ok: false, error: "unauthorized" };
  }

  const trimmedNotes =
    typeof notes === "string" ? notes.trim().slice(0, MAX_NOTES_LENGTH) : undefined;
  const idempotencyKey = randomUUID();
  const url = `${getBaseUrl()}/api/partner/vouchers/${encodeURIComponent(code)}/redeem`;
  const masked = maskVoucherCode(code);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
        Accept: "application/json",
      },
      body: JSON.stringify(trimmedNotes ? { notes: trimmedNotes } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    console.error(`[parausted] redeem network error for ${masked}`);
    return { ok: false, error: "unknown" };
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
    };
  }

  const error = resolveErrorKey(response.status, payload);
  console.warn(`[parausted] redeem failed for ${masked} (status ${response.status}, error ${error})`);
  return { ok: false, error };
}
