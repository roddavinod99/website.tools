/**
 * Centralized JSON-LD helpers for the /tools, /categories, /popular, and /new
 * listing pages. All emitted script bodies go through {@link jsonLdScriptBody}
 * so that `<` is escaped to `\u003c` consistently (per the official Next.js
 * JSON-LD guide: https://nextjs.org/docs/app/guides/json-ld ).
 */

const JSON_LD_CONTEXT = "https://schema.org" as const;

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
 * Serialize a JSON-LD node for safe injection via `dangerouslySetInnerHTML`.
 * Escapes `<` to `\u003c` per the official Next.js JSON-LD guide.
 */
export function jsonLdScriptBody(node: object): string {
  return JSON.stringify(node).replace(/</g, "\\u003c");
}
