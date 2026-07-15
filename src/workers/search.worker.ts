import Fuse from "fuse.js";
import type { Tool } from "@/types";

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
      const results = fuse.search(query, { limit: limit ?? 20 });
      const items = results.map((r) => ({
        ...r.item,
        score: r.score,
      }));
      self.postMessage({ id, type: "search", result: { items } });
      break;
    }
    default:
      self.postMessage({ id, type: "error", result: { error: "Unknown type" } });
  }
};
