import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Noto_Sans_Arabic } from "next/font/google";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { localeDirection } from "@/lib/i18n/site";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import "./globals.css";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
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
