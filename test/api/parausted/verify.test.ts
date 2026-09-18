import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/parausted/verify/route";

/**
 * Browser-facing verification route.
 *
 * Guards: validates input, rate-limits before hitting the provider, returns one
 * generic ineligible shape, sets `Cache-Control: no-store`, and can never reach the
 * commit `/redeem` path.
 */

const SERVICE_TOKEN = "svc-token-test-value";
const BASE_URL = "https://parausted.test";
const VALID_CODE = "PU-1A2B-3C4D-5E6F";

let fetchMock: ReturnType<typeof vi.fn>;
let ipCounter = 0;

function nextIp(): string {
  ipCounter += 1;
  return `10.0.0.${ipCounter}`;
}

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

function makeRequest(body: unknown, ip = nextIp(), rawBody?: string): Request {
  return new Request("http://localhost/api/parausted/verify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: rawBody ?? JSON.stringify(body),
  });
}

const eligibleBody = {
  success: true,
  eligible: true,
  voucherCode: VALID_CODE,
  balanceCents: 5000,
  status: "delivered",
  expiresAt: "2027-07-13T00:00:00+00:00",
};

beforeEach(() => {
  process.env.PARAUSTED_SERVICE_TOKEN = SERVICE_TOKEN;
  process.env.PARAUSTED_BASE_URL = BASE_URL;
  fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, eligibleBody));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.PARAUSTED_SERVICE_TOKEN;
  delete process.env.PARAUSTED_BASE_URL;
});

describe("POST /api/parausted/verify", () => {
  it("verifies an eligible voucher via GET and sets no-store", async () => {
    const response = await POST(makeRequest({ code: VALID_CODE }));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      eligible: true,
      maskedCode: expect.any(String),
      balanceCents: 5000,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("GET");
    expect(url).not.toContain("/redeem");
  });

  it("never reaches the commit /redeem endpoint for any provider result", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, eligibleBody));

    await POST(makeRequest({ code: VALID_CODE }));

    for (const call of fetchMock.mock.calls) {
      expect(String(call[0])).not.toContain("/redeem");
    }
  });

  it("rejects a missing code without calling the provider", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ eligible: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON without calling the provider", async () => {
    const response = await POST(makeRequest(undefined, nextIp(), "not-json"));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a generic ineligible result for an unknown voucher (provider 404)", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(404, { success: false, error: "invalid_or_not_found" }),
    );

    const response = await POST(makeRequest({ code: VALID_CODE }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ eligible: false });
  });

  it("does not expose provider error distinctions", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: false, error: "expired" }));

    const response = await POST(makeRequest({ code: VALID_CODE }));

    await expect(response.json()).resolves.toEqual({ eligible: false });
  });

  it("propagates ParaUsted Retry-After while keeping the body generic", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(429, { success: false, error: "rate_limited" }, { "Retry-After": "41" }),
    );

    const response = await POST(makeRequest({ code: VALID_CODE }));

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("41");
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ eligible: false });
  });

  it("rate-limits before calling the provider", async () => {
    const ip = nextIp();
    let lastStatus = 0;

    // MAX_PER_WINDOW is 12; the 13th request from the same IP must be blocked.
    for (let attempt = 0; attempt < 13; attempt += 1) {
      const response = await POST(makeRequest({ code: VALID_CODE }, ip));
      lastStatus = response.status;
    }

    expect(lastStatus).toBe(429);
    // The blocked request must not add a provider call: 12 allowed, 1 blocked.
    expect(fetchMock).toHaveBeenCalledTimes(12);
  });

  it("returns Retry-After for the local public-route limit", async () => {
    const ip = nextIp();
    let blocked: Response | null = null;

    for (let attempt = 0; attempt < 13; attempt += 1) {
      blocked = await POST(makeRequest({ code: VALID_CODE }, ip));
    }

    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get("retry-after")).toBe("60");
    await expect(blocked?.json()).resolves.toEqual({ eligible: false });
  });

  it("cannot be bypassed by rotating the leftmost X-Forwarded-For token", async () => {
    const trustedHop = "203.0.113.77";
    let lastStatus = 0;

    // Each request spoofs a different leftmost XFF value but shares the same trusted
    // last hop. A correct resolver buckets them together, so the 13th is blocked.
    for (let attempt = 0; attempt < 13; attempt += 1) {
      const request = new Request("http://localhost/api/parausted/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": `10.9.9.${attempt}, ${trustedHop}`,
        },
        body: JSON.stringify({ code: VALID_CODE }),
      });
      const response = await POST(request);
      lastStatus = response.status;
    }

    expect(lastStatus).toBe(429);
  });
});
