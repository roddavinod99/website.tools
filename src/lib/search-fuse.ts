"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { Tool } from "@/types";

export function useFuseSearch(tools: Tool[]) {
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<Tool[]>([]);
  const [query, setQuery] = useState("");
  const pendingRef = useRef<Map<string, (items: Tool[]) => void>>(new Map());

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/search.worker.ts", import.meta.url),
      { type: "module" }
    );
    worker.onmessage = (e) => {
      const { id, result } = e.data;
      if (result.ready) {
        setReady(true);
        return;
      }
      const pending = pendingRef.current.get(id);
      if (pending) {
        pending(result.items || []);
        pendingRef.current.delete(id);
      }
    };
    workerRef.current = worker;

    // Initialize with tools data
    const id = crypto.randomUUID();
    worker.postMessage({ id, type: "init", data: { tools } });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [tools]);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (!workerRef.current || !ready) return;
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    const id = crypto.randomUUID();
    pendingRef.current.set(id, (items) => setResults(items));
    workerRef.current.postMessage({ id, type: "search", data: { query: q, limit: 20 } });
  }, [ready]);

  return { search, results, query, ready };
}
