import type { MetadataRoute } from "next";
import { WEEKLY_REVALIDATE_SECONDS } from "@/lib/wordpress-rest/cache";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sevilletoursco.com";
const WORDPRESS_SITE_URL =
  process.env.WORDPRESS_SITE_URL ?? "https://sevilletoursco.com";

type WordPressSitemapProduct = {
  link: string;
  modified?: string;
};

async function getWordPressProductUrls(): Promise<WordPressSitemapProduct[]> {
  const url =
    `${WORDPRESS_SITE_URL}/wp-json/wp/v2/product` +
    "?per_page=100&_fields=link,modified,slug";

  try {
    const response = await fetch(url, {
      next: {
        revalidate: WEEKLY_REVALIDATE_SECONDS,
      },
    });

    if (!response.ok) {
      console.warn(
        `Sitemap WordPress REST fetch failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    return (await response.json()) as WordPressSitemapProduct[];
  } catch (error) {
    console.warn("Sitemap WordPress REST fetch failed", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getWordPressProductUrls();

  const homepage: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  };

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: product.link,
    lastModified: product.modified ? new Date(product.modified) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [homepage, ...productPages];
}
