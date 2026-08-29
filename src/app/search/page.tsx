import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/lib/data";
import { Search } from "lucide-react";
import { SearchResults } from "./search-results";

export const metadata: Metadata = {
  title: "Search",
  description: "Search DevStackIO developer tools, guides, blog posts, and comparisons.",
  alternates: { canonical: `${siteConfig.url}/search` },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          Search
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Search our collection of tools, guides, blog posts, comparisons & more
        </p>

        <form
          action="/search"
          method="GET"
          className="mt-8 relative"
        >
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
          <input
            name="q"
            placeholder="Search tools, guides, blog…"
            className="flex h-12 w-full rounded-lg border border-surface-200 bg-white pl-10 pr-4 text-base text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </form>

        <div className="mt-8">
          <Suspense fallback={<p className="text-center text-surface-500 dark:text-dark-muted">Loading search…</p>}>
            <SearchResults />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
