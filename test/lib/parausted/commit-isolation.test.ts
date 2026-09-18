import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Commit-adapter isolation.
 *
 * The irreversible full-balance commit (`redeemParaUstedVoucher` in
 * `lib/parausted/partner-redeem.ts`) must never be reachable from a browser-facing
 * API route. This test statically proves that no file under `src/app/api` imports the
 * commit module or references the commit function.
 */

const API_DIR = fileURLToPath(new URL("../../../src/app/api", import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("ParaUsted commit adapter isolation", () => {
  const routeFiles = walk(API_DIR).filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));

  it("scans the API surface, including the verify route", () => {
    expect(routeFiles.length).toBeGreaterThan(0);
    expect(
      routeFiles.some((file) => file.replace(/\\/g, "/").includes("parausted/verify/route")),
    ).toBe(true);
  });

  it("has no browser-facing route importing or invoking the commit adapter", () => {
    const offenders = routeFiles.filter((file) => {
      const source = readFileSync(file, "utf8");
      return source.includes("partner-redeem") || source.includes("redeemParaUstedVoucher");
    });

    expect(offenders).toEqual([]);
  });
});
