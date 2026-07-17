"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFuseSearch } from "@/lib/search-fuse";
import { allTools } from "@/lib/constants";
import { Search, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, results, query, ready } = useFuseSearch(allTools);
  const [localQuery, setLocalQuery] = useState("");

  const handleSearch = useCallback((q: string) => {
    setLocalQuery(q);
    search(q);
  }, [search]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  }, [query, router, onClose]);

  const handleSelect = useCallback((slug: string) => {
    router.push(`/tools/${slug}`);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalQuery("");
    search("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen, search]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Search tools">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4 rounded-xl border border-surface-200 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-surface">
        <form onSubmit={handleSubmit} className="flex items-center border-b border-surface-200 px-4 dark:border-dark-border">
          <Search className="h-5 w-5 shrink-0 text-surface-400" />
          <input
            ref={inputRef}
            value={localQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={ready ? "Search tools..." : "Loading search..."}
            className="flex-1 h-14 bg-transparent px-3 text-base text-surface-900 placeholder:text-surface-400 focus:outline-none dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          {localQuery && (
            <button type="button" onClick={() => { setLocalQuery(""); search(""); }} className="p-1 text-surface-400 hover:text-surface-600">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-surface-200 bg-surface-50 px-1.5 text-xs text-surface-400 dark:border-dark-border dark:bg-dark-bg">
            ESC
          </kbd>
        </form>

        <div className="max-h-80 overflow-y-auto p-2">
          {!ready && (
            <div className="flex items-center justify-center py-8 text-sm text-surface-400 dark:text-dark-muted">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-surface-300 border-t-brand-500 mr-2" />
              Loading search index...
            </div>
          )}

          {ready && !localQuery && (
            <div className="py-8 text-center text-sm text-surface-400 dark:text-dark-muted">
              Type to search across all tools
            </div>
          )}

          {ready && localQuery && results.length === 0 && (
            <div className="py-8 text-center text-sm text-surface-400 dark:text-dark-muted">
              No tools found for &ldquo;{localQuery}&rdquo;
            </div>
          )}

          {ready && results.length > 0 && (
            <div className="space-y-0.5">
              {results.slice(0, 10).map((tool) => (
                <button
                  key={tool.id}
                  data-search-result
                  onClick={() => handleSelect(tool.slug)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSelect(tool.slug); }}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-100 focus:bg-surface-100 focus:outline-none dark:hover:bg-dark-bg dark:focus:bg-dark-bg"
                >
                  <span className="shrink-0 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    {tool.category}
                  </span>
                  <span className="flex-1 font-medium text-surface-900 dark:text-dark-text truncate">
                    {tool.name}
                  </span>
                  <span className="shrink-0 text-xs text-surface-400 dark:text-dark-muted">
                    {tool.popularity}%
                  </span>
                </button>
              ))}
              {results.length > 10 && (
                <button
                  onClick={handleSubmit}
                  className="w-full rounded-lg px-3 py-2 text-center text-xs text-surface-400 hover:text-surface-600 dark:text-dark-muted dark:hover:text-dark-text"
                >
                  View all {results.length} results &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
