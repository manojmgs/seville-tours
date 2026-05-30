import "server-only";

import { cache } from "react";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import {
  STATIC_TOUR_PARAMS_LIMIT,
  STATIC_TOUR_PARAM_EXCLUDED_SLUGS,
} from "./cache";

export type WordPressSeoManifestEntry = {
  slug: string;
  uri: string;
  link: string;
  title?: string;
  description?: string;
  canonical?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  updatedAt?: string;
};

type WordPressSeoManifest = {
  generatedAt: string;
  source: string;
  entries: Record<string, WordPressSeoManifestEntry>;
};

const SEO_MANIFEST_PATH = path.join(
  process.cwd(),
  "public",
  "generated",
  "wordpress-seo-manifest.json",
);

const loadSeoManifest = cache(async (): Promise<WordPressSeoManifest | null> => {
  try {
    await access(SEO_MANIFEST_PATH);
  } catch {
    return null;
  }

  try {
    const fileContents = await readFile(SEO_MANIFEST_PATH, "utf8");

    return JSON.parse(fileContents) as WordPressSeoManifest;
  } catch (error) {
    console.warn("Failed to read SEO manifest", error);
    return null;
  }
});

export const getSeoManifestEntryBySlug = cache(
  async (slug: string): Promise<WordPressSeoManifestEntry | undefined> => {
    if (!slug) {
      return undefined;
    }

    const manifest = await loadSeoManifest();

    return manifest?.entries[slug];
  },
);

export const getStaticTourSlugs = cache(
  async (limit = STATIC_TOUR_PARAMS_LIMIT): Promise<string[]> => {
    const manifest = await loadSeoManifest();

    if (!manifest) {
      return [];
    }

    const excludedSlugs = new Set(STATIC_TOUR_PARAM_EXCLUDED_SLUGS);

    return Object.values(manifest.entries)
      .filter((entry) => !excludedSlugs.has(entry.slug as (typeof STATIC_TOUR_PARAM_EXCLUDED_SLUGS)[number]))
      .sort((left, right) => {
        const leftTime = left.updatedAt ? Date.parse(left.updatedAt) : 0;
        const rightTime = right.updatedAt ? Date.parse(right.updatedAt) : 0;

        return rightTime - leftTime;
      })
      .slice(0, limit)
      .map((entry) => entry.slug)
      .filter(Boolean);
  },
);