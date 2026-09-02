"use client";

import { useState, useMemo, useCallback } from "react";
import { usePrefillTool } from "@/lib/load-example";

/**
 * Statistics Calculator — pure browser implementation, 100% client-side.
 *
 * Per AGENTS.md: no random, no Date.now, no setState inside useMemo.
 * The number-list parsing and the three metrics (mean, stddev, variance)
 * are derived during render from the raw input text.
 */

function parseNumbers(raw: string): number[] {
  return raw
    .split(/[\s,;\n\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => parseFloat(s))
    .filter((n) => Number.isFinite(n));
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e9 || (n !== 0 && Math.abs(n) < 1e-4)) {
    return n.toExponential(6);
  }
  return Number(n.toPrecision(12)).toString();
}

type Mode = "all" | "mean" | "stddev" | "variance" | "sum" | "count" | "min" | "max";

export function StatisticsCalculator() {
  const [raw, setRaw] = useState("1, 2, 3, 4, 5, 6, 7, 8, 9, 10");
  const [mode, setMode] = useState<Mode>("all");

  // Long-tail landing pages (PR 6 of PLAN.md) prefill the calculator
  // with a comma-separated number list, e.g. /stats/average-of-10,20,30.
  usePrefillTool("statistics-calculator", (prefill) => {
    if (prefill.numbers) setRaw(prefill.numbers);
    if (prefill.mode === "all" || prefill.mode === "mean" || prefill.mode === "stddev" || prefill.mode === "variance") {
      setMode(prefill.mode);
    }
  });

  const stats = useMemo(() => {
    const numbers = parseNumbers(raw);
    if (numbers.length === 0) return null;
    const n = numbers.length;
    const sum = numbers.reduce((acc, x) => acc + x, 0);
    const mean = sum / n;
    const variance = n > 1
      ? numbers.reduce((acc, x) => acc + (x - mean) * (x - mean), 0) / (n - 1)
      : 0;
    const stddev = Math.sqrt(variance);
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    return { numbers, n, sum, mean, variance, stddev, min, max };
  }, [raw]);

  const copy = useCallback(async () => {
    if (!stats) return;
    const text = `n=${stats.n}\nmean=${fmt(stats.mean)}\nstddev=${fmt(stats.stddev)}\nvariance=${fmt(stats.variance)}\nmin=${fmt(stats.min)}\nmax=${fmt(stats.max)}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }, [stats]);

  const showAll = mode === "all";
  const show = (m: Mode) => mode === "all" || mode === m;

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="stats-input"
          className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1"
        >
          Numbers (comma-, space-, or newline-separated)
        </label>
        <textarea
          id="stats-input"
          data-testid="stats-input"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={4}
          placeholder="1, 2, 3, 4, 5"
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
        <p className="mt-1 text-[10px] text-surface-500 dark:text-dark-muted">
          Parsed {stats?.n ?? 0} number{stats?.n === 1 ? "" : "s"}.
        </p>
      </div>

      <div>
        <label
          htmlFor="stats-mode"
          className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1"
        >
          Show
        </label>
        <select
          id="stats-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
        >
          <option value="all">All metrics</option>
          <option value="mean">Mean only</option>
          <option value="stddev">Standard deviation only</option>
          <option value="variance">Variance only</option>
          <option value="sum">Sum only</option>
          <option value="count">Count only</option>
          <option value="min">Minimum only</option>
          <option value="max">Maximum only</option>
        </select>
      </div>

      {stats && (
        <div
          data-testid="tool-output"
          onClick={copy}
          className="cursor-pointer rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          {show("count") && <StatRow label="Count (n)" value={String(stats.n)} />}
          {show("sum") && <StatRow label="Sum" value={fmt(stats.sum)} />}
          {show("mean") && <StatRow label="Mean (average)" value={fmt(stats.mean)} highlight />}
          {show("variance") && <StatRow label="Variance (sample, n−1)" value={fmt(stats.variance)} />}
          {show("stddev") && <StatRow label="Std dev (sample, n−1)" value={fmt(stats.stddev)} highlight />}
          {showAll && (
            <>
              <StatRow label="Min" value={fmt(stats.min)} />
              <StatRow label="Max" value={fmt(stats.max)} />
              <StatRow label="Range" value={fmt(stats.max - stats.min)} />
            </>
          )}
          <p className="mt-3 text-[10px] text-surface-500 dark:text-dark-muted">
            Sample variance uses n−1 (Bessel&apos;s correction). Click to copy.
          </p>
        </div>
      )}

      {!stats && (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter at least one number to compute statistics.
        </p>
      )}
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-surface-100 py-1.5 last:border-b-0 dark:border-dark-border">
      <span className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">
        {label}
      </span>
      <span
        className={
          highlight
            ? "font-mono text-lg font-bold text-surface-900 dark:text-dark-text"
            : "font-mono text-sm text-surface-900 dark:text-dark-text"
        }
      >
        {value}
      </span>
    </div>
  );
}
