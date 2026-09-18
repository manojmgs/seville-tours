import { afterEach, describe, expect, it } from "vitest";

import {
  buildParaUstedGiftCardProductUrl,
  buildParaUstedMerchantUrl,
} from "@/lib/parausted/merchant-url";

const ORIGINAL_BASE_URL = process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL;

afterEach(() => {
  if (ORIGINAL_BASE_URL === undefined) {
    delete process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL = ORIGINAL_BASE_URL;
  }
});

describe("ParaUsted customer-facing URLs", () => {
  it("uses the local ParaUsted server during local integration testing", () => {
    process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL = "http://localhost:3001/";

    expect(buildParaUstedMerchantUrl("en")).toBe(
      "http://localhost:3001/en/m/seville-tours-co",
    );
  });

  it("uses the Vercel origin when no override is configured", () => {
    delete process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL;

    expect(buildParaUstedMerchantUrl("es")).toBe(
      "https://parausted.vercel.app/es/m/seville-tours-co",
    );
  });

  it("does not allow a non-local override outside the production origin", () => {
    process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL = "https://unexpected.example/";

    expect(buildParaUstedMerchantUrl("en")).toBe(
      "https://parausted.vercel.app/en/m/seville-tours-co",
    );
  });

  it("builds encoded product links on the Vercel origin", () => {
    delete process.env.NEXT_PUBLIC_PARAUSTED_BASE_URL;

    expect(buildParaUstedGiftCardProductUrl("fr", " gift/card id ")).toBe(
      "https://parausted.vercel.app/en/m/seville-tours-co/gift-cards/gift%2Fcard%20id",
    );
  });
});