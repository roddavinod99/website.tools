"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMiniSearch, type SearchResult } from "@/lib/search-minisearch";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, Code, FlaskConical, FolderOpen, Package } from "lucide-react";

const TYPE_ICONS = {
  tool: Code,
  guide: BookOpen,
  blog: FileText,
  compare: FlaskConical,
  category: FolderOpen,
  workflow: FlaskConical,
  toolkit: Package,
} as const;

const TYPE_LABELS: Record<string, string> = {
  tool: "Tool",
  guide: "Guide",
  blog: "Blog",
  compare: "Comparison",
  category: "Category",
  workflow: "Workflow",
  toolkit: "Toolkit",
};

export function SearchResults() {
  const searchParams = useSearchParams();
  const q = (searchParams?.get("q") || "").trim().toLowerCase();
  const { search, ready, error } = useMiniSearch();

  const results = useMemo(() => {
    if (!ready || q.trim().length < 2) return [];
    return search(q, { limit: 50 });
  }, [search, ready, q]);

  if (!q) {
    return (
      <div className="text-center text-[var(--color-text-muted)] py-12">
        <p className="text-lg">Type to search tools, guides, blog posts, comparisons & more.</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="text-center text-[var(--color-text-muted)] py-12">
        <p>Loading search index…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        <p>Search error: {error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center text-[var(--color-text-muted)] py-12">
        <p>No results for &ldquo;{q}&rdquo;</p>
        <p className="mt-1 text-sm">Try a different search term</p>
      </div>
    );
  }

  // Group results by type
  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const typeOrder = ["tool", "guide", "blog", "compare", "category", "workflow", "toolkit"];

  return (
    <>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
      </p>
      {typeOrder.map((type) => {
        const items = grouped[type];
        if (!items || items.length === 0) return null;
        const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || FileText;
        return (
          <section key={type} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5 text-[var(--color-accent)]" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-[var(--color-text)] capitalize">
                {TYPE_LABELS[type]} ({items.length})
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((result) => (
                <Link
                  key={result.id}
                  href={result.url}
                  className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                >
                  <div className="flex items-start justify-between">
                    <Badge variant="default">{TYPE_LABELS[type]}</Badge>
                    {result.popularity && result.popularity >= 90 && (
                      <Badge variant="success">Most used</Badge>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] line-clamp-1">
                    {result.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {result.text.slice(0, 200)}
                  </p>
                  {result.category && (
                    <span className="mt-2 inline-block shrink-0 rounded-md bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                      {result.category}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}