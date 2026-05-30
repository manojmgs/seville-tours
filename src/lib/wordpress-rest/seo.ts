export type ExtractedSeoMetadata = {
  title?: string;
  description?: string;
  canonical?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
};

function getRegexGroupValue(html: string, pattern: RegExp): string | undefined {
  const match = html.match(pattern);
  const value = match?.[1]?.trim();

  return value || undefined;
}

function getTagAttribute(tag: string | undefined, attributeName: string): string | undefined {
  if (!tag) {
    return undefined;
  }

  const pattern = new RegExp(`${attributeName}\\s*=\\s*["']([^"']*)["']`, "i");
  const match = tag.match(pattern);
  const value = match?.[1]?.trim();

  return value || undefined;
}

function decodeHtmlEntities(value?: string): string | undefined {
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

function findMetaTag(html: string, nameOrProperty: string, value: string): string | undefined {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];

  return tags.find((tag) => {
    const actualValue = getTagAttribute(tag, nameOrProperty);
    return actualValue?.toLowerCase() === value.toLowerCase();
  });
}

function findLinkTag(html: string, relValue: string): string | undefined {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];

  return tags.find((tag) => {
    const actualValue = getTagAttribute(tag, "rel");
    return actualValue?.toLowerCase() === relValue.toLowerCase();
  });
}

export function extractSeoMetadataFromHtml(
  html: string,
): ExtractedSeoMetadata {
  const title = getRegexGroupValue(
    html,
    /<title>([\s\S]*?)<\/title>/i,
  );

  const descriptionTag = findMetaTag(html, "name", "description");
  const canonicalTag = findLinkTag(html, "canonical");
  const openGraphTitleTag = findMetaTag(html, "property", "og:title");
  const openGraphDescriptionTag = findMetaTag(html, "property", "og:description");

  const description = getTagAttribute(descriptionTag, "content");
  const canonical = getTagAttribute(canonicalTag, "href");
  const openGraphTitle = getTagAttribute(openGraphTitleTag, "content");
  const openGraphDescription = getTagAttribute(openGraphDescriptionTag, "content");

  return {
    title: decodeHtmlEntities(title),
    description: decodeHtmlEntities(description),
    canonical: decodeHtmlEntities(canonical),
    openGraphTitle: decodeHtmlEntities(openGraphTitle),
    openGraphDescription: decodeHtmlEntities(openGraphDescription),
  };
}

export async function getSeoMetadataByUrl(
  url: string,
): Promise<ExtractedSeoMetadata | undefined> {
  void url;
  return undefined;
}