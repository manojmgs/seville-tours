import Link from "next/link";
import Image from "next/image";
import { getRelatedProductsByUrl } from "@/lib/wordpress-rest/client";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type RelatedProductsSectionProps = {
  relatedProductsUrl?: string;
  currentSlug: string;
  locale?: Locale;
};

export async function RelatedProductsSection({
  relatedProductsUrl,
  currentSlug,
  locale = "en",
}: RelatedProductsSectionProps) {
  if (!relatedProductsUrl) {
    return null;
  }

  const copy = siteCopy(locale);
  const relatedProducts = (await getRelatedProductsByUrl(relatedProductsUrl))
    .filter((product) => product.slug !== currentSlug)
    .slice(0, 3);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-stone-950">
        {copy.wordpress.interestedIn}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {relatedProducts.map((product) => (
          <Link
            key={product.slug}
            href={product.href}
            className="card-glow overflow-hidden rounded-[calc(var(--radius-card)+0.15rem)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] transition hover:-translate-y-0.5"
          >
            {product.imageUrl ? (
              <div className="relative h-48 w-full overflow-hidden bg-stone-200">
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt || product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="h-48 bg-[linear-gradient(145deg,var(--brand-green-900),var(--brand-green-500))]" />
            )}

            <div className="p-5">
              <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                {product.title}
              </h3>

              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                {product.isBookable && product.price
                  ? `${product.price.formatted} ${product.price.vatLabel}`
                  : "Custom proposal"}
              </p>

              <span className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-green-700)]">
                {copy.wordpress.viewTour}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}