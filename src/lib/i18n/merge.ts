import type { DeepPartial } from "./types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeCopy<T extends Record<string, unknown>>(
  base: T,
  overrides: DeepPartial<T>,
): T {
  const output = (Array.isArray(base) ? [...base] : { ...base }) as Record<string, unknown>;

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      continue;
    }

    const baseValue = base[key as keyof T];

    if (isPlainObject(baseValue) && isPlainObject(value)) {
      output[key] = mergeCopy(baseValue as Record<string, unknown>, value as DeepPartial<Record<string, unknown>>);
      continue;
    }

    output[key] = value as unknown;
  }

  return output as T;
}
