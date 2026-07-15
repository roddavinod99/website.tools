import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "DevStackIO",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#0070f3",
    icons: [
      { src: "/logo.png", sizes: "1536x1024", type: "image/png" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    categories: ["developer-tools", "productivity", "utilities"],
    lang: "en",
  };
}
