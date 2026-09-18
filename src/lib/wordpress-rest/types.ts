export type WordPressRenderedField = {
  rendered: string;
};

export type WordPressFeaturedMedia = {
  id: number;
  source_url: string;
  alt_text?: string;
  media_type?: string;
  mime_type?: string;
  media_details?: {
    width?: number;
    height?: number;
  };
};

export type WordPressEmbedded = {
  "wp:featuredmedia"?: WordPressFeaturedMedia[];
};

export type WordPressProduct = {
  id: number;
  slug: string;
  link: string;
  type: "product";
  status: "publish" | string;
  title: WordPressRenderedField;
  content: WordPressRenderedField;
  excerpt: WordPressRenderedField;
  featured_media: number;
  product_cat?: number[];
  product_tag?: number[];
  product_brand?: number[];
  meta?: Record<string, unknown>;
  acf?: Record<string, unknown> | false | null;
  _embedded?: WordPressEmbedded;
};

export type WooCommerceStorePrices = {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range?: unknown;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
};

export type WooCommerceStoreImage = {
  id: number;
  src: string;
  thumbnail: string;
  srcset?: string;
  sizes?: string;
  name?: string;
  alt?: string;
};

export type WooCommerceAddToCart = {
  text: string;
  description: string;
  url: string;
  single_text: string;
  minimum: number;
  maximum: number;
  multiple_of: number;
};

export type WooCommerceStoreProduct = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  type: "simple" | "external" | "variable" | "grouped" | string;
  variation: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WooCommerceStorePrices;
  price_html: string;
  average_rating: string;
  review_count: number;
  images: WooCommerceStoreImage[];
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    link?: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
    link?: string;
  }>;
  brands?: Array<{
    id: number;
    name: string;
    slug: string;
    link?: string;
  }>;
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  add_to_cart?: WooCommerceAddToCart;
  _links?: {
    related?: Array<{
      href: string;
      embeddable?: boolean;
    }>;
  };
};

export type WordPressRestImage = {
  id: number;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  mimeType?: string;
};

export type TourGalleryImage = {
  id: number;
  url: string;
  thumbnailUrl: string;
  alt: string;
  name?: string;
};

export type TourPrice = {
  amountMinor: number;
  formatted: string;
  currencyCode: string;
  currencySymbol: string;
  vatLabel: string;
};

export type TourBooking = {
  label: string;
  url?: string;
  provider: "fareharbor" | "woocommerce-external" | "request" | "unknown";
};

export type TourReviews = {
  averageRating: number;
  reviewCount: number;
};

export type WordPressRestSeo = {
  title: string;
  description?: string;
  canonical: string;
  robots?: string;
};

export type WordPressRestContent = {
  id: number;
  sourceType: "product" | "page" | "post";
  slug: string;
  uri: string;
  link: string;
  title: string;
  excerptHtml: string;
  contentHtml: string;
  featuredImage?: WordPressRestImage;
  seo: WordPressRestSeo;
  updatedAt?: string;
};

export type TourPage = WordPressRestContent & {
  commerce?: {
    type: string;
    price?: TourPrice;
    booking?: TourBooking;
    reviews: TourReviews;
    galleryImages: TourGalleryImage[];
    relatedProductsUrl?: string;
    isInStock: boolean;
    isPurchasable: boolean;
    isBookable: boolean;
    isRequestOnly: boolean;
  };
};

export type RelatedTourCard = {
  id: number;
  slug: string;
  title: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  price?: TourPrice;
  isBookable: boolean;
  isRequestOnly: boolean;
};