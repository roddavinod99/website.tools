"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { breakEven } from "@/lib/finance/calculations";
import { formatMoney, formatNumber } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function BreakEven() {
  const [fixedCosts, setFixedCosts] = useState("50000");
  const [variableCost, setVariableCost] = useState("15");
  const [price, setPrice] = useState("40");

  const result = useMemo(() => {
    const f = parseInput(fixedCosts);
    const v = parseInput(variableCost);
    const p = parseInput(price);
    if (isNaN(f) || isNaN(v) || isNaN(p) || v >= p) return null;
    const res = breakEven(f, v, p);
    return Number.isFinite(res.breakEvenUnits) ? { ...res, marginPct: ((p - v) / p) * 100 } : null;
  }, [fixedCosts, variableCost, price]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Fixed costs" value={fixedCosts} onChange={setFixedCosts} prefix="$" hint="Rent, salaries, insurance — costs that don't change with volume" />
        <MoneyInput label="Variable cost per unit" value={variableCost} onChange={setVariableCost} prefix="$" hint="Materials and labor per item sold" />
        <MoneyInput label="Selling price per unit" value={price} onChange={setPrice} prefix="$" />
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Break-even units</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatNumber(result.breakEvenUnits)} units</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Break-even revenue</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.breakEvenRevenue)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Contribution margin</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.contributionMarginPerUnit)} per unit</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 dark:text-dark-muted">
            The contribution margin per unit is {formatMoney(result.contributionMarginPerUnit)} — about {result.marginPct.toFixed(1)}% of the selling price. Any sale above the break-even point contributes that amount to profit.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter fixed costs, variable cost, and price. Selling price must exceed variable cost to break even.
        </p>
      )}
    </div>
  );
}