import type { MetadataRoute } from "next";
import { allTools, categories, siteConfig, learningTopics } from "@/lib/constants";
import { toolkits } from "@/lib/toolkits";
import { blogPosts as blogData } from "@/lib/blog";

export const revalidate = 86400;

const BASE = siteConfig.url;

const staticPages: MetadataRoute.Sitemap = [
  { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
  { url: `${BASE}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${BASE}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE}/blog`, lastModified: new Date(blogData[0].dateISO), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/learning`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/popular`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/new`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/changelog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/api`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/best-practices`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/feature-request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/feedback`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE}/report-bug`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/roadmap`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  // search excluded — dynamic content with no unique indexable value
  // sitemap excluded — self-referencing HTML page not needed in XML sitemap
  { url: `${BASE}/status`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.3 },
  { url: `${BASE}/suggest`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE}/tutorials`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/cookie-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const categoriesPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE}/categories/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const toolPages: MetadataRoute.Sitemap = allTools
    .filter((tool) => !tool.noindex)
    .map((tool) => ({
      url: `${BASE}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: tool.featured ? 0.9 : tool.new ? 0.85 : 0.8,
    }));

  const guidePages: MetadataRoute.Sitemap = learningTopics.map((topic) => ({
    url: `${BASE}/guides/${topic.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogData.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.dateISO),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const toolkitPages: MetadataRoute.Sitemap = Object.keys(toolkits).map((slug) => ({
    url: `${BASE}/toolkits/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...categoriesPages,
    ...toolPages,
    ...guidePages,
    ...blogPages,
    ...toolkitPages,
  ];
}
