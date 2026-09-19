import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/?source=pwa",
    name: siteConfig.name,
    short_name: "DevStackIO",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#0070f3",
    icons: [
      { src: "/logo-light.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo-light.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    categories: ["developer-tools", "productivity", "utilities"],
    shortcuts: [
      { name: "Search Tools", url: "/search", description: "Search all developer tools" },
      { name: "All Tools", url: "/tools", description: "Browse the full tool directory" },
      { name: "Categories", url: "/categories", description: "Explore tools by category" },
    ],
    lang: "en",
  };
}
