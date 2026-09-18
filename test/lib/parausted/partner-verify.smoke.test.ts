import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyParaUstedVoucher } from "@/lib/parausted/partner-verify";

/**
 * Staging contract smoke test for the deployed ParaUsted verification endpoint:
 *
 *   GET ${PARAUSTED_BASE_URL}/api/partner/vouchers/{code}
 *
 * These make REAL network calls, so they run only when staging credentials are
 * present and skip safely otherwise (local dev / CI without secrets). Nothing here
 * prints the service token or the full voucher code.
 *
 * Required env to run:
 *   - PARAUSTED_BASE_URL           (server-only base URL of the staging deployment)
 *   - PARAUSTED_SERVICE_TOKEN      (server-only partner token, scope voucher:read)
 *   - PARAUSTED_SMOKE_VOUCHER_CODE (a known-valid, eligible staging voucher)
 * Optional:
 *   - PARAUSTED_SMOKE_INVALID_CODE (a known-invalid code; defaults to a dummy)
 */

const hasStagingCreds =
  Boolean(process.env.PARAUSTED_BASE_URL) &&
  Boolean(process.env.PARAUSTED_SERVICE_TOKEN) &&
  Boolean(process.env.PARAUSTED_SMOKE_VOUCHER_CODE);

describe.skipIf(!hasStagingCreds)("ParaUsted verification — staging smoke", () => {
  beforeEach(() => {
    // Keep masked breadcrumbs out of the test output.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns eligible for a valid voucher and does not change its balance", async () => {
    const code = process.env.PARAUSTED_SMOKE_VOUCHER_CODE as string;

    // Adapter returns `eligible: true` only when the provider responded with
    // success === true AND eligible === true, so this asserts the contract shape.
    const first = await verifyParaUstedVoucher(code);
    expect(first.eligible).toBe(true);

    // Verification is read-only: a second call must report the same balance.
    const second = await verifyParaUstedVoucher(code);
    expect(second.eligible).toBe(true);

    if (first.eligible && second.eligible) {
      expect(second.balanceCents).toBe(first.balanceCents);
    }
  });

  it("returns only the generic ineligible result for an invalid voucher", async () => {
    const invalidCode = process.env.PARAUSTED_SMOKE_INVALID_CODE ?? "PU-0000-0000-0000";

    const result = await verifyParaUstedVoucher(invalidCode);

    expect(result).toEqual({ eligible: false });
  });
});
