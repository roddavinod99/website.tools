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
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          Search
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          Search our collection of tools, guides, blog posts, comparisons & more
        </p>

        <form
          action="/search"
          method="GET"
          className="mt-8 relative"
        >
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <input
            name="q"
            placeholder="Search tools, guides, blog…"
            className="flex h-12 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
          />
        </form>

        <div className="mt-8">
          <Suspense fallback={<p className="text-center text-[var(--color-text-muted)]">Loading search…</p>}>
            <SearchResults />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
