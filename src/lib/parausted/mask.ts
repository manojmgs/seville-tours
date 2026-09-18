/**
 * Voucher-code masking, shared by the ParaUsted server adapters.
 *
 * A masked code is safe to surface in the UI and in server logs; a full voucher
 * code must never be logged. This module has no side effects and no secrets.
 */

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
