import type { MetadataRoute } from "next";
import { allTools, categories, siteConfig, learningTopics } from "@/lib/constants";
import { toolkits } from "@/lib/toolkits";
import { blogPosts as blogData } from "@/lib/blog";

export const revalidate = 86400;

const BASE = siteConfig.url.replace(/\/+$/, "");
const LEGAL = siteConfig.legal?.lastUpdated ?? {};

function dateFrom(str: string | undefined): Date | undefined {
  if (!str) return;
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function entry(url: string, opts?: {
  lastModified?: Date;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
}): MetadataRoute.Sitemap[number] {
  const e: MetadataRoute.Sitemap[number] = { url };
  if (opts?.lastModified) e.lastModified = opts.lastModified;
  if (opts?.changeFrequency) e.changeFrequency = opts.changeFrequency;
  if (opts?.priority !== undefined) e.priority = opts.priority;
  return e;
}

const latestBlogDate = dateFrom(blogData[0]?.dateISO);
const legalPrivacy = dateFrom(LEGAL.privacy);
const legalTerms = dateFrom(LEGAL.terms);
const legalCookie = dateFrom(LEGAL.cookie);
const legalDisclaimer = dateFrom(LEGAL.disclaimer);

const staticPages: MetadataRoute.Sitemap = [
  entry(`${BASE}/`, {
    lastModified: latestBlogDate,
    changeFrequency: "weekly",
    priority: 1.0,
  }),
  entry(`${BASE}/tools`, {
    changeFrequency: "weekly",
    priority: 0.9,
  }),
  entry(`${BASE}/categories`, {
    changeFrequency: "weekly",
    priority: 0.8,
  }),
  entry(`${BASE}/guides`, {
    changeFrequency: "weekly",
    priority: 0.8,
  }),
  entry(`${BASE}/blog`, {
    lastModified: latestBlogDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }),
  entry(`${BASE}/learning`, {
    changeFrequency: "monthly",
    priority: 0.7,
  }),
  entry(`${BASE}/popular`, {
    changeFrequency: "weekly",
    priority: 0.7,
  }),
  entry(`${BASE}/new`, {
    changeFrequency: "weekly",
    priority: 0.7,
  }),
  entry(`${BASE}/changelog`, {
    changeFrequency: "weekly",
    priority: 0.6,
  }),
  entry(`${BASE}/about`, {
    changeFrequency: "monthly",
    priority: 0.5,
  }),
  entry(`${BASE}/api`, {
    changeFrequency: "monthly",
    priority: 0.5,
  }),
  entry(`${BASE}/best-practices`, {
    changeFrequency: "monthly",
    priority: 0.5,
  }),
  entry(`${BASE}/contact`, {
    changeFrequency: "monthly",
    priority: 0.4,
  }),
  entry(`${BASE}/cookie-policy`, {
    lastModified: legalCookie,
    changeFrequency: "yearly",
    priority: 0.3,
  }),
  entry(`${BASE}/disclaimer`, {
    lastModified: legalDisclaimer,
    changeFrequency: "yearly",
    priority: 0.3,
  }),
  entry(`${BASE}/feature-request`, {
    changeFrequency: "monthly",
    priority: 0.4,
  }),
  entry(`${BASE}/feedback`, {
    changeFrequency: "monthly",
    priority: 0.4,
  }),
  entry(`${BASE}/privacy`, {
    lastModified: legalPrivacy,
    changeFrequency: "yearly",
    priority: 0.3,
  }),
  entry(`${BASE}/report-bug`, {
    changeFrequency: "monthly",
    priority: 0.4,
  }),
  entry(`${BASE}/roadmap`, {
    changeFrequency: "monthly",
    priority: 0.5,
  }),
  entry(`${BASE}/status`, {
    changeFrequency: "weekly",
    priority: 0.3,
  }),
  entry(`${BASE}/suggest`, {
    changeFrequency: "monthly",
    priority: 0.4,
  }),
  entry(`${BASE}/support`, {
    changeFrequency: "monthly",
    priority: 0.4,
  }),
  entry(`${BASE}/terms`, {
    lastModified: legalTerms,
    changeFrequency: "yearly",
    priority: 0.3,
  }),
  entry(`${BASE}/tutorials`, {
    changeFrequency: "monthly",
    priority: 0.6,
  }),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const categoriesPages: MetadataRoute.Sitemap = categories.map((cat) =>
    entry(`${BASE}/categories/${cat.slug}`, {
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const toolPages: MetadataRoute.Sitemap = allTools
    .filter((tool) => !tool.noindex)
    .map((tool) =>
      entry(`${BASE}/tools/${tool.slug}`, {
        changeFrequency: "monthly",
        priority: tool.featured ? 0.9 : tool.new ? 0.85 : 0.8,
      })
    );

  const guidePages: MetadataRoute.Sitemap = learningTopics.map((topic) =>
    entry(`${BASE}/guides/${topic.slug}`, {
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  const blogPages: MetadataRoute.Sitemap = blogData.map((post) =>
    entry(`${BASE}/blog/${post.slug}`, {
      lastModified: new Date(post.dateISO),
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const toolkitPages: MetadataRoute.Sitemap = Object.keys(toolkits).map((slug) =>
    entry(`${BASE}/toolkits/${slug}`, {
      changeFrequency: "monthly",
      priority: 0.6,
    })
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
