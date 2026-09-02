/**
 * Centralized JSON-LD helpers for the /tools, /categories, /popular, /new,
 * and /convert/* listing and landing pages. All emitted script bodies go
 * through {@link jsonLdScriptBody} so that `<` is escaped to `\u003c`
 * consistently (per the official Next.js JSON-LD guide:
 * https://nextjs.org/docs/app/guides/json-ld ).
 */

const JSON_LD_CONTEXT = "https://schema.org" as const;
const ORGANIZATION_ID_SUFFIX = "#organization" as const;

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": JSON_LD_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export interface CollectionItem {
  name: string;
  url: string;
  description?: string;
}

export interface CollectionPageInput {
  name: string;
  description: string;
  url: string;
  items: CollectionItem[];
}

export function collectionPage({ name, description, url, items }: CollectionPageInput) {
  return {
    "@context": JSON_LD_CONTEXT,
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: itemList({ name, description, url, items }),
  };
}

export interface ItemListInput {
  name: string;
  description: string;
  url: string;
  items: CollectionItem[];
}

export function itemList({ name, description, url, items }: ItemListInput) {
  return {
    "@context": JSON_LD_CONTEXT,
    "@type": "ItemList",
    name,
    description,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

/**
 * WebApplication schema for landing pages that wrap an interactive tool.
 * Distinct from SoftwareApplication (used for the canonical /tools/<slug>
 * pages) because landing pages are long-tail entry points with richer
 * per-page metadata (feature list, optional screenshot, optional browser
 * requirements).
 *
 * Per AGENTS.md: the publisher references the global Organization @id
 * rather than redeclaring it.
 */
export interface WebApplicationInput {
  name: string;
  description: string;
  url: string;
  /** Application category, e.g. "DeveloperApplication" | "UtilitiesApplication" | "HealthApplication" */
  applicationCategory: string;
  /** Optional list of human-readable feature names */
  featureList?: string[];
  /** Absolute URL to a screenshot, when present */
  screenshotUrl?: string;
  /** Absolute site URL (no trailing slash), used to build the Organization @id */
  siteUrl: string;
  /** Absolute URL of the Organization JSON-LD @id, defaults to `<siteUrl>/#organization` */
  organizationId?: string;
  /** "WebApplication" is the default; pass "SoftwareApplication" for desktop / package-shaped tools */
  type?: "WebApplication" | "SoftwareApplication";
}

export function webApplicationJsonLd(input: WebApplicationInput) {
  const orgId = input.organizationId ?? `${input.siteUrl.replace(/\/+$/, "")}/${ORGANIZATION_ID_SUFFIX}`;
  return {
    "@context": JSON_LD_CONTEXT,
    "@type": input.type ?? "WebApplication",
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: input.applicationCategory,
    operatingSystem: "Any Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    ...(input.featureList && input.featureList.length > 0 ? { featureList: input.featureList } : {}),
    ...(input.screenshotUrl ? { screenshot: input.screenshotUrl } : {}),
    publisher: {
      "@id": orgId,
      name: "DevStackIO",
      url: input.siteUrl,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

/**
 * FAQPage schema. Used by both /tools/<slug> pages (when the tool's
 * ToolContent has a FAQ) and /convert/<category>/<slug> landing pages
 * (when the LandingPage has FAQ items). Accepts plain-text answers;
 * the emitted node is safe to inline in the document body.
 */
export interface FaqInput {
  question: string;
  answer: string;
}

export function faqPageJsonLd(faqs: FaqInput[]) {
  return {
    "@context": JSON_LD_CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Serialize a JSON-LD node for safe injection via `dangerouslySetInnerHTML`.
 * Escapes `<` to `\u003c` per the official Next.js JSON-LD guide.
 */
export function jsonLdScriptBody(node: object): string {
  return JSON.stringify(node).replace(/</g, "\\u003c");
}
