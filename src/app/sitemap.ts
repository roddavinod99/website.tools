/**
 * Sitemap — https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * and https://www.sitemaps.org/protocol.html
 *
 * Next.js MetadataRoute.Sitemap generates /sitemap.xml at build + ISR.
 * Spec: <urlset> with <url><loc>absolute URL</loc><lastmod>W3C datetime</lastmod></url>
 * Google ignores <priority>/<changefreq> (see comment below); only <loc> +
 * <lastmod> are used per https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
 * lastmod is derived from git commit dates via TOOL_LASTMOD (scripts/prebuild.mjs)
 * per AGENTS.md "lastmod from git commit date or content hash — REQUIRED".
 */
import type { MetadataRoute } from "next";
import { allTools, categories, siteConfig, guidesTopics } from "@/lib/data";
import { toolkits } from "@/lib/toolkits";
import { blogPosts as blogData } from "@/lib/blog";
import { comparisons } from "@/lib/data/comparisons";
import { TOOL_LASTMOD } from "@/lib/seo/__generated__/tool-lastmod";
import { listIndexableLandingPages, landingPageUrl, landingPageCountsByCategory } from "@/lib/seo/landing-pages";

// ISR: regenerate daily (86400s) per sitemaps.org freshness best practice
export const revalidate = 86400;

const BASE = siteConfig.url.replace(/\/+$/, "");
const LEGAL = siteConfig.legal?.lastUpdated ?? {};

// Google ignores <priority> and <changefreq>; only <loc> and <lastmod> are used.
function dateFrom(str: string | undefined): Date | undefined {
  if (!str) return;
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function entry(url: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  return lastModified ? { url, lastModified } : { url };
}

const latestBlogDate = dateFrom(blogData[0]?.dateISO);
const legalPrivacy = dateFrom(LEGAL.privacy);
const legalTerms = dateFrom(LEGAL.terms);
const legalCookie = dateFrom(LEGAL.cookie);
const legalDisclaimer = dateFrom(LEGAL.disclaimer);
const legalSecurity = dateFrom(LEGAL.security);
const legalAccessibility = dateFrom(LEGAL.accessibility);

// Fallback lastmod for listing/category pages: derive from most recent tool lastmod (git commit date)
// so <lastmod> reflects real content freshness, not build date, per AGENTS.md.
const mostRecentToolLastmod = (() => {
  const dates = Object.values(TOOL_LASTMOD)
    .map((d) => dateFrom(d))
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime());
  return dates[0];
})();
const listingLastmod = mostRecentToolLastmod ?? latestBlogDate ?? new Date();

function categoryLastmod(slug: string): Date | undefined {
  const slugToCategoryName: Record<string, string> = {
    encoders: "Encoders",
    formatters: "Formatters",
    generators: "Generators",
    converters: "Converters",
    security: "Security Tools",
    "image-tools": "Image Tools",
    utilities: "Utilities",
    finance: "Finance",
    "health-calculators": "Health",
    "date-time-calculators": "Date-Time",
    "math-calculators": "Math",
    "electrical-calculators": "Electrical",
  };
  const catName = slugToCategoryName[slug];
  if (!catName) return listingLastmod;
  const dates = allTools
    .filter((t) => t.category === catName && !t.noindex && TOOL_LASTMOD[t.slug])
    .map((t) => dateFrom(TOOL_LASTMOD[t.slug])!)
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime());
  return dates[0] ?? listingLastmod;
}

const staticPages: MetadataRoute.Sitemap = [
  entry(`${BASE}/`, latestBlogDate ?? listingLastmod),
  entry(`${BASE}/tools`, listingLastmod),
  entry(`${BASE}/categories`, listingLastmod),
  entry(`${BASE}/guides`, listingLastmod),
  entry(`${BASE}/blog`, latestBlogDate ?? listingLastmod),
  entry(`${BASE}/compare`, listingLastmod),
  entry(`${BASE}/popular`, listingLastmod),
  entry(`${BASE}/new`, listingLastmod),
  entry(`${BASE}/changelog`, listingLastmod),
  entry(`${BASE}/about`, listingLastmod),
  entry(`${BASE}/acceptable-use`, listingLastmod),
  entry(`${BASE}/accessibility`, legalAccessibility ?? listingLastmod),
  entry(`${BASE}/best-practices`, listingLastmod),
  entry(`${BASE}/contact`, listingLastmod),
  entry(`${BASE}/cookie-policy`, legalCookie ?? listingLastmod),
  entry(`${BASE}/disclaimer`, legalDisclaimer ?? listingLastmod),
  entry(`${BASE}/dmca`, listingLastmod),
  entry(`${BASE}/dpa`, listingLastmod),
  entry(`${BASE}/feature-request`, listingLastmod),
  entry(`${BASE}/feedback`, listingLastmod),
  entry(`${BASE}/privacy`, legalPrivacy ?? listingLastmod),
  entry(`${BASE}/report-bug`, listingLastmod),
  entry(`${BASE}/roadmap`, listingLastmod),
  entry(`${BASE}/security`, legalSecurity ?? listingLastmod),
  entry(`${BASE}/status`, listingLastmod),
  entry(`${BASE}/suggest`, listingLastmod),
  entry(`${BASE}/support`, listingLastmod),
  entry(`${BASE}/terms`, legalTerms ?? listingLastmod),
  entry(`${BASE}/tutorials`, listingLastmod),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const categoriesPages: MetadataRoute.Sitemap = categories.map((cat) =>
    entry(`${BASE}/categories/${cat.slug}`, categoryLastmod(cat.slug))
  );

  const toolPages: MetadataRoute.Sitemap = allTools
    .filter((tool) => !tool.noindex)
    .map((tool) => entry(`${BASE}/tools/${tool.slug}`, dateFrom(TOOL_LASTMOD[tool.slug])));

  const guidePages: MetadataRoute.Sitemap = guidesTopics.map((topic) =>
    entry(`${BASE}/guides/${topic.slug}`, new Date(topic.modified))
  );

  const blogPages: MetadataRoute.Sitemap = blogData.map((post) =>
    entry(`${BASE}/blog/${post.slug}`, new Date(post.dateISO))
  );

  const comparisonPages: MetadataRoute.Sitemap = comparisons.map((comparison) =>
    entry(`${BASE}/compare/${comparison.slug}`, new Date(comparison.modified))
  );

  const toolkitPages: MetadataRoute.Sitemap = Object.keys(toolkits).map((slug) =>
    entry(`${BASE}/toolkits/${slug}`, listingLastmod)
  );

  // Long-tail conversion landing pages emitted by the landing-page engine
  // (PR 1 of the rapidtables-alternative plan: PLAN.md). Each entry's
  // lastmod is derived from the canonical tool's git lastmod so search
  // engines see a real modification date, not the build date.
  // Per https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#which-urls-to-include
  // only canonical, 200, indexable URLs belong in the sitemap.
  const conversionPages: MetadataRoute.Sitemap = listIndexableLandingPages().map((page) => {
    const lastmod = dateFrom(TOOL_LASTMOD[page.canonicalSlug]);
    return entry(landingPageUrl(page, BASE), lastmod);
  });

  // Hub pages for /convert/* — provide internal-link crawl path for
  // every landing page (fixes 710 Discovered – not indexed: orphan
  // sitemap-only URLs). See https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl#help-google-find-your-pages
  const convertHub: MetadataRoute.Sitemap = [entry(`${BASE}/convert`, listingLastmod)];
  const convertCategoryHubs: MetadataRoute.Sitemap = landingPageCountsByCategory().map(({ category }) =>
    entry(`${BASE}/convert/${category}`, listingLastmod),
  );

  return [
    ...staticPages,
    ...categoriesPages,
    ...toolPages,
    ...guidePages,
    ...blogPages,
    ...comparisonPages,
    ...toolkitPages,
    ...convertHub,
    ...convertCategoryHubs,
    ...conversionPages,
  ];
}
