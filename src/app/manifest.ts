import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

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
      { src: "/logo-light.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    categories: ["developer-tools", "productivity", "utilities"],
    lang: "en",
  };
}
