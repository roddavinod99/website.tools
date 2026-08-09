"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { profitMargin } from "@/lib/finance/calculations";
import { formatMoney, formatPercent } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function ProfitMarginCalculator() {
  const [revenue, setRevenue] = useState("1200");
  const [cost, setCost] = useState("850");

  const result = useMemo(() => {
    const r = parseInput(revenue);
    const c = parseInput(cost);
    if (isNaN(r) || isNaN(c) || r <= 0) return null;
    return profitMargin(r, c);
  }, [revenue, cost]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Revenue / selling price" value={revenue} onChange={setRevenue} prefix="$" />
        <MoneyInput label="Cost" value={cost} onChange={setCost} prefix="$" />
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Gross profit</p>
              <p className={`mt-1 text-xl font-semibold ${result.isLoss ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {formatMoney(result.grossProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Profit margin</p>
              <p className={`mt-1 text-2xl font-bold ${result.isLoss ? "text-red-600 dark:text-red-400" : "text-brand-600 dark:text-brand-400"}`}>
                {formatPercent(result.marginPct)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Markup</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">
                {Number.isFinite(result.markupPct) ? formatPercent(result.markupPct) : "—"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter revenue and cost to calculate margins.
        </p>
      )}
    </div>
  );
}