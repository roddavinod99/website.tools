/**
 * Robots — https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 * and https://developers.google.com/search/docs/crawling-indexing/robots/intro
 * sitemap field emits Sitemap: https://tools.devstackio.com/sitemap.xml
 */
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/private/", "/admin/", "/contact/success"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
