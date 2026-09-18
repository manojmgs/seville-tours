import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Cormorant_Garamond, Noto_Sans_Arabic } from "next/font/google";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { localeDirection, normalizeLocale, supportedLocales } from "@/lib/i18n/site";
import type { Locale } from "@/lib/i18n/types";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale | undefined;

  if (!locale || !supportedLocales.includes(locale)) {
    notFound();
  }

  const isArabic = locale === "ar";

  return (
    <html
      lang={locale}
      dir={localeDirection(locale)}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={isArabic ? { fontFamily: "var(--font-noto-arabic), var(--font-geist-sans), Arial, Helvetica, sans-serif" } : undefined}
      >
        {children}
        <ScrollToTopButton locale={locale} />
      </body>
    </html>
  );
}
