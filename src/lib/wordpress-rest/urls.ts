export const WORDPRESS_SITE_URL =
  process.env.WORDPRESS_SITE_URL ?? "https://sevilletoursco.com";

export const NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sevilletoursco.com";

export const WORDPRESS_REST_BASE_URL =
  process.env.WORDPRESS_REST_BASE_URL ??
  `${WORDPRESS_SITE_URL}/wp-json/wp/v2`;

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "34600774354";

export function normalizeUri(uri: string): string {
  if (!uri || uri === "/") {
    return "/";
  }

  const withoutQuery = uri.split("?")[0] ?? uri;
  const withLeadingSlash = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

export function uriToSlug(uri: string): string {
  const normalizedUri = normalizeUri(uri);

  if (normalizedUri === "/") {
    return "";
  }

  const parts = normalizedUri
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .split("/");

  return parts[parts.length - 1] ?? "";
}

export function buildCanonicalUrl(uri: string): string {
  const normalizedUri = normalizeUri(uri);

  if (normalizedUri === "/") {
    return `${NEXT_PUBLIC_SITE_URL}/`;
  }

  return `${NEXT_PUBLIC_SITE_URL}${normalizedUri}`;
}

type ContactInquiryInput =
  | string
  | {
      tour?: string;
      interest?: string;
      type?: string;
      amount?: string | number;
      experience?: string;
      duration?: string;
      places?: string[];
      interests?: string[];
      name?: string;
      contact?: string;
      message?: string;
    };

export function buildWhatsAppUrl(message?: string): string {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

  if (!message?.trim()) {
    return baseUrl;
  }

  const params = new URLSearchParams({
    text: message.trim(),
  });

  return `${baseUrl}?${params.toString()}`;
}

export function buildContactInquiryUrl(input?: ContactInquiryInput): string {
  if (!input) {
    return "/contact-seville-tours-co/";
  }

  if (typeof input === "string") {
    const params = new URLSearchParams({
      tour: input,
    });

    return `/contact-seville-tours-co/?${params.toString()}`;
  }

  const params = new URLSearchParams();

  if (input.tour) {
    params.set("tour", input.tour);
  }

  if (input.interest) {
    params.set("interest", input.interest);
  }

  if (input.type) {
    params.set("type", input.type);
  }

  if (input.amount !== undefined) {
    params.set("amount", String(input.amount));
  }

  if (input.experience) {
    params.set("experience", input.experience);
  }

  if (input.duration) {
    params.set("duration", input.duration);
  }

  if (input.places?.length) {
    params.set("places", input.places.join(","));
  }

  if (input.interests?.length) {
    params.set("interests", input.interests.join(","));
  }

  if (input.name) {
    params.set("name", input.name);
  }

  if (input.contact) {
    params.set("contact", input.contact);
  }

  if (input.message) {
    params.set("message", input.message);
  }

  if (!params.size) {
    return "/contact-seville-tours-co/";
  }

  return `/contact-seville-tours-co/?${params.toString()}`;
}

export function buildWordPressProductUrl(slug: string): string {
  const params = new URLSearchParams({
    slug,
    _embed: "1",
    _fields: "id,slug,link,type,title,content,excerpt,featured_media,_embedded",
  });

  return `${WORDPRESS_REST_BASE_URL}/product?${params.toString()}`;
}

export function buildWooCommerceStoreProductUrl(slug: string): string {
  const params = new URLSearchParams({
    slug,
  });

  return `${WORDPRESS_SITE_URL}/wp-json/wc/store/products?${params.toString()}`;
}

