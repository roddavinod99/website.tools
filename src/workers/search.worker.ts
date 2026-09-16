import Fuse from "fuse.js";
import type { Tool } from "@/types";
import { expandQuery } from "@/lib/search/synonyms";

type SearchMessage = {
  id: string;
  type: "init" | "search";
  data: unknown;
};

let fuse: Fuse<Tool> | null = null;

self.onmessage = (e: MessageEvent<SearchMessage>) => {
  const { id, type, data } = e.data;

  switch (type) {
    case "init": {
      const { tools } = data as { tools: Tool[] };
      fuse = new Fuse(tools, {
        keys: [
          { name: "name", weight: 0.4 },
          { name: "description", weight: 0.2 },
          { name: "category", weight: 0.2 },
          { name: "slug", weight: 0.1 },
          { name: "keywords", weight: 0.1 },
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2,
      });
      self.postMessage({ id, type: "init", result: { ready: true } });
      break;
    }
    case "search": {
      const { query, limit } = data as { query: string; limit?: number };
      if (!fuse) {
        self.postMessage({ id, type: "search", result: { items: [], error: "Fuse not initialized" } });
        break;
      }
      if (!query || query.trim().length < 2) {
        self.postMessage({ id, type: "search", result: { items: [] } });
        break;
      }
      // Synonym-expanded terms are searched independently and merged by
      // best score, mirroring src/lib/search-minisearch.ts.
      const merged = new Map<string, Tool & { score?: number }>();
      for (const term of expandQuery(query)) {
        for (const r of fuse.search(term, { limit: limit ?? 20 })) {
          const prev = merged.get(r.item.slug);
          if (!prev || (r.score ?? 1) < (prev.score ?? 1)) {
            merged.set(r.item.slug, { ...r.item, score: r.score });
          }
        }
      }
      const items = [...merged.values()]
        .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
        .slice(0, limit ?? 20);
      self.postMessage({ id, type: "search", result: { items } });
      break;
    }
    default:
      self.postMessage({ id, type: "error", result: { error: "Unknown type" } });
  }
};
