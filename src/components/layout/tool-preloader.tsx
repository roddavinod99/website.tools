"use client";

import { useEffect } from "react";
import { preloadPopularTools } from "@/components/tools/dynamic-tool-loader";
import type { Tool } from "@/types";

export function PreloadPopularTools({ featuredTools }: { featuredTools: Tool[] }) {
  useEffect(() => {
    const topSlugs = [...featuredTools]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 5)
      .map((t) => t.slug);
    preloadPopularTools(topSlugs);
  }, [featuredTools]);
  return null;
}
