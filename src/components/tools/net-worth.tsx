"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { netWorth } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function NetWorthCalculator() {
  const [assets, setAssets] = useState("500000");
  const [liabilities, setLiabilities] = useState("200000");

  const result = useMemo(() => {
    const a = parseInput(assets);
    const l = parseInput(liabilities);
    return netWorth(isNaN(a) ? 0 : a, isNaN(l) ? 0 : l);
  }, [assets, liabilities]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Total assets" value={assets} onChange={setAssets} prefix="$" hint="Home value, cash, investments, retirement" />
        <MoneyInput label="Total liabilities" value={liabilities} onChange={setLiabilities} prefix="$" hint="Mortgage, loans, credit card balances" />
      </div>

      <div
        data-testid="tool-output"
        className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Net worth</p>
          <p className={`mt-1 text-3xl font-bold ${result.netWorth >= 0 ? "text-surface-900 dark:text-dark-text" : "text-red-600 dark:text-red-400"}`}>
            {formatMoney(result.netWorth)}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Assets</p>
            <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.totalAssets)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Liabilities</p>
            <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.totalLiabilities)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}