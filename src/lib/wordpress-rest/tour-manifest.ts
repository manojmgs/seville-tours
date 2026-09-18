import "server-only";

import { cache } from "react";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { TourPage } from "./types";

type TourManifestEntry = TourPage & {
  updatedAt?: string;
};

type TourManifest = {
  generatedAt: string;
  source: string;
  entries: Record<string, TourManifestEntry>;
};

const TOUR_MANIFEST_PATH = path.join(
  process.cwd(),
  "public",
  "generated",
  "wordpress-tour-manifest.json",
);

const loadTourManifest = cache(async (): Promise<TourManifest | null> => {
  try {
    await access(TOUR_MANIFEST_PATH);
  } catch {
    return null;
  }

  try {
    const fileContents = await readFile(TOUR_MANIFEST_PATH, "utf8");

    return JSON.parse(fileContents) as TourManifest;
  } catch (error) {
    console.warn("Failed to read tour manifest", error);
    return null;
  }
});

export const getTourManifestEntryBySlug = cache(
  async (slug: string): Promise<TourPage | undefined> => {
    if (!slug) {
      return undefined;
    }

    const manifest = await loadTourManifest();

    return manifest?.entries[slug];
  },
);

export const getDeterministicTourContentBySlug = cache(
  async (slug: string): Promise<TourPage | null> => {
    if (!slug) {
      return null;
    }

    const manifestEntry = await getTourManifestEntryBySlug(slug);

    return manifestEntry ?? null;
  },
);

export const getStaticTourSlugs = cache(
  async (limit = 50): Promise<string[]> => {
    const manifest = await loadTourManifest();

    if (!manifest) {
      return [];
    }

    return Object.values(manifest.entries)
      .slice(0, limit)
      .map((entry) => entry.slug)
      .filter(Boolean);
  },
);