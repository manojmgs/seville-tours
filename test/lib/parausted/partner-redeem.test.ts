import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { redeemParaUstedVoucher } from "@/lib/parausted/partner-redeem";

const SERVICE_TOKEN = "server-only-test-token";
const BASE_URL = "https://parausted.test";
const VOUCHER_CODE = "PU-1A2B-3C4D-5E6F";
const BOOKING_REFERENCE = "booking-018f6f33-9bb5-7a00-a2d8-4a6ec1481047";

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function successBody(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    voucherCode: VOUCHER_CODE,
    amountCents: 4200,
    balanceBefore: 8000,
    balanceAfter: 3800,
    status: "partially_redeemed",
    redemptionId: "redemption-123",
    replay: false,
    retrySafe: true,
    ...overrides,
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.PARAUSTED_SERVICE_TOKEN = SERVICE_TOKEN;
  process.env.PARAUSTED_BASE_URL = BASE_URL;
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.PARAUSTED_SERVICE_TOKEN;
  delete process.env.PARAUSTED_BASE_URL;
});

describe("redeemParaUstedVoucher", () => {
  it("sends a partial amount and the persisted booking reference as the idempotency key", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, successBody()));

    const result = await redeemParaUstedVoucher({
      rawCode: VOUCHER_CODE,
      idempotencyKey: BOOKING_REFERENCE,
      amountCents: 4200,
      partnerReference: BOOKING_REFERENCE,
      notes: "Confirmed booking redemption",
    });

    expect(result).toMatchObject({
      ok: true,
      amountCents: 4200,
      status: "partially_redeemed",
      balanceAfterCents: 3800,
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/redeem");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe(BOOKING_REFERENCE);
    expect(JSON.parse(init.body as string)).toEqual({
      amountCents: 4200,
      partnerReference: BOOKING_REFERENCE,
      notes: "Confirmed booking redemption",
    });
  });

  it("reuses the same key on retry and returns ParaUsted's replay result", async () => {
    fetchMock
      .mockRejectedValueOnce(new DOMException("Timed out", "TimeoutError"))
      .mockResolvedValueOnce(jsonResponse(200, successBody({ replay: true })));

    const input = {
      rawCode: VOUCHER_CODE,
      idempotencyKey: BOOKING_REFERENCE,
      amountCents: 4200,
      partnerReference: BOOKING_REFERENCE,
    };

    await expect(redeemParaUstedVoucher(input)).resolves.toEqual({
      ok: false,
      error: "ambiguous",
    });
    const replay = await redeemParaUstedVoucher(input);

    expect(replay).toMatchObject({ ok: true, replay: true, redemptionId: "redemption-123" });
    const keys = fetchMock.mock.calls.map(
      ([, init]) => ((init as RequestInit).headers as Record<string, string>)["Idempotency-Key"],
    );
    expect(keys).toEqual([BOOKING_REFERENCE, BOOKING_REFERENCE]);
  });

  it.each(["amount_exceeds_balance", "idempotency_conflict"] as const)(
    "surfaces terminal provider error %s without rewriting it",
    async (error) => {
      fetchMock.mockResolvedValue(jsonResponse(409, { success: false, error }));

      const result = await redeemParaUstedVoucher({
        rawCode: VOUCHER_CODE,
        idempotencyKey: BOOKING_REFERENCE,
        amountCents: 4200,
      });

      expect(result).toEqual({ ok: false, error });
    },
  );

  it("omits amountCents for an intentional full-balance commit", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        200,
        successBody({ amountCents: 8000, balanceAfter: 0, status: "redeemed" }),
      ),
    );

    const result = await redeemParaUstedVoucher({
      rawCode: VOUCHER_CODE,
      idempotencyKey: BOOKING_REFERENCE,
      partnerReference: BOOKING_REFERENCE,
    });

    expect(result).toMatchObject({ ok: true, status: "redeemed", balanceAfterCents: 0 });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ partnerReference: BOOKING_REFERENCE });
  });

  it("rejects non-integer amounts and malformed provider money without committing trust", async () => {
    await expect(
      redeemParaUstedVoucher({
        rawCode: VOUCHER_CODE,
        idempotencyKey: BOOKING_REFERENCE,
        amountCents: 42.5,
      }),
    ).resolves.toEqual({ ok: false, error: "invalid_amount" });
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValue(jsonResponse(200, successBody({ balanceAfter: 38.5 })));
    await expect(
      redeemParaUstedVoucher({
        rawCode: VOUCHER_CODE,
        idempotencyKey: BOOKING_REFERENCE,
        amountCents: 4200,
      }),
    ).resolves.toEqual({ ok: false, error: "unknown" });
  });

  it("keeps the service token server-side and never returns the raw voucher code", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, successBody()));

    const result = await redeemParaUstedVoucher({
      rawCode: VOUCHER_CODE,
      idempotencyKey: BOOKING_REFERENCE,
      amountCents: 4200,
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${SERVICE_TOKEN}`);
    expect(JSON.stringify(result)).not.toContain(SERVICE_TOKEN);
    expect(JSON.stringify(result)).not.toContain(VOUCHER_CODE);
    expect(result).toMatchObject({ ok: true, maskedCode: expect.stringContaining("*") });
  });
});
