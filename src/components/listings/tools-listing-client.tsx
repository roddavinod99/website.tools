"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import type { Tool } from "@/types";
import type { Category } from "@/types";
import { ToolCard } from "@/components/ui/tool-card";
import { AdBanner } from "@/components/ads";
import { adSlots } from "@/lib/data/ads";
import { sortTools, TOOL_SORTS, type ToolSort } from "@/lib/sort-tools";

interface Props {
  tools: Tool[];
  categories: Category[];
}

export function ToolsListingClient({ tools, categories }: Props) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<ToolSort>("popular");

  const filtered = useMemo(() => {
    let result = [...tools];
    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false)
      );
    }
    return sortTools(result, sort);
  }, [tools, query, selectedCategory, sort]);

  const totalCount = tools.length;
  const showingCount = filtered.length;

  return (
    <>
      {/* Single unified section — replaces the previous duplicated 2-grid layout */}
      <section className="container py-8">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
          {/* Left filter rail — now interactive */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <aside aria-label="Filters" role="region" className="space-y-6 text-sm">
                <div>
                  <label htmlFor="filter-q" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                    Search
                  </label>
                  <input
                    id="filter-q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search 172 tools..."
                    className="w-full h-9 px-3 border border-[var(--color-border)] rounded-md bg-[var(--color-bg)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="mt-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Category</p>
                  <ul className="space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        aria-pressed={selectedCategory === null}
                        className={`text-left w-full rounded-sm px-2 py-1 text-sm transition-colors ${selectedCategory === null ? "font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"}`}
                      >
                        All ({totalCount})
                      </button>
                    </li>
                    {categories.map((c) => {
                      const count = tools.filter((t) => t.category === c.name).length;
                      const active = selectedCategory === c.name;
                      return (
                        <li key={c.slug}>
                          <button
                            type="button"
                            onClick={() => setSelectedCategory(active ? null : c.name)}
                            aria-pressed={active}
                            className={`text-left w-full rounded-sm px-2 py-1 text-sm transition-colors ${active ? "font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"}`}
                          >
                            {c.name} <span className="text-xs opacity-60">({count})</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <label htmlFor="filter-sort" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                    Sort
                  </label>
                  <select
                    id="filter-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as ToolSort)}
                    className="w-full h-9 px-3 border border-[var(--color-border)] rounded-md bg-[var(--color-bg)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  >
                    {TOOL_SORTS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                  <p className="text-xs font-medium text-[var(--color-text)]">Showing {showingCount} of {totalCount}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">All tools run 100% in your browser. No uploads.</p>
                </div>
              </aside>
            </div>
          </div>

          {/* Center grid — single source of truth, handles all tools with mid-ad injection */}
          <div className="lg:col-span-8">
            {/* Category pills — now shows ALL categories, linked to filter */}
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 mb-6">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`rounded-md border px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === null ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-blue-700 dark:text-blue-400" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"}`}
                aria-pressed={selectedCategory === null}
              >
                All
              </button>
              {categories.map((cat) => {
                const active = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(active ? null : cat.name)}
                    className={`rounded-md border px-4 py-1.5 text-sm transition-colors ${active ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] font-medium text-blue-700 dark:text-blue-400" : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"}`}
                    aria-pressed={active}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--color-text-muted)]" aria-live="polite">
                {showingCount === totalCount ? `All ${totalCount} tools` : `${showingCount} tools${selectedCategory ? ` in ${selectedCategory}` : ""}${query ? ` for “${query}”` : ""}`}
              </p>
              <Link href="/categories" className="text-sm text-[var(--color-accent)] hover:underline hidden sm:inline">
                Browse by category →
              </Link>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-md border border-dashed border-[var(--color-border)] p-12 text-center">
                <p className="text-[var(--color-text)] font-medium">No tools match your filters</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Try adjusting search or category.</p>
                <button type="button" onClick={() => { setQuery(""); setSelectedCategory(null); }} className="mt-4 rounded-md border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-surface)]">Clear filters</button>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                {filtered.map((tool, index) => (
                  <Fragment key={tool.slug}>
                    {index === Math.floor(filtered.length / 2) && filtered.length > 8 && (
                      <div className="col-span-full">
                        <AdBanner className="my-2" slot={adSlots.toolsMid} />
                      </div>
                    )}
                    <ToolCard tool={tool} />
                  </Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Quick links — desktop only */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">Quick links</p>
              <ul className="mt-2 text-sm space-y-1">
                {["JSON", "XML", "YAML", "SQL", "HTML"].map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => setQuery(q.toLowerCase())}
                      className="text-left text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs font-medium text-[var(--color-text-muted)]">Popular</p>
              <ul className="mt-2 text-sm space-y-1">
                {tools.slice(0,5).map((t) => (
                  <li key={t.slug}><Link href={`/tools/${t.slug}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] line-clamp-1 hover:underline">{t.name}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
