import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "es", "fr", "ar"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_ALIASES: Record<string, Locale> = {
  en: "en", es: "es", fr: "fr", ar: "ar",
  "ar-sa": "ar", "ar-ae": "ar", "ar-eg": "ar",
};

function normalizeLocale(value?: string | null): Locale | undefined {
  if (!value) return undefined;
  const lower = value.trim().toLowerCase();
  if (lower in LOCALE_ALIASES) return LOCALE_ALIASES[lower];
  const base = lower.split("-")[0];
  return LOCALE_ALIASES[base];
}

function detectLocaleFromAcceptLanguage(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) return "en";

  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tagPart, qPart] = part.trim().split(";q=");
      return { tag: tagPart, quality: qPart ? Number(qPart) : 1 };
    })
    .filter(({ tag }) => Boolean(tag))
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of candidates) {
    const locale = normalizeLocale(tag);
    if (locale) return locale;
  }

  return "en";
}

function getPreferredLocale(request: NextRequest): Locale {
  const cookieLocale = normalizeLocale(request.cookies.get("st-locale")?.value);
  if (cookieLocale) return cookieLocale;
  return detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let Next.js internals, static files, and API routes pass through unchanged
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/generated") ||
    /\.[^/]+$/.test(pathname) // has a file extension (e.g. .ico, .png, .xml)
  ) {
    return NextResponse.next();
  }

  // If the path already begins with a supported locale segment, pass through
  const firstSegment = pathname.split("/")[1];
  if (SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    return NextResponse.next();
  }

  // No locale prefix — detect and redirect
  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  // Use 307 (temporary) so search engines wait for the permanent 301s defined
  // in next.config.ts before fully committing the new locale-prefixed URLs.
  return NextResponse.redirect(url, { status: 307 });
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico   (browser icon)
     * - sitemap.xml / robots.txt (served by Next.js route handlers)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
