"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFuseSearch } from "@/lib/search-fuse";
import { Search, ArrowRight, Command, CornerDownLeft } from "lucide-react";
import type { Tool } from "@/types";
import { trackSearch } from "@/lib/analytics";

const RECENT_KEY = "devstackio_recent_searches";
const MAX_RECENT = 5;
const MIN_QUERY_LENGTH = 2;

export function ToolSearch({ allTools }: { allTools: Tool[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { search, results, ready } = useFuseSearch(allTools);
  const [localQuery, setLocalQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = sessionStorage.getItem(RECENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, MAX_RECENT);
      }
    } catch {
      /* ignore */
    }
    return [];
  });

  const popularTools = allTools.filter((t) => t.featured).slice(0, 6);
  const showResults = isFocused && localQuery.trim().length >= MIN_QUERY_LENGTH;
  const showSuggestions = isFocused && localQuery.trim().length < MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!isFocused) return;
    function handleOutsideClick(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isFocused]);

  const saveRecent = useCallback((q: string) => {
    try {
      const next = [q, ...recentSearches.filter((s) => s !== q)].slice(0, MAX_RECENT);
      setRecentSearches(next);
      sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [recentSearches]);

  const goToTool = useCallback((slug: string, q: string) => {
    saveRecent(q);
    trackSearch(q, 0);
    router.push(`/tools/${slug}`);
  }, [router, saveRecent]);

  const goToSearchPage = useCallback((q: string) => {
    saveRecent(q);
    trackSearch(q, 0);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [router, saveRecent]);

  const handleChange = useCallback((value: string) => {
    setLocalQuery(value);
    search(value);
  }, [search]);

  const handleSubmit = useCallback(() => {
    const q = localQuery.trim();
    if (!q) return;
    if (results.length > 0) {
      goToTool(results[0].slug, q);
    } else {
      goToSearchPage(q);
    }
  }, [localQuery, results, goToTool, goToSearchPage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const items = document.querySelectorAll<HTMLElement>("[data-search-result]");
      if (items.length > 0) {
        items[0].focus();
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const items = document.querySelectorAll<HTMLElement>("[data-search-result]");
      if (items.length > 0) {
        items[items.length - 1].focus();
      }
      return;
    }
  }, [handleSubmit]);

  const handleResultKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, slug: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToTool(slug, localQuery);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const items = document.querySelectorAll<HTMLElement>("[data-search-result]");
      const current = e.currentTarget;
      const next = current.nextElementSibling as HTMLElement | null;
      if (next) next.focus();
      else if (items.length > 0) items[0].focus();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const items = document.querySelectorAll<HTMLElement>("[data-search-result]");
      const current = e.currentTarget;
      const prev = current.previousElementSibling as HTMLElement | null;
      if (prev) prev.focus();
      else inputRef.current?.focus();
      void items;
      return;
    }
  }, [goToTool, localQuery]);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-subtle)]" aria-hidden="true" />
        <label htmlFor="tool-search" className="sr-only">Search developer tools</label>
        <input
          id="tool-search"
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 120);
          }}
          onKeyDown={handleKeyDown}
          placeholder={ready ? "Search developer tools..." : "Loading search..."}
          role="combobox"
          aria-expanded={isFocused}
          aria-controls="tool-search-results"
          aria-autocomplete="list"
          autoComplete="off"
          className="h-14 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pl-12 pr-14 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
        <span className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text-subtle)] sm:flex" aria-hidden="true">
          <Command className="h-3.5 w-3.5" />
          K
        </span>
      </div>

      {isFocused && (
        <div
          ref={panelRef}
          id="tool-search-results"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg"
        >
          {showResults && (
            <div role="listbox" aria-label="Search results" className="max-h-96 overflow-y-auto p-2">
              {!ready && (
                <div className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  Loading search index...
                </div>
              )}
              {ready && results.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  No tools found for &ldquo;{localQuery}&rdquo;
                  <button
                    type="button"
                    onClick={() => goToSearchPage(localQuery.trim())}
                    className="mt-3 flex w-full items-center justify-center gap-1 rounded-md bg-[var(--color-accent-soft)] px-3 py-2 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/80"
                  >
                    View full search results
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
              {ready && results.length > 0 && (
                <ul className="space-y-0.5">
                  {results.slice(0, 8).map((tool, index) => (
                    <li key={tool.id}>
                      <button
                        type="button"
                        data-search-result
                        onClick={() => goToTool(tool.slug, localQuery)}
                        onKeyDown={(e) => handleResultKeyDown(e, tool.slug)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-2)] focus:bg-[var(--color-surface-2)] focus:outline-none"
                      >
                        <span className="shrink-0 rounded-md bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                          {tool.category}
                        </span>
                        <span className="flex-1 font-medium text-[var(--color-text)] truncate">
                          {tool.name}
                        </span>
                        <span className="shrink-0 text-[var(--color-text-subtle)]" aria-hidden="true">
                          <CornerDownLeft className="h-3.5 w-3.5" />
                        </span>
                        <span className="sr-only">{index + 1} of {results.length}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {showSuggestions && (
            <div className="max-h-96 overflow-y-auto p-2">
              {recentSearches.length > 0 && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                    Recent searches
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setLocalQuery(term);
                          search(term);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                  Popular tools
                </p>
                <ul className="mt-2 space-y-0.5">
                  {popularTools.map((tool) => (
                    <li key={tool.id}>
                      <button
                        type="button"
                        data-search-result
                        onClick={() => goToTool(tool.slug, tool.name)}
                        onKeyDown={(e) => handleResultKeyDown(e, tool.slug)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-2)] focus:bg-[var(--color-surface-2)] focus:outline-none"
                      >
                        <span className="shrink-0 rounded-md bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                          {tool.category}
                        </span>
                        <span className="flex-1 font-medium text-[var(--color-text)] truncate">
                          {tool.name}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-subtle)]" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
