import type {
  RelatedTourCard,
  TourBooking,
  TourGalleryImage,
  TourPage,
  TourPrice,
  TourReviews,
  WooCommerceStoreImage,
  WooCommerceStorePrices,
  WooCommerceStoreProduct,
  WordPressFeaturedMedia,
  WordPressProduct,
  WordPressRestContent,
  WordPressRestImage,
} from "./types";
import { buildCanonicalUrl, normalizeUri } from "./urls";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function decodeHtmlEntities(value?: string): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeTextValue(value?: string): string {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

function normalizeFeaturedImage(
  media?: WordPressFeaturedMedia,
  fallbackAlt?: string,
): WordPressRestImage | undefined {
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

function formatTourPrice(prices?: WooCommerceStorePrices): TourPrice | undefined {
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

function normalizeGalleryImage(image: WooCommerceStoreImage): TourGalleryImage {
  return {
    id: image.id,
    url: image.src,
    thumbnailUrl: image.thumbnail || image.src,
    alt: normalizeTextValue(image.alt || image.name || ""),
    name: normalizeTextValue(image.name),
  };
}

function normalizeComparableUrl(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);

    return `${url.origin}${normalizeUri(url.pathname)}`.toLowerCase();
  } catch {
    return undefined;
  }
}

function isReadMoreLabel(value?: string): boolean {
  return normalizeTextValue(value).toLowerCase() === "read more";
}

function isLuxuryRequestSlug(slug?: string): boolean {
  return slug?.startsWith("luxury-day-trip-") ?? false;
}

type CommerceSnapshot = {
  price?: TourPrice;
  booking?: TourBooking;
  isBookable: boolean;
  isRequestOnly: boolean;
};

function normalizeBooking(
  product?: WooCommerceStoreProduct,
): TourBooking | undefined {
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

function normalizeReviews(product?: WooCommerceStoreProduct): TourReviews {
  return {
    averageRating: Number(product?.average_rating ?? 0),
    reviewCount: product?.review_count ?? 0,
  };
}

function buildCommerceSnapshot(
  productSlug: string,
  commerceProduct?: WooCommerceStoreProduct,
): CommerceSnapshot {
  const price = formatTourPrice(commerceProduct?.prices);
  const booking = normalizeBooking(commerceProduct);
  const bookingLabel = normalizeTextValue(commerceProduct?.add_to_cart?.text);
  const hasValidPrice = Boolean(price);
  const hasValidBookingUrl = Boolean(booking?.url);
  const isFareHarbor = booking?.provider === "fareharbor";
  const isExplicitRequestOnly =
    isReadMoreLabel(bookingLabel) || isLuxuryRequestSlug(productSlug);
  const isBookable =
    !isExplicitRequestOnly && hasValidPrice && hasValidBookingUrl && isFareHarbor;

  return {
    price,
    booking,
    isBookable,
    isRequestOnly: !isBookable,
  };
}

export function normalizeRelatedTourCard(
  product: WooCommerceStoreProduct,
): RelatedTourCard | undefined {
  if (!product.slug) {
    return undefined;
  }

  const commerce = buildCommerceSnapshot(product.slug, product);
  const primaryImage = product.images?.[0];

  return {
    id: product.id,
    slug: product.slug,
    title: normalizeTextValue(product.name),
    href: `/tours/${product.slug}`,
    imageUrl: primaryImage?.src,
    imageAlt: normalizeTextValue(
      primaryImage?.alt || primaryImage?.name || product.name,
    ),
    price: commerce.isBookable ? commerce.price : undefined,
    isBookable: commerce.isBookable,
    isRequestOnly: commerce.isRequestOnly,
  };
}

export function normalizeWordPressProduct(
  product: WordPressProduct,
): WordPressRestContent {
  const uri = normalizeUri(new URL(product.link).pathname);
  const featuredMedia = product._embedded?.["wp:featuredmedia"]?.[0];
  const title = normalizeTextValue(stripHtml(product.title.rendered));
  const excerptText = normalizeTextValue(stripHtml(product.excerpt.rendered));

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
      title,
      description: excerptText || undefined,
      canonical: buildCanonicalUrl(uri),
      robots:
        "index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large",
    },
  };
}

export function normalizeTourPage(
  product: WordPressProduct,
  commerceProduct?: WooCommerceStoreProduct,
): TourPage {
  const baseContent = normalizeWordPressProduct(product);
  const commerce = buildCommerceSnapshot(product.slug, commerceProduct);

  const galleryImages =
    commerceProduct?.images?.map((image) => normalizeGalleryImage(image)) ?? [];

  const relatedProductsUrl = commerceProduct?._links?.related?.[0]?.href
    ? decodeHtmlEntities(commerceProduct._links.related[0].href)
    : undefined;

  return {
    ...baseContent,
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