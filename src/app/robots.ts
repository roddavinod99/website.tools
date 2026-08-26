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
