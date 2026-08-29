"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMiniSearch, type SearchResult } from "@/lib/search-minisearch";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { Search, X, FileText, BookOpen, Code, FlaskConical } from "lucide-react";

const TYPE_ICONS = {
  tool: Code,
  guide: BookOpen,
  blog: FileText,
  compare: FlaskConical,
  category: FileText,
  workflow: FlaskConical,
  toolkit: Code,
} as const;

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { search, ready, error } = useMiniSearch();
  const [localQuery, setLocalQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = useCallback((q: string) => {
    setLocalQuery(q);
    if (q.trim().length >= 2) {
      const res = search(q, { limit: 15 });
      setResults(res);
    } else {
      setResults([]);
    }
  }, [search]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(localQuery)}`);
      onClose();
    }
  }, [localQuery, router, onClose]);

  const handleSelect = useCallback((url: string) => {
    router.push(url);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setLocalQuery("");
    setResults([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const items = document.querySelectorAll("[data-search-result]");
        if (items.length === 0) return;
        const active = document.activeElement;
        if (active === inputRef.current || active === items[items.length - 1]) {
          (items[0] as HTMLElement).focus();
        } else if (active && (active as HTMLElement).nextElementSibling) {
          const next = (active as HTMLElement).nextElementSibling?.querySelector<HTMLElement>("[data-search-result]");
          next?.focus();
        }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const items = document.querySelectorAll("[data-search-result]");
        if (items.length === 0) return;
        const active = document.activeElement;
        if (active === items[0]) {
          inputRef.current?.focus();
        } else if (active && (active as HTMLElement).previousElementSibling) {
          const prev = (active as HTMLElement).previousElementSibling?.querySelector<HTMLElement>("[data-search-result]");
          prev?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useFocusTrap(isOpen, panelRef, inputRef);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Search tools and guides">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div ref={panelRef} className="relative w-full max-w-xl mx-4 rounded-xl border border-surface-200 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-surface">
        <form onSubmit={handleSubmit} className="flex items-center border-b border-surface-200 px-4 dark:border-dark-border">
          <Search className="h-5 w-5 shrink-0 text-surface-400" />
          <label htmlFor="search-overlay-input" className="sr-only">Search tools and guides</label>
          <input
            id="search-overlay-input"
            name="q"
            ref={inputRef}
            value={localQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={ready ? "Search tools, guides, blog..." : "Loading search..."}
            className="flex-1 h-14 bg-transparent px-3 text-base text-surface-900 placeholder:text-surface-400 focus:outline-none dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          {localQuery && (
            <button type="button" onClick={() => { setLocalQuery(""); setResults([]); }} className="p-1 text-surface-400 hover:text-surface-600">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-surface-200 bg-surface-50 px-1.5 text-xs text-surface-400 dark:border-dark-border dark:bg-dark-bg">
            ESC
          </kbd>
        </form>

        <div className="max-h-80 overflow-y-auto p-2">
          {error && (
            <div className="flex items-center justify-center py-8 text-sm text-red-500">
              Search unavailable: {error}
            </div>
          )}

          {!ready && !error && (
            <div className="flex items-center justify-center py-8 text-sm text-surface-400 dark:text-dark-muted">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-surface-300 border-t-brand-500 mr-2" />
              Loading search index...
            </div>
          )}

          {ready && !localQuery && !error && (
            <div className="py-8 text-center text-sm text-surface-400 dark:text-dark-muted">
              Type to search tools, guides, blog posts & comparisons
            </div>
          )}

          {ready && localQuery && results.length === 0 && !error && (
            <div className="py-8 text-center text-sm text-surface-400 dark:text-dark-muted">
              No results for &ldquo;{localQuery}&rdquo;
            </div>
          )}

          {ready && results.length > 0 && (
            <div className="space-y-0.5">
              {results.map((result) => {
                const Icon = TYPE_ICONS[result.type as keyof typeof TYPE_ICONS] || FileText;
                return (
                  <button
                    key={result.id}
                    data-search-result
                    onClick={() => handleSelect(result.url)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSelect(result.url); }}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-200 focus:bg-surface-200 focus:outline-none dark:hover:bg-dark-bg dark:focus:bg-dark-bg"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-surface-400 dark:text-dark-muted" aria-hidden="true" />
                    <span className="shrink-0 rounded-md bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium text-surface-600 dark:bg-dark-border dark:text-dark-muted">
                      {result.type}
                    </span>
                    {result.category && (
                      <span className="shrink-0 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        {result.category}
                      </span>
                    )}
                    <span className="flex-1 font-medium text-surface-900 dark:text-dark-text truncate">
                      {result.title}
                    </span>
                    {result.popularity && result.popularity >= 90 && (
                      <span className="shrink-0 rounded-full bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium text-surface-600 dark:bg-dark-border dark:text-dark-muted">
                        Most used
                      </span>
                    )}
                  </button>
                );
              })}
              {results.length >= 15 && (
                <button
                  onClick={handleSubmit}
                  className="w-full rounded-lg px-3 py-2 text-center text-xs text-surface-400 hover:text-surface-600 dark:text-dark-muted dark:hover:text-dark-text"
                >
                  View all results &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}