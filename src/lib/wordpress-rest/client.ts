import type {
  RelatedTourCard,
  TourPage,
  WooCommerceStoreProduct,
  WordPressProduct,
} from "./types";
import {
  buildWooCommerceStoreProductUrl,
  buildWordPressProductUrl,
  uriToSlug,
} from "./urls";
import {
  normalizeRelatedTourCard,
  normalizeTourPage,
} from "./normalize";
import { getSeoMetadataByUrl } from "./seo";

type FetchOptions = {
  revalidate?: number;
};

async function wordpressRestFetch<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: options.revalidate ?? 120,
    },
  });

  if (!response.ok) {
    throw new Error(
      `WordPress REST request failed: ${response.status} ${response.statusText} for ${url}`,
    );
  }

  return response.json() as Promise<T>;
}

async function getWordPressProductBySlug(
  slug: string,
): Promise<WordPressProduct | null> {
  if (!slug) {
    return null;
  }

  const url = buildWordPressProductUrl(slug);

  const products = await wordpressRestFetch<WordPressProduct[]>(url, {
    revalidate: 120,
  });

  return products[0] ?? null;
}

async function getWooCommerceStoreProductBySlug(
  slug: string,
): Promise<WooCommerceStoreProduct | undefined> {
  if (!slug) {
    return undefined;
  }

  const url = buildWooCommerceStoreProductUrl(slug);

  try {
    const products = await wordpressRestFetch<WooCommerceStoreProduct[]>(url, {
      revalidate: 120,
    });

    return products[0];
  } catch {
    return undefined;
  }
}

async function enrichWithLiveSeo(content: TourPage): Promise<TourPage> {
  const extractedSeo = await getSeoMetadataByUrl(content.link);

  if (!extractedSeo) {
    return content;
  }

  return {
    ...content,
    seo: {
      ...content.seo,
      title: extractedSeo.title ?? content.seo.title,
      description: extractedSeo.description ?? content.seo.description,
      canonical: extractedSeo.canonical ?? content.seo.canonical,
    },
  };
}

export async function getProductBySlug(slug: string): Promise<TourPage | null> {
  const wordpressProduct = await getWordPressProductBySlug(slug);

  if (!wordpressProduct) {
    return null;
  }

  const commerceProduct = await getWooCommerceStoreProductBySlug(slug);
  const content = normalizeTourPage(wordpressProduct, commerceProduct);

  return enrichWithLiveSeo(content);
}

export async function getRelatedProductsByUrl(
  url: string,
): Promise<RelatedTourCard[]> {
  if (!url) {
    return [];
  }

  try {
    const products = await wordpressRestFetch<WooCommerceStoreProduct[]>(url, {
      revalidate: 120,
    });

    return products
      .map((product) => normalizeRelatedTourCard(product))
      .filter((product): product is RelatedTourCard => Boolean(product));
  } catch {
    return [];
  }
}

export async function getContentByUri(uri: string): Promise<TourPage | null> {
  const slug = uriToSlug(uri);

  if (!slug) {
    return null;
  }

  return getProductBySlug(slug);
}