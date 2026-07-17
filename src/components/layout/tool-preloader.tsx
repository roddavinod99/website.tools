"use client";

import { useEffect } from "react";
import { preloadPopularTools } from "@/components/tools/dynamic-tool-loader";
import { featuredTools } from "@/lib/constants";

export function PreloadPopularTools() {
  useEffect(() => {
    const topSlugs = featuredTools
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 5)
      .map((t) => t.slug);
    preloadPopularTools(topSlugs);
  }, []);
  return null;
}
