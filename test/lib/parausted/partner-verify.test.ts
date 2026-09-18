import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyParaUstedVoucher } from "@/lib/parausted/partner-verify";

/**
 * Read-only ParaUsted verification adapter.
 *
 * Guards the P0 containment: this path must GET the read-only endpoint, must never
 * touch `/redeem`, must send the service token, and must collapse every failure and
 * ineligible state into a single generic `{ eligible: false }`.
 */

const SERVICE_TOKEN = "svc-token-test-value";
const BASE_URL = "https://parausted.test";
const VALID_CODE = "PU-1A2B-3C4D-5E6F";

function jsonResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    json: async () => body,
  } as Response;
}

const eligibleBody = {
  success: true,
  eligible: true,
  voucherCode: VALID_CODE,
  balanceCents: 5000,
  status: "delivered",
  expiresAt: "2027-07-13T00:00:00+00:00",
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.PARAUSTED_SERVICE_TOKEN = SERVICE_TOKEN;
  process.env.PARAUSTED_BASE_URL = BASE_URL;
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.PARAUSTED_SERVICE_TOKEN;
  delete process.env.PARAUSTED_BASE_URL;
});

describe("verifyParaUstedVoucher", () => {
  it("verifies an eligible voucher with a GET and never calls /redeem", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, eligibleBody));

    const result = await verifyParaUstedVoucher(VALID_CODE);

    expect(result).toEqual({
      eligible: true,
      maskedCode: expect.any(String),
      balanceCents: 5000,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/api/partner/vouchers/${encodeURIComponent(VALID_CODE)}`);
    expect(url).not.toContain("/redeem");
    expect(init.method).toBe("GET");
  });

  it("sends the service token only from the server adapter", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, eligibleBody));

    await verifyParaUstedVoucher(VALID_CODE);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${SERVICE_TOKEN}`);
    expect(headers.Accept).toBe("application/json");
  });

  it("does not leak the full voucher code in the masked result", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, eligibleBody));

    const result = await verifyParaUstedVoucher(VALID_CODE);

    expect(result.eligible).toBe(true);
    if (result.eligible) {
      expect(result.maskedCode).not.toBe(VALID_CODE);
      expect(result.maskedCode).toContain("*");
    }
  });

  it("fails safe when the service token is not configured, without calling the provider", async () => {
    delete process.env.PARAUSTED_SERVICE_TOKEN;

    const result = await verifyParaUstedVoucher(VALID_CODE);

    expect(result).toEqual({ eligible: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed code shape without calling the provider", async () => {
    const result = await verifyParaUstedVoucher("not a code!!");

    expect(result).toEqual({ eligible: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("collapses a provider 404 into a generic ineligible result", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(404, { success: false, error: "invalid_or_not_found" }),
    );

    const result = await verifyParaUstedVoucher(VALID_CODE);

    expect(result).toEqual({ eligible: false });
  });

  it("returns a sanitized internal backoff signal for provider rate limiting", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(429, { success: false, error: "rate_limited" }, { "Retry-After": "37" }),
    );

    const result = await verifyParaUstedVoucher(VALID_CODE);

    expect(result).toEqual({ eligible: false, rateLimited: true, retryAfterSeconds: 37 });
  });

  it("does not forward malformed Retry-After header content", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        429,
        { success: false, error: "rate_limited" },
        { "Retry-After": "Sun, 13 Jul 2026 20:00:00 GMT" },
      ),
    );

    const result = await verifyParaUstedVoucher(VALID_CODE);

    expect(result).toEqual({ eligible: false, rateLimited: true, retryAfterSeconds: 60 });
  });

  it("does not expose provider-specific states (expired/redeemed) to the caller", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: false, error: "expired" }));

    const result = await verifyParaUstedVoucher(VALID_CODE);

    // Exactly the generic shape — no `error`, `status`, or `reason` field leaks out.
    expect(result).toEqual({ eligible: false });
    expect(Object.keys(result)).toEqual(["eligible"]);
  });

  it("fails safe on malformed provider JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);

    const result = await verifyParaUstedVoucher(VALID_CODE);

    expect(result).toEqual({ eligible: false });
  });

  it("fails safe when the eligible payload is missing required fields", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { success: true, eligible: true, voucherCode: VALID_CODE }),
    );

    const result = await verifyParaUstedVoucher(VALID_CODE);

    expect(result).toEqual({ eligible: false });
  });

  it("fails safe on a provider timeout / network error", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation timed out", "TimeoutError"));

    const result = await verifyParaUstedVoucher(VALID_CODE);

    expect(result).toEqual({ eligible: false });
  });
});
