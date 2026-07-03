import type { Metadata } from "next";
import Link from "next/link";
import { allTools, siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Search",
  description: "Search DevStackIO tools and resources.",
  alternates: { canonical: `${siteConfig.url}/search` },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q || "").trim().toLowerCase();

  const results = query
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      )
    : [];

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          Search
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Search our collection of tools and resources
        </p>

        <form
          action="/search"
          method="GET"
          className="mt-8 relative"
        >
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search 70 tools..."
            className="flex h-12 w-full rounded-lg border border-surface-200 bg-white pl-10 pr-4 text-base text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </form>

        <div className="mt-8">
          {query && results.length === 0 && (
            <div className="text-center text-surface-500 dark:text-dark-muted">
              <p>No tools found for &ldquo;{q}&rdquo;</p>
              <p className="mt-1 text-sm">Try a different search term</p>
            </div>
          )}

          {query && results.length > 0 && (
            <>
              <p className="text-sm text-surface-500 dark:text-dark-muted mb-4">
                {results.length} tool{results.length !== 1 ? "s" : ""} found for &ldquo;{q}&rdquo;
              </p>
              <div className="grid gap-4">
                {results.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface"
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
                  </Link>
                ))}
              </div>
            </>
          )}

          {!query && (
            <div className="text-center text-surface-500 dark:text-dark-muted">
              <p>Type to search across all tools, guides, and resources.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
