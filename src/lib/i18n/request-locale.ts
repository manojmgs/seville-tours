import { cookies, headers } from "next/headers";
import { detectLocale, normalizeLocale, type Locale } from "./site";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get("st-locale")?.value);
  if (cookieLocale) {
    return cookieLocale;
  }

  const headerStore = await headers();
  return detectLocale(headerStore.get("accept-language"));
}
