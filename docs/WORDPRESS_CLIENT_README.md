# WordPress Client Layer — Phase 0

## Goal
Render the existing WordPress site through Next.js while preserving SEO signals 1:1.

## Current Next.js flow

```text
WordPress REST API
	-> build-time SEO manifest (`pnpm seo:manifest`)
	-> public/generated/wordpress-seo-manifest.json
	-> Next.js route metadata + static params
```

The Next.js app no longer scrapes WordPress HTML at request time for SEO enrichment. If exact SEO plugin values are needed, expose them through REST and let the build manifest consume those fields.

## Required WordPress plugins
- WPGraphQL
- WPGraphQL for Yoast SEO / Rank Math equivalent, depending on current SEO plugin setup
- WPGraphQL for ACF if existing content uses ACF fields

## Environment variables
Create `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://sevilletoursco.com
WORDPRESS_GRAPHQL_ENDPOINT=https://sevilletoursco.com/graphql
```

Optional if WordPress lives on a different origin or custom REST namespace:

```bash
WORDPRESS_SITE_URL=https://sevilletoursco.com
WORDPRESS_REST_BASE_URL=https://sevilletoursco.com/wp-json/wp/v2
```

## Files included

```text
lib/wordpress/types.ts
lib/wordpress/queries.ts
lib/wordpress/client.ts
lib/wordpress/seo.ts
components/wordpress/WordPressContent.tsx
app/(wordpress)/page.tsx
app/(wordpress)/[...slug]/page.tsx
app/sitemap.ts
app/robots.ts
next.config.ts
.env.example
docs/WORDPRESS_CLIENT_README.md
```

## Phase 0 SEO rules
- Do not change URLs.
- Do not rewrite title tags.
- Do not rewrite meta descriptions.
- Do not change canonical strategy.
- Do not rewrite Tier 1 page content.

Allowed safe improvements:
- one H1 per page,
- optimized images,
- non-blocking scripts,
- mobile-first premium UI.

## WordPress REST SEO field

The build manifest will prefer a normalized `next_seo` REST field when it exists. That lets Next.js consume exact canonical/title/description values from Yoast or Rank Math without parsing HTML.

Add this as a small WordPress mu-plugin or theme bootstrap snippet:

```php
<?php
/**
 * Plugin Name: Seville Tours Next SEO REST Field
 */

add_action('rest_api_init', function (): void {
	register_rest_field('product', 'next_seo', [
		'get_callback' => function (array $postArr): array {
			$postId = (int) ($postArr['id'] ?? 0);

			if ($postId <= 0) {
				return [];
			}

			$yoastJson = function_exists('get_post_meta')
				? get_post_meta($postId, '_yoast_wpseo_opengraph-title', true)
				: null;

			$yoastTitle = function_exists('get_post_meta')
				? get_post_meta($postId, '_yoast_wpseo_title', true)
				: null;

			$yoastDescription = function_exists('get_post_meta')
				? get_post_meta($postId, '_yoast_wpseo_metadesc', true)
				: null;

			$rankMathTitle = function_exists('get_post_meta')
				? get_post_meta($postId, 'rank_math_title', true)
				: null;

			$rankMathDescription = function_exists('get_post_meta')
				? get_post_meta($postId, 'rank_math_description', true)
				: null;

			$canonical = function_exists('wp_get_canonical_url')
				? wp_get_canonical_url($postId)
				: get_permalink($postId);

			$title = $yoastTitle ?: $rankMathTitle ?: get_the_title($postId);
			$description = $yoastDescription ?: $rankMathDescription;

			return [
				'title' => $title ?: null,
				'description' => $description ?: null,
				'canonical' => $canonical ?: null,
				'openGraphTitle' => $yoastJson ?: $title ?: null,
				'openGraphDescription' => $description ?: null,
			];
		},
		'schema' => [
			'description' => 'Normalized SEO metadata for Next.js build-time manifest generation.',
			'type' => 'object',
			'context' => ['view'],
		],
	]);
});
```

After enabling that field, verify this works:

```bash
curl "https://sevilletoursco.com/wp-json/wp/v2/product?slug=seville-alcazar-guided-tour&_fields=slug,next_seo"
```

The manifest generator already prefers `next_seo`, then `yoast_head_json`, then `rank_math`, and only then falls back to REST `title` and `excerpt`.

## Static prerender policy

`generateStaticParams()` now sources slugs from the generated manifest. The two slowest slugs are excluded from prerender by default to protect build time:

- `tour-barrio-santacruz`
- `tour-juego-tronos-sevilla`

That exclusion is controlled in `src/lib/wordpress-rest/cache.ts`.

## Validation
Use:

```text
docs/SEO_VALIDATION_CHECKLIST.md
docs/URL_MAPPING.xlsx
```

before launch.
