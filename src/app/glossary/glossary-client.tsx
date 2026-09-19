"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { GlossaryTerm } from "@/lib/data/glossary";
import { allTools } from "@/lib/data/tools";

const categoryBadgeStyles: Record<string, string> = {
  Encoding: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  Security: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Data Format": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Network: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  Image: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  PDF: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "Developer Tools": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  General: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function getToolName(slug: string): string {
  return allTools.find((t) => t.slug === slug)?.name ?? slug;
}

export function GlossaryClient({ terms }: { terms: GlossaryTerm[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(terms.map((t) => t.category)));
    return ["All", ...cats];
  }, [terms]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return terms.filter((t) => {
      if (activeCategory !== "All" && t.category !== activeCategory) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [terms, search, activeCategory]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms, definitions, categories..."
            aria-label="Search glossary terms"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 pr-10 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" aria-hidden="true">
            ⌕
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]" aria-live="polite">
          {filtered.length} of {terms.length} terms
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Term grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((term) => (
          <article
            key={term.slug}
            className="flex flex-col rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/glossary/${term.slug}`}
                className="text-base font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline underline-offset-4"
              >
                {term.term}
              </Link>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryBadgeStyles[term.category] ?? categoryBadgeStyles.General}`}
              >
                {term.category}
              </span>
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{term.definition}</p>
            {term.relatedTools && term.relatedTools.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {term.relatedTools.map((slug) => (
                  <Link
                    key={slug}
                    href={`/tools/${slug}`}
                    className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] dark:bg-[var(--color-surface)]"
                  >
                    {getToolName(slug)}
                  </Link>
                ))}
              </div>
            ) : null}
            <Link
              href={`/glossary/${term.slug}`}
              className="mt-3 inline-flex text-xs font-medium text-[var(--color-accent)] hover:underline underline-offset-4"
            >
              Learn more →
            </Link>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-[var(--color-text-muted)]">No terms match your search. Try a different keyword or category.</p>
      ) : null}
    </div>
  );
}
