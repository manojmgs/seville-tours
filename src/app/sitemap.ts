import type { MetadataRoute } from "next";
import { getSeoManifestEntries } from "@/lib/wordpress-rest/seo-manifest";
import { supportedLocales } from "@/lib/i18n/site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sevilletoursco.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSeoManifestEntries();

  // Home — one entry per locale
  const homepageEntries: MetadataRoute.Sitemap = supportedLocales.map((locale) => ({
    url: `${SITE_URL}/${locale}/`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: locale === "en" ? 1 : 0.9,
  }));

  // Tour pages — one entry per locale × slug
  const tourEntries: MetadataRoute.Sitemap = entries.flatMap((entry) =>
    supportedLocales.map((locale) => ({
      url: `${SITE_URL}/${locale}/tours${entry.uri.replace(/^\/tours/, "") || "/"}`,
      lastModified: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: locale === "en" ? 0.9 : 0.7,
    })),
  );

  return [...homepageEntries, ...tourEntries];
}
