/**
 * Manual translation overlay for a WordPress tour page.
 *
 * Only content fields are translated. Commerce data (price, gallery,
 * booking URL, reviews) always comes from WooCommerce and must never
 * be overridden here.
 *
 * Keys in each locale file must match the English WordPress slug
 * (e.g. "seville-alcazar-guided-tour").
 */
export type TourTranslation = {
  title: string;
  excerptHtml: string;
  contentHtml: string;
  seo?: {
    title?: string;
    description?: string;
  };
};
