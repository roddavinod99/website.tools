import type { MetadataRoute } from "next";
import { allTools, categories, siteConfig, learningTopics } from "@/lib/constants";
import { toolkits } from "@/lib/toolkits";
import { blogPosts as blogData } from "@/lib/blog";

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

const staticPages: MetadataRoute.Sitemap = [
  entry(`${BASE}/`, latestBlogDate),
  entry(`${BASE}/tools`),
  entry(`${BASE}/categories`),
  entry(`${BASE}/guides`),
  entry(`${BASE}/blog`, latestBlogDate),
  entry(`${BASE}/learning`),
  entry(`${BASE}/popular`),
  entry(`${BASE}/new`),
  entry(`${BASE}/changelog`),
  entry(`${BASE}/about`),
  entry(`${BASE}/best-practices`),
  entry(`${BASE}/contact`),
  entry(`${BASE}/cookie-policy`, legalCookie),
  entry(`${BASE}/disclaimer`, legalDisclaimer),
  entry(`${BASE}/feature-request`),
  entry(`${BASE}/feedback`),
  entry(`${BASE}/privacy`, legalPrivacy),
  entry(`${BASE}/report-bug`),
  entry(`${BASE}/roadmap`),
  entry(`${BASE}/status`),
  entry(`${BASE}/suggest`),
  entry(`${BASE}/support`),
  entry(`${BASE}/terms`, legalTerms),
  entry(`${BASE}/tutorials`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const categoriesPages: MetadataRoute.Sitemap = categories.map((cat) =>
    entry(`${BASE}/categories/${cat.slug}`)
  );

  const toolPages: MetadataRoute.Sitemap = allTools
    .filter((tool) => !tool.noindex)
    .map((tool) => entry(`${BASE}/tools/${tool.slug}`));

  const guidePages: MetadataRoute.Sitemap = learningTopics.map((topic) =>
    entry(`${BASE}/guides/${topic.slug}`)
  );

  const blogPages: MetadataRoute.Sitemap = blogData.map((post) =>
    entry(`${BASE}/blog/${post.slug}`, new Date(post.dateISO))
  );

  const toolkitPages: MetadataRoute.Sitemap = Object.keys(toolkits).map((slug) =>
    entry(`${BASE}/toolkits/${slug}`)
  );

  return [
    ...staticPages,
    ...categoriesPages,
    ...toolPages,
    ...guidePages,
    ...blogPages,
    ...toolkitPages,
  ];
}