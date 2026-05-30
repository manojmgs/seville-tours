# WordPress Client Layer — Phase 0

## Goal
Render the existing WordPress site through Next.js while preserving SEO signals 1:1.

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

## Validation
Use:

```text
docs/SEO_VALIDATION_CHECKLIST.md
docs/URL_MAPPING.xlsx
```

before launch.
