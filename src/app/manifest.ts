import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "DevStackIO",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#1b262c",
    theme_color: "#3282b8",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    categories: ["developer-tools", "productivity", "utilities"],
    lang: "en",
  };
}
