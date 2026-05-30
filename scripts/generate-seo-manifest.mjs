import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const WORDPRESS_SITE_URL =
  process.env.WORDPRESS_SITE_URL ?? "https://sevilletoursco.com";
const WORDPRESS_REST_BASE_URL =
  process.env.WORDPRESS_REST_BASE_URL ?? `${WORDPRESS_SITE_URL}/wp-json/wp/v2`;
const SEO_MANIFEST_PATH = path.join(
  process.cwd(),
  "public",
  "generated",
  "wordpress-seo-manifest.json",
);
const TOUR_MANIFEST_PATH = path.join(
  process.cwd(),
  "public",
  "generated",
  "wordpress-tour-manifest.json",
);
const REQUEST_TIMEOUT_MS = 15000;
const CONCURRENCY = 1;

function asNonEmptyString(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized || undefined;
}

function pickFirstString(...values) {
  for (const value of values) {
    const normalized = asNonEmptyString(value);

    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function decodeHtmlEntities(value) {
  if (!value) {
    return undefined;
  }

  return value
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html) {
  return decodeHtmlEntities(html)?.replace(/<[^>]*>/g, " ")?.replace(/\s+/g, " ")?.trim();
}

function getYoastSeo(product) {
  const yoast = product?.yoast_head_json;

  if (!yoast || typeof yoast !== "object") {
    return null;
  }

  return {
    title: pickFirstString(yoast.title, yoast.og_title),
    description: pickFirstString(yoast.description, yoast.og_description),
    canonical: pickFirstString(yoast.canonical),
    openGraphTitle: pickFirstString(yoast.og_title, yoast.title),
    openGraphDescription: pickFirstString(yoast.og_description, yoast.description),
  };
}

function getRankMathSeo(product) {
  const rankMath = product?.rank_math;

  if (!rankMath || typeof rankMath !== "object") {
    return null;
  }

  return {
    title: pickFirstString(rankMath.title, rankMath.og_title),
    description: pickFirstString(rankMath.description, rankMath.og_description),
    canonical: pickFirstString(rankMath.canonical),
    openGraphTitle: pickFirstString(rankMath.og_title, rankMath.title),
    openGraphDescription: pickFirstString(rankMath.og_description, rankMath.description),
  };
}

function getNormalizedSeoField(product) {
  const nextSeo = product?.next_seo;

  if (!nextSeo || typeof nextSeo !== "object") {
    return null;
  }

  return {
    title: pickFirstString(nextSeo.title),
    description: pickFirstString(nextSeo.description),
    canonical: pickFirstString(nextSeo.canonical),
    openGraphTitle: pickFirstString(nextSeo.openGraphTitle, nextSeo.title),
    openGraphDescription: pickFirstString(nextSeo.openGraphDescription, nextSeo.description),
  };
}

function getPreferredSeo(product) {
  return getNormalizedSeoField(product) ?? getYoastSeo(product) ?? getRankMathSeo(product);
}

function normalizeTextValue(value) {
  return decodeHtmlEntities(value || "")?.replace(/\s+/g, " ")?.trim() ?? "";
}

function normalizeFeaturedImage(media, fallbackAlt) {
  if (!media?.source_url) {
    return undefined;
  }

  return {
    id: media.id,
    url: media.source_url,
    alt: normalizeTextValue(media.alt_text || fallbackAlt || ""),
    width: media.media_details?.width,
    height: media.media_details?.height,
    mimeType: media.mime_type,
  };
}

function formatTourPrice(prices) {
  if (!prices?.price) {
    return undefined;
  }

  const amountMinor = Number(prices.price);

  if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
    return undefined;
  }

  const minorUnit = prices.currency_minor_unit ?? 2;
  const amountMajor = amountMinor / Math.pow(10, minorUnit);

  const formattedNumber = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit,
  }).format(amountMajor);

  return {
    amountMinor,
    formatted: `${formattedNumber} ${prices.currency_symbol}`,
    currencyCode: prices.currency_code,
    currencySymbol: prices.currency_symbol,
    vatLabel: "VAT Incl.",
  };
}

function normalizeGalleryImage(image) {
  return {
    id: image.id,
    url: image.src,
    thumbnailUrl: image.thumbnail || image.src,
    alt: normalizeTextValue(image.alt || image.name || ""),
    name: normalizeTextValue(image.name),
  };
}

function normalizeComparableUrl(value) {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);

    return `${url.origin}${url.pathname.replace(/\/?$/, "/")}`.toLowerCase();
  } catch {
    return undefined;
  }
}

function isReadMoreLabel(value) {
  return normalizeTextValue(value).toLowerCase() === "read more";
}

function isLuxuryRequestSlug(slug) {
  return slug?.startsWith("luxury-day-trip-") ?? false;
}

function normalizeBooking(product) {
  const addToCart = product?.add_to_cart;

  if (!addToCart?.url) {
    return undefined;
  }

  const decodedUrl = decodeHtmlEntities(addToCart.url);
  const comparableUrl = normalizeComparableUrl(decodedUrl);
  const comparablePermalink = normalizeComparableUrl(product?.permalink);

  if (!decodedUrl || !comparableUrl || comparableUrl === comparablePermalink) {
    return undefined;
  }

  const isFareHarbor = decodedUrl.includes("fareharbor.com");

  return {
    label: normalizeTextValue(addToCart.text || addToCart.single_text || "Book now"),
    url: decodedUrl,
    provider: isFareHarbor ? "fareharbor" : "woocommerce-external",
  };
}

function normalizeReviews(product) {
  return {
    averageRating: Number(product?.average_rating ?? 0),
    reviewCount: product?.review_count ?? 0,
  };
}

function buildCommerceSnapshot(productSlug, commerceProduct) {
  const price = formatTourPrice(commerceProduct?.prices);
  const booking = normalizeBooking(commerceProduct);
  const bookingLabel = normalizeTextValue(commerceProduct?.add_to_cart?.text);
  const hasValidPrice = Boolean(price);
  const hasValidBookingUrl = Boolean(booking?.url);
  const isFareHarbor = booking?.provider === "fareharbor";
  const isExplicitRequestOnly = isReadMoreLabel(bookingLabel) || isLuxuryRequestSlug(productSlug);
  const isBookable =
    !isExplicitRequestOnly && hasValidPrice && hasValidBookingUrl && isFareHarbor;

  return {
    price,
    booking,
    isBookable,
    isRequestOnly: !isBookable,
  };
}

function normalizeWordPressProduct(product, seoSource) {
  const uri = new URL(product.link).pathname;
  const featuredMedia = product._embedded?.["wp:featuredmedia"]?.[0];
  const title = normalizeTextValue(stripHtml(product.title.rendered));
  const excerptText = normalizeTextValue(stripHtml(product.excerpt.rendered));
  const seo = getPreferredSeo(seoSource) || {};

  return {
    id: product.id,
    sourceType: "product",
    slug: product.slug,
    uri,
    link: product.link,
    title,
    excerptHtml: product.excerpt.rendered,
    contentHtml: product.content.rendered,
    featuredImage: normalizeFeaturedImage(featuredMedia, title),
    seo: {
      title: pickFirstString(seo.title, title),
      description: pickFirstString(seo.description, excerptText) || undefined,
      canonical: pickFirstString(seo.canonical, product.link),
      robots: "index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large",
    },
  };
}

function normalizeTourPage(product, commerceProduct, seoSource) {
  const baseContent = normalizeWordPressProduct(product, seoSource);
  const commerce = buildCommerceSnapshot(product.slug, commerceProduct);

  const galleryImages =
    commerceProduct?.images?.map((image) => normalizeGalleryImage(image)) ?? [];

  const relatedProductsUrl = commerceProduct?._links?.related?.[0]?.href
    ? decodeHtmlEntities(commerceProduct._links.related[0].href)
    : undefined;

  return {
    ...baseContent,
    updatedAt: seoSource?.modified,
    commerce: {
      type: commerceProduct?.type ?? product.type,
      price: commerce.price,
      booking: commerce.booking,
      reviews: normalizeReviews(commerceProduct),
      galleryImages,
      relatedProductsUrl,
      isInStock: commerceProduct?.is_in_stock ?? true,
      isPurchasable: commerceProduct?.is_purchasable ?? false,
      isBookable: commerce.isBookable,
      isRequestOnly: commerce.isRequestOnly,
    },
  };
}

async function fetchWithTimeout(url, init = {}) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function fetchJson(url) {
  const response = await fetchWithTimeout(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response;
}

async function readExistingManifest(manifestPath) {
  try {
    await access(manifestPath);
    const fileContents = await readFile(manifestPath, "utf8");

    return JSON.parse(fileContents);
  } catch {
    return null;
  }
}

async function getAllProducts() {
  const products = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const params = new URLSearchParams({
      per_page: "100",
      page: String(page),
      _fields:
        "slug,link,modified,title,content,excerpt,featured_media,_embedded,next_seo,yoast_head_json,rank_math",
    });
    const response = await fetchJson(`${WORDPRESS_REST_BASE_URL}/product?${params.toString()}`);
    const pageItems = await response.json();

    products.push(...pageItems);
    totalPages = Number(response.headers.get("x-wp-totalpages") ?? "1");
    page += 1;
  }

  return products;
}

function buildSeoEntry(product, tourEntry) {
  const title = pickFirstString(
    tourEntry?.seo?.title,
    stripHtml(product.title?.rendered ?? ""),
  );
  const description = pickFirstString(
    tourEntry?.seo?.description,
    stripHtml(product.excerpt?.rendered ?? ""),
  );

  return {
    slug: product.slug,
    uri: new URL(product.link).pathname,
    link: product.link,
    title,
    description,
    canonical: pickFirstString(tourEntry?.seo?.canonical, product.link),
    openGraphTitle: pickFirstString(tourEntry?.seo?.title, title),
    openGraphDescription: pickFirstString(tourEntry?.seo?.description, description),
    updatedAt: product.modified,
  };
}

function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function fetchTourEntry(product, existingTourEntry) {
  try {
    const wooUrl = `${WORDPRESS_SITE_URL}/wp-json/wc/store/products?${new URLSearchParams({ slug: product.slug }).toString()}`;

    const wooResponse = await fetchWithTimeout(wooUrl, { headers: { Accept: "application/json" } });

    if (!wooResponse.ok) {
      throw new Error(`WooCommerce detail failed: ${wooResponse.status} ${wooResponse.statusText}`);
    }

    const wooProducts = await wooResponse.json();
    const commerceProduct = wooProducts[0];

    return normalizeTourPage(product, commerceProduct, product);
  } catch (error) {
    if (existingTourEntry) {
      console.warn(`Tour manifest fallback for ${product.slug}`, error);
      return existingTourEntry;
    }

    console.warn(`Skipping tour manifest entry for ${product.slug}`, error);
    return undefined;
  }
}

async function main() {
  const existingSeoManifest = await readExistingManifest(SEO_MANIFEST_PATH);
  const existingTourManifest = await readExistingManifest(TOUR_MANIFEST_PATH);

  let products;

  try {
    products = await getAllProducts();
  } catch (error) {
    if (existingSeoManifest && existingTourManifest) {
      console.warn(
        `WordPress fetch failed, reusing existing manifests at ${SEO_MANIFEST_PATH} and ${TOUR_MANIFEST_PATH}`,
        error,
      );
      return;
    }

    throw error;
  }

  console.log(`Fetched ${products.length} WordPress products for manifest generation`);

  const seoEntries = {};
  const tourEntries = {};
  const productChunks = chunkArray(products, CONCURRENCY);

  for (const chunk of productChunks) {
    const tourResults = await Promise.all(
      chunk.map((product) =>
        fetchTourEntry(product, existingTourManifest?.entries?.[product.slug]),
      ),
    );

    for (let index = 0; index < chunk.length; index += 1) {
      const product = chunk[index];
      const tourEntry = tourResults[index];

      if (!tourEntry) {
        continue;
      }

      tourEntries[tourEntry.slug] = tourEntry;
      seoEntries[product.slug] = buildSeoEntry(product, tourEntry);
    }
  }

  const seoManifest = {
    generatedAt: new Date().toISOString(),
    source: WORDPRESS_SITE_URL,
    entries: seoEntries,
  };

  const tourManifest = {
    generatedAt: new Date().toISOString(),
    source: WORDPRESS_SITE_URL,
    entries: tourEntries,
  };

  await mkdir(path.dirname(SEO_MANIFEST_PATH), { recursive: true });
  await writeFile(SEO_MANIFEST_PATH, `${JSON.stringify(seoManifest, null, 2)}\n`, "utf8");
  await writeFile(TOUR_MANIFEST_PATH, `${JSON.stringify(tourManifest, null, 2)}\n`, "utf8");

  console.log(`Generated SEO manifest with ${Object.keys(seoEntries).length} entries at ${SEO_MANIFEST_PATH}`);
  console.log(`Generated tour payload manifest with ${Object.keys(tourEntries).length} entries at ${TOUR_MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error("Failed to generate manifests", error);
  process.exitCode = 1;
});