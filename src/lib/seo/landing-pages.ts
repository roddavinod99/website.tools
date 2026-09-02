/**
 * Landing-page engine for long-tail conversion / compute / learn pages.
 *
 * The engine is the single source of truth for every `/convert/<category>/<slug>`
 * URL the site emits. Each entry is a typed descriptor that:
 *   - Pins the canonical tool (must exist in src/lib/data/tools.ts)
 *   - Defines the URL path and SEO metadata
 *   - Carries prefill values that the catch-all route forwards to the tool
 *   - Optionally bundles a conversion table, formula, see-also cross-links,
 *     and FAQ items for the static body
 *
 * The Next.js catch-all route at `src/app/convert/[category]/[...slug]/page.tsx`
 * calls `getLandingPage(category, slug)` during SSG to resolve an entry, then
 * renders the tool plus the body content. The sitemap at
 * `src/app/sitemap-conversions.xml/route.ts` walks `landingPages` to emit
 * every entry as a <url> in `sitemap-conversions.xml`.
 *
 * The registry is intentionally append-only. New pages are added by pushing
 * entries into `landingPages`; the engine handles routing, JSON-LD, and
 * sitemap emission without further wiring.
 */

import { allTools } from "@/lib/data/tools";
import type { Tool } from "@/types";

export type LandingPageIntent = "compute" | "convert" | "learn" | "define";

export interface ConversionTableRow {
  /** Optional label like "Freezing point of water" or "Body temperature" */
  label?: string;
  /** The "from" value as a string, e.g. "0" or "1" or "32" */
  from: string;
  /** The "to" value as a string, e.g. "-17.78" or "0.0328" or "0" */
  to: string;
}

export interface LandingPageContent {
  /** 1-3 sentence intro shown above the tool */
  intro?: string;
  /** Formula section, plain text or short markdown */
  formula?: string;
  /** Worked example, plain text or short markdown */
  example?: string;
  /** 5-15 rows of pre-computed conversion values for the static table */
  table?: ConversionTableRow[];
  /** Slugs of other landing pages to cross-link under "See also" */
  seeAlso?: string[];
}

export interface FaqItem {
  question: string;
  /** Plain-text answer (no HTML) */
  answer: string;
}

export interface LandingPage {
  /** Canonical tool slug, must exist in src/lib/data/tools.ts */
  canonicalSlug: string;
  /** URL category segment: "length" | "temperature" | "health" | "age" | etc. */
  category: string;
  /** Final URL slug segment: "cm-to-feet" | "100-c-to-f" | "180cm-75kg" */
  slug: string;
  /** Page intent; influences metadata and JSON-LD node type */
  intent: LandingPageIntent;
  /** Title (≤ 60 chars for SEO) */
  title: string;
  /** Meta description (≤ 160 chars for SEO) */
  description: string;
  /** Prefill values forwarded to the canonical tool's input fields */
  prefill: Record<string, string>;
  /** Optional body content blocks */
  content?: LandingPageContent;
  /** FAQ items for FAQPage JSON-LD and an on-page accordion */
  faq?: FaqItem[];
  /** When true, the page is excluded from search engines via robots meta */
  noindex?: boolean;
}

/**
 * Canonical landing-page registry. PR 1 ships with a small set of
 * placeholder entries that exercise the engine end-to-end. The next 6
 * PRs (PR 2-7) append the long-tail URL explosion.
 *
 * Append-only contract: do not edit existing entries in-place. If a
 * landing page needs to change its title or prefill, mark the old
 * entry as `noindex: true` and add a new entry. This keeps old
 * indexable URLs stable.
 */
export const landingPages: LandingPage[] = [
  // Smoke-test entry: validates the catch-all route + JSON-LD emission
  // end-to-end. The `unit-converter` tool exists, the category + slug
  // resolve, and the page renders at /convert/example/placeholder.
  // Marked noindex so it doesn't pollute the index in production.
  {
    canonicalSlug: "unit-converter",
    category: "example",
    slug: "placeholder",
    intent: "convert",
    title: "Example Landing Page (placeholder)",
    description: "Placeholder landing page used to validate the engine. Not indexed.",
    prefill: { value: "1", fromUnit: "meter", toUnit: "foot" },
    noindex: true,
  },
];

/**
 * Resolves a landing page by URL components. Returns undefined when no
 * entry matches, so the catch-all route can call notFound().
 */
export function getLandingPage(category: string, slug: string): LandingPage | undefined {
  return landingPages.find((p) => p.category === category && p.slug === slug);
}

/**
 * Lists every URL the engine should emit, in the shape Next.js wants
 * for `generateStaticParams`. Used by the catch-all route AND the
 * `sitemap-conversions.xml` route handler.
 *
 * Note: this returns ALL pages including `noindex` ones. The catch-all
 * route renders every page (so dev/CI can verify wiring); the sitemap
 * separately filters noindex pages out via {@link listIndexableLandingPages}.
 */
export function listLandingPageParams(): { category: string; slug: string }[] {
  return landingPages.map((p) => ({ category: p.category, slug: p.slug }));
}

/**
 * Lists only pages that should appear in the conversion sitemap. Used
 * by `sitemap-conversions.xml` to skip pages marked noindex.
 */
export function listIndexableLandingPages(): LandingPage[] {
  return landingPages.filter((p) => !p.noindex);
}

/**
 * Resolves the canonical Tool for a landing page. Returns undefined
 * when the canonical tool is missing from the registry — the catch-all
 * route should treat this as a content error and notFound().
 */
export function getCanonicalTool(page: LandingPage): Tool | undefined {
  return allTools.find((t) => t.slug === page.canonicalSlug);
}

/**
 * Build the absolute canonical URL for a landing page. The conversion
 * sitemap and JSON-LD both consume this.
 */
export function landingPageUrl(page: LandingPage, siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}/convert/${page.category}/${page.slug}`;
}

/**
 * Counts landing pages by category, for the conversion hubs.
 * Returns an array sorted by count descending, suitable for rendering
 * a "Categories" list.
 */
export function landingPageCountsByCategory(): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of listIndexableLandingPages()) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
