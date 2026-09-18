import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest setup for the Next.js/TypeScript stack.
 *
 * - Default `node` environment for adapters and route handlers; component tests opt
 *   into jsdom via a `// @vitest-environment jsdom` docblock.
 * - `server-only` is aliased to an empty stub so server modules can be imported in
 *   tests without the RSC-only guard throwing.
 * - `@/` mirrors the tsconfig path alias.
 * - `PARAUSTED_*` values are read from local `.env` / gitignored `.env.local` into
 *   the test `process.env` so the gated staging smoke test can pick them up. Only the
 *   `PARAUSTED_` prefix is loaded (no other/system env), and no secret value is ever
 *   written to a committed file. Dependency-free by design (no `vite`/`dotenv` import).
 */
function loadParaustedEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const file of [".env", ".env.local"]) {
    let raw: string;
    try {
      raw = readFileSync(fileURLToPath(new URL(`./${file}`, import.meta.url)), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*(PARAUSTED[A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      let value = match[2];
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[match[1]] = value;
    }
  }
  return out;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "server-only": fileURLToPath(new URL("./test/stubs/server-only.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["test/**/*.test.{ts,tsx}"],
    env: loadParaustedEnv(),
  },
});
