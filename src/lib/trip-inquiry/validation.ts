import type { TripExperience, TripInquiryInput } from "./types";

/**
 * Native, dependency-free validation for inbound trip inquiries.
 *
 * Validates and sanitizes at the system boundary: trims strings, caps lengths, bounds
 * list sizes, and enforces the required fields (experience, name, consent). Returns a
 * typed result rather than throwing. A Zod schema can replace this later without
 * changing the service or route contract.
 */

const LIMIT = {
  name: 120,
  contact: 160,
  message: 2000,
  item: 80,
  list: 20,
  duration: 40,
} as const;

const EXPERIENCES: readonly TripExperience[] = ["private", "luxury"];
const LOCALES = new Set(["en", "es", "fr", "ar"]);

export type ValidationError = { field: string; message: string };

export type ValidationResult =
  | { ok: true; value: TripInquiryInput }
  | { ok: false; errors: ValidationError[] };

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringList(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && entry.length <= maxLen)
    .slice(0, maxItems);
}

export function parseTripInquiry(raw: unknown): ValidationResult {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: ValidationError[] = [];

  const experience = asString(body.experience) as TripExperience;
  if (!EXPERIENCES.includes(experience)) {
    errors.push({ field: "experience", message: "Choose an experience." });
  }

  const name = asString(body.name);
  if (!name) {
    errors.push({ field: "name", message: "Name is required." });
  } else if (name.length > LIMIT.name) {
    errors.push({ field: "name", message: "Name is too long." });
  }

  if (body.consent !== true) {
    errors.push({ field: "consent", message: "Consent is required to continue." });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const contact = asString(body.contact).slice(0, LIMIT.contact);
  const message = asString(body.message).slice(0, LIMIT.message);
  const duration = asString(body.duration).slice(0, LIMIT.duration);
  const locale = LOCALES.has(asString(body.locale)) ? asString(body.locale) : "en";

  return {
    ok: true,
    value: {
      experience,
      duration: duration || undefined,
      places: asStringList(body.places, LIMIT.list, LIMIT.item),
      interests: asStringList(body.interests, LIMIT.list, LIMIT.item),
      name,
      contact: contact || undefined,
      message: message || undefined,
      locale,
      consent: true,
    },
  };
}
