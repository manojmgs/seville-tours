/**
 * Gift-card redemption skeleton (ParaUsted-owned).
 *
 * LOCKED V1 boundary: ParaUsted owns voucher issuance, payment confirmation, and
 * redemption. Seville Tours must never persist a voucher code, balance, or
 * payment/refund state. The authenticated redemption/verification call (partner
 * API + agreement) lands in ParaUsted V2.
 *
 * For now this is a deliberate SKELETON: it validates the code shape locally,
 * never transmits it anywhere, and returns a "pending" status so Carlos verifies
 * and applies the voucher manually. The shape mirrors the future V2 response so
 * swapping in the real verification call later is a drop-in change.
 */

export type GiftCardRedemptionStatus =
  /** Code shape is invalid; nothing was checked. */
  | "invalid_format"
  /** Code looks valid; verification is deferred to manual confirmation (V1). */
  | "pending"
  /** Verified and redeemable (reserved for V2; never returned in V1). */
  | "verified"
  /** Upstream verification unavailable (reserved for V2). */
  | "unavailable";

export type GiftCardRedemptionResult = {
  status: GiftCardRedemptionStatus;
  /** True only when ParaUsted has confirmed the voucher (V2). Always false in V1. */
  verified: boolean;
  /** Normalized code echoed back to the caller. Never logged or stored. */
  code: string;
};

/** Letters, digits and dashes; 6–32 chars. Loose by design — ParaUsted is authoritative. */
const CODE_PATTERN = /^[A-Z0-9-]{6,32}$/;

/** Normalizes a raw gift-card code for display and (future) transmission. */
export function normalizeGiftCardCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

/**
 * V1 skeleton verification. Validates shape only and returns a pending status.
 * Does NOT contact ParaUsted or hold any state. Replace the pending branch with
 * the authenticated ParaUsted call in V2 without changing this signature.
 */
export async function verifyGiftCard(rawCode: string): Promise<GiftCardRedemptionResult> {
  const code = normalizeGiftCardCode(rawCode);

  if (!CODE_PATTERN.test(code)) {
    return { status: "invalid_format", verified: false, code };
  }

  // SKELETON: no outbound call in V1. Carlos confirms the voucher manually.
  return { status: "pending", verified: false, code };
}
