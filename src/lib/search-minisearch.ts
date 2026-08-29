"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import MiniSearch from "minisearch";

export interface SearchDoc {
  id: string;
  title: string;
  text: string;
  url: string;
  type: string;
  category?: string;
  popularity?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  text: string;
  url: string;
  type: string;
  category?: string;
  popularity?: number;
  score: number;
  match: Record<string, string[]>;
}

export function useMiniSearch() {
  const [miniSearch, setMiniSearch] = useState<MiniSearch<SearchDoc> | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    const initSearch = async () => {
      try {
        const response = await fetch("/search-index.json", { signal });
        if (!response.ok) throw new Error(`Failed to load search index: ${response.status}`);
        const data = await response.json();
        const docs: SearchDoc[] = data.docs || [];

        const ms = new MiniSearch<SearchDoc>({
          fields: ["title", "text", "category"],
          storeFields: ["title", "url", "type", "category", "popularity"],
        });

        ms.addAll(docs);
        setMiniSearch(ms);
        setReady(true);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e.message);
        }
      }
    };

    initSearch();

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const search = useCallback((query: string, options?: { limit?: number; types?: string[] }): SearchResult[] => {
    if (!miniSearch || !ready || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const limit = options?.limit ?? 20;
    const types = options?.types;

    let results = miniSearch.search(q, {
      boost: { title: 3, category: 2, text: 1 },
      fuzzy: 0.2,
      prefix: true,
    }).slice(0, limit);

    if (types && types.length > 0) {
      results = results.filter(r => types.includes(r.type));
    }

    return results.map(r => ({
      id: r.id,
      title: r.title,
      text: r.text,
      url: r.url,
      type: r.type,
      category: r.category,
      popularity: r.popularity,
      score: r.score,
      match: r.match,
    }));
  }, [miniSearch, ready]);

  const autoSuggest = useCallback((query: string): string[] => {
    if (!miniSearch || !ready || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const suggestions = miniSearch.autoSuggest(q, {
      fuzzy: 0.2,
    });

    return suggestions.map(s => s.suggestion).slice(0, 5);
  }, [miniSearch, ready]);

  return { search, autoSuggest, ready, error };
}