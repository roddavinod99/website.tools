"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMiniSearch } from "@/lib/search-minisearch";
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

  const results = useMemo(() => {
    if (!ready || localQuery.trim().length < 2) return [];
    return search(localQuery, { limit: 15 });
  }, [search, ready, localQuery]);

  const handleSearch = useCallback((q: string) => {
    setLocalQuery(q);
  }, []);

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
      <div className="fixed inset-0 z-50 bg-[var(--color-bg)]/70 backdrop-blur" onClick={onClose} />
      <div ref={panelRef} className="relative mx-auto mt-24 w-full max-w-xl rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 shadow-sm">
        <form onSubmit={handleSubmit} className="flex items-center border-b border-[var(--color-border)] px-4">
          <Search className="h-5 w-5 shrink-0 text-[var(--color-text-subtle)]" />
          <label htmlFor="search-overlay-input" className="sr-only">Search tools and guides</label>
          <input
            id="search-overlay-input"
            name="q"
            ref={inputRef}
            value={localQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={ready ? "Search tools, guides, blog..." : "Loading search..."}
            className="flex-1 h-14 bg-transparent px-3 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none"
          />
          {localQuery && (
            <button type="button" onClick={() => { setLocalQuery(() => ""); }} className="p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 text-xs text-[var(--color-text-muted)]">
            ESC
          </kbd>
        </form>

        <div className="max-h-80 overflow-y-auto p-2">
          {error && (
            <div className="flex items-center justify-center py-8 text-sm text-[var(--color-danger)]">
              Search unavailable: {error}
            </div>
          )}

          {!ready && !error && (
            <div className="flex items-center justify-center py-8 text-sm text-[var(--color-text-muted)]">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] mr-2" />
              Loading search index...
            </div>
          )}

          {ready && !localQuery && !error && (
            <div className="rounded-md bg-[var(--color-accent-soft)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
              Type to search tools, guides, blog posts & comparisons
            </div>
          )}

          {ready && localQuery && results.length === 0 && !error && (
            <div className="rounded-md bg-[var(--color-accent-soft)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
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
                    className="group w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-surface-2)] focus:bg-[var(--color-surface-2)] focus:outline-none"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] opacity-0 group-hover:opacity-100" aria-hidden="true" />
                    <Icon className="h-4 w-4 shrink-0 text-[var(--color-text-subtle)]" aria-hidden="true" />
                    <span className="shrink-0 rounded-md bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                      {result.type}
                    </span>
                    {result.category && (
                      <span className="shrink-0 rounded-md bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                        {result.category}
                      </span>
                    )}
                    <span className="flex-1 font-medium text-[var(--color-text)] truncate">
                      {result.title}
                    </span>
                    {result.popularity && result.popularity >= 90 && (
                      <span className="shrink-0 rounded-full bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                        Most used
                      </span>
                    )}
                  </button>
                );
              })}
              {results.length >= 15 && (
                <button
                  onClick={handleSubmit}
                  className="w-full rounded-md px-3 py-2 text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
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
