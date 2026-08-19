"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFuseSearch } from "@/lib/search-fuse";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/types";

interface SearchResultsProps {
  tools: Tool[];
  featuresBySlug: Record<string, string[]>;
}

export function SearchResults({ tools, featuresBySlug }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const q = (searchParams?.get("q") || "").trim().toLowerCase();
  const { search, results, ready } = useFuseSearch(tools);

  useEffect(() => {
    search(q);
  }, [q, search]);

  if (!q) {
    return (
      <div className="text-center text-surface-500 dark:text-dark-muted">
        <p>Type to search across all tools.</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="text-center text-surface-500 dark:text-dark-muted">
        <p>Searching…</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center text-surface-500 dark:text-dark-muted">
        <p>No tools found for &ldquo;{q}&rdquo;</p>
        <p className="mt-1 text-sm">Try a different search term</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-surface-500 dark:text-dark-muted mb-4">
        {results.length} tool{results.length !== 1 ? "s" : ""} found for &ldquo;{q}&rdquo;
      </p>
      <div className="grid gap-4">
        {results.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
          >
            <div className="flex items-start justify-between">
              <Badge variant="default">{tool.category}</Badge>
              {tool.trending && <Badge variant="warning">Hot</Badge>}
            </div>
            <h3 className="mt-3 font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
              {tool.name}
            </h3>
            <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
              {tool.description}
            </p>
            {featuresBySlug[tool.slug] && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {featuresBySlug[tool.slug].slice(0, 3).map((feature) => (
                  <li
                    key={feature}
                    className="rounded-full border border-surface-200 bg-surface-50 px-2 py-0.5 text-[10px] font-medium text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}