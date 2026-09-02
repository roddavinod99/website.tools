"use client";

import { useState, useMemo, useCallback } from "react";
import { usePrefillTool } from "@/lib/load-example";

/**
 * Discount Calculator — pure browser implementation, 100% client-side.
 *
 * Accepts a comma- or newline-separated list of discount percentages
 * and applies them in sequence to a starting price. The math is:
 *
 *   final = price × ∏(1 - d_i/100)
 *   saved = price − final
 *   effective = 100 × (1 − final/price)
 *
 * This matches the real-world "stack coupons" question: a 20% off
 * coupon on a 30% off sale item doesn't equal 50% off — it equals
 * 44% off (1 − 0.8 × 0.7 = 0.44).
 */

function parsePercents(raw: string): number[] {
  return raw
    .split(/[\s,;\n\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => parseFloat(s.replace(/%/g, "")))
    .filter((n) => Number.isFinite(n));
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Number(n.toPrecision(12)).toString();
}

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function DiscountCalculator() {
  const [price, setPrice] = useState("100");
  const [raw, setRaw] = useState("20");

  // Long-tail landing pages (PR 6 of PLAN.md) prefill the calculator
  // with { price, discounts }, e.g. /discount/30-off-100.
  usePrefillTool("discount-calculator", (prefill) => {
    if (prefill.price) setPrice(prefill.price);
    if (prefill.discounts) setRaw(prefill.discounts);
  });

  const result = useMemo(() => {
    const p = parseFloat(price);
    const ds = parsePercents(raw);
    if (!Number.isFinite(p) || p < 0 || ds.length === 0) return null;
    let running = p;
    const steps: { d: number; subtotal: number; saved: number }[] = [];
    for (const d of ds) {
      if (d < 0 || d > 100) continue;
      const before = running;
      running = running * (1 - d / 100);
      steps.push({ d, subtotal: running, saved: before - running });
    }
    if (steps.length === 0) return null;
    return {
      final: running,
      saved: p - running,
      effective: p > 0 ? 100 * (1 - running / p) : 0,
      steps,
      original: p,
    };
  }, [price, raw]);

  const reset = useCallback(() => {
    setPrice("100");
    setRaw("20");
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="disc-price"
            className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1"
          >
            Original price
          </label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-surface-200 bg-surface-50 px-3 text-sm text-surface-500 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
              $
            </span>
            <input
              id="disc-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="any"
              className="w-full rounded-r-lg border border-surface-200 bg-white p-2.5 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="disc-list"
            className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1"
          >
            Discounts (in order, comma- or newline-separated)
          </label>
          <input
            id="disc-list"
            type="text"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="20, 10"
            data-testid="disc-input"
            className="w-full rounded-lg border border-surface-200 bg-white p-2.5 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
        </div>
      </div>

      {result && (
        <div
          data-testid="tool-output"
          className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Final price</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{fmtMoney(result.final)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">You save</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{fmtMoney(result.saved)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Effective</p>
              <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">{fmt(result.effective)}% off</p>
            </div>
          </div>

          {result.steps.length > 1 && (
            <div className="mt-4 border-t border-surface-200 pt-3 dark:border-dark-border">
              <p className="text-[10px] font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">
                Step-by-step (applied in order)
              </p>
              <ul className="mt-2 space-y-1 font-mono text-xs text-surface-600 dark:text-dark-muted">
                <li>Original: {fmtMoney(result.original)}</li>
                {result.steps.map((s, i) => (
                  <li key={i}>
                    {i === 0 ? "First" : i === result.steps.length - 1 ? "Final" : `Step ${i + 1}`}: −{fmt(s.d)}% → {fmtMoney(s.subtotal)} (saves {fmtMoney(s.saved)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!result && (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a positive price and at least one discount percentage.
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-surface-400 dark:text-dark-muted">
          Stacked discounts multiply, not add. A 20% + 10% stack is 28% off, not 30%.
        </p>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-surface-500 underline hover:text-brand-500 dark:text-dark-muted"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
