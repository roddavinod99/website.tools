"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface BenchmarkResult {
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  opsPerSec: number;
  iterations: number;
}

const ITERATION_OPTIONS = [1, 10, 100, 1000, 10000];

export function BenchmarkBuilder() {
  const [code, setCode] = useState("let sum = 0;\nfor (let i = 0; i < 1000; i++) {\n  sum += Math.sqrt(i);\n}\nreturn sum;");
  const [iterations, setIterations] = useState(100);
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; workerRef.current?.terminate(); };
  }, []);

  const runBenchmark = useCallback(() => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(new URL("../../workers/benchmark.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (!mountedRef.current) return;
      if (e.data.type === "result") {
        setResult(e.data.result);
      } else if (e.data.error) {
        setError(e.data.error);
      }
      setIsRunning(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      if (!mountedRef.current) return;
      setError("Worker error occurred");
      setIsRunning(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({ id: crypto.randomUUID(), type: "run", data: { code, iterations } });
  }, [code, iterations]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          Warning: This tool executes arbitrary JavaScript code using the Function constructor. Only run code you trust.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">JavaScript Function Body</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={8}
          placeholder="Write code to benchmark. Use 'return' for the final value."
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      <div className="flex items-center gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Iterations</label>
          <div className="flex gap-1">
            {ITERATION_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setIterations(n)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  iterations === n
                    ? "bg-brand-500 text-white"
                    : "rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-dark-surface dark:text-dark-muted"
                }`}
              >
                {n.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={runBenchmark}
          disabled={isRunning || !code.trim()}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
        >
          {isRunning ? "Running..." : "Run Benchmark"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-3">Results ({result.iterations.toLocaleString()} iterations)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Total Time", value: `${result.totalTime.toFixed(3)}ms` },
              { label: "Average Time", value: `${result.avgTime.toFixed(4)}ms` },
              { label: "Min Time", value: `${result.minTime.toFixed(4)}ms` },
              { label: "Max Time", value: `${result.maxTime.toFixed(4)}ms` },
              { label: "Ops/sec", value: result.opsPerSec === Infinity ? "Infinity" : result.opsPerSec.toFixed(2) },
              { label: "Iterations", value: result.iterations.toLocaleString() },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-white dark:bg-dark-bg p-3">
                <p className="text-xs text-surface-500 dark:text-dark-muted">{item.label}</p>
                <p className="text-lg font-mono font-bold text-surface-900 dark:text-dark-text">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Quick Examples</label>
        <div className="flex flex-wrap gap-1">
          {[
            { label: "Array sort", code: "const a = [5,3,8,1,9,2,7,4,6];\nreturn a.sort((a,b) => a-b);" },
            { label: "String concat", code: "let s = '';\nfor (let i = 0; i < 1000; i++) s += 'a';\nreturn s.length;" },
            { label: "JSON parse", code: "return JSON.parse(JSON.stringify({a:1,b:'hello',c:[1,2,3]}));" },
            { label: "Math operations", code: "let r = 0;\nfor (let i = 0; i < 1000; i++) r += Math.sqrt(i) * Math.sin(i);\nreturn r;" },
          ].map((ex) => (
            <button
              key={ex.label}
              onClick={() => setCode(ex.code)}
              className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-bg transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        Benchmarks run in the browser and results may vary based on system load and browser optimizations.
      </p>
    </div>
  );
}
