import type { MetadataRoute } from "next";
import { getSeoManifestEntries } from "@/lib/wordpress-rest/seo-manifest";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sevilletoursco.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSeoManifestEntries();

  const homepage: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  };

  const tourPages: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${SITE_URL}${entry.uri}`,
    lastModified: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [homepage, ...tourPages];
}
