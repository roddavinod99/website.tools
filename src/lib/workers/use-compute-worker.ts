"use client";

import { useRef, useEffect, useCallback } from "react";

export function useComputeWorker() {
  const poolRef = useRef<{ execute: (type: string, data: unknown) => Promise<{ id: string; type: string; result: unknown; error?: string }> } | null>(null);
  const initializing = useRef(false);
  const initCallbacks = useRef<Array<() => void>>([]);

  useEffect(() => {
    let mounted = true;
    initializing.current = true;

    (async () => {
      const { WorkerPool } = await import("./worker-pool");
      const pool = new WorkerPool(new URL("../../workers/compute.worker.ts", import.meta.url));
      if (mounted) {
        poolRef.current = pool;
        initializing.current = false;
        initCallbacks.current.forEach(cb => cb());
        initCallbacks.current = [];
      } else {
        pool.terminate();
      }
    })();

    return () => {
      mounted = false;
      poolRef.current = null;
    };
  }, []);

  type WorkerResult = { id: string; type: string; result: unknown; error?: string };

  const execute = useCallback(async (type: string, data: unknown): Promise<WorkerResult> => {
    if (poolRef.current) {
      return poolRef.current.execute(type, data);
    }
    if (initializing.current) {
      return new Promise((resolve, reject) => {
        initCallbacks.current.push(() => {
          if (poolRef.current) {
            poolRef.current.execute(type, data).then(resolve).catch(reject);
          } else {
            reject(new Error("Compute worker not available"));
          }
        });
      });
    }
    throw new Error("Compute worker not available");
  }, []);

  const formatJson = useCallback(async (input: string, indent?: number) => {
    const res = await execute("json-format", { input, indent });
    return res.result as string;
  }, [execute]);

  const validateJson = useCallback(async (input: string) => {
    const res = await execute("json-validate", { input });
    return res.result as { valid: boolean; error?: string };
  }, [execute]);

  const minifyJson = useCallback(async (input: string) => {
    const res = await execute("json-minify", { input });
    return res.result as string;
  }, [execute]);

  return { formatJson, validateJson, minifyJson, execute };

}
