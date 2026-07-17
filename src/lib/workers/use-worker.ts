"use client";
import { useRef, useEffect, useCallback, useState } from "react";
import type { WorkerPool } from "./worker-pool";

export function useWorkerPool(workerUrl: string | URL) {
  const poolRef = useRef<WorkerPool | null>(null);

  useEffect(() => {
    let mounted = true;
    import("./worker-pool").then(({ WorkerPool }) => {
      if (mounted) poolRef.current = new WorkerPool(workerUrl);
    });
    return () => { mounted = false; poolRef.current?.terminate(); };
  }, [workerUrl]);

  const execute = useCallback(async (type: string, data: unknown) => {
    if (!poolRef.current) throw new Error("Worker pool not initialized");
    return poolRef.current.execute(type, data);
  }, []);

  return { execute };
}

interface AsyncWorkerResult {
  result: unknown;
  loading: boolean;
  error: string | null;
}

export function useAsyncWorker(type: string, data: unknown, enabled = true): AsyncWorkerResult {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poolRef = useRef<WorkerPool | null>(null);
  const executingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    import("./worker-pool").then(({ WorkerPool }) => {
      if (mountedRef.current) poolRef.current = new WorkerPool(new URL("../../workers/compute.worker.ts", import.meta.url));
    });
    return () => { mountedRef.current = false; poolRef.current?.terminate(); };
  }, []);

  useEffect(() => {
    if (!enabled || !data || !poolRef.current) return;
    if (executingRef.current) return;

    let cancelled = false;
    executingRef.current = true;
    setLoading(true);

    poolRef.current.execute(type, data).then((res) => {
      if (!cancelled && mountedRef.current) {
        setResult(res.result);
        setError(res.error || null);
        setLoading(false);
        executingRef.current = false;
      }
    }).catch((err: Error) => {
      if (!cancelled && mountedRef.current) {
        setError(err.message);
        setLoading(false);
        executingRef.current = false;
      }
    });
    return () => { cancelled = true; };
  }, [type, data, enabled]);

  return { result, loading, error };
}
