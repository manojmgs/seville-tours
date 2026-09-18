import type { Metadata } from "next";

/**
 * Root layout — intentionally minimal.
 *
 * All navigable routes live under src/app/[locale]/ which provides the full
 * <html lang dir> shell with locale-aware fonts and direction.
 * Bare-path routes (e.g. /tours/:slug) are 301-redirected to /en/... via
 * next.config.ts and never render.
 *
 * This layout only holds global Metadata (metadataBase, default title template,
 * OpenGraph/Twitter card defaults) which Next.js merges with per-page metadata.
 *
 * See: https://nextjs.org/docs/app/guides/internationalization
 */

export const metadata: Metadata = {
  metadataBase: new URL("https://sevilletoursco.com"),
  title: {
    default: "Seville Tours Co.",
    template: "%s | Seville Tours Co.",
  },
  description: "Private and luxury tours from Seville, guided by Carlos.",
  openGraph: {
    siteName: "Seville Tours Co.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // <html> and <body> are rendered by src/app/[locale]/layout.tsx so that
  // lang, dir, and Arabic font can be set per-locale without nested html tags.
  return children;
}

