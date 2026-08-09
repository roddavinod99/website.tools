"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, PercentInput } from "@/components/finance/inputs";
import { salesTax } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function SalesTaxCalculator() {
  const [amount, setAmount] = useState("100");
  const [rate, setRate] = useState("8");

  const result = useMemo(() => {
    const a = parseInput(amount);
    const r = parseInput(rate);
    if (isNaN(a) || isNaN(r) || a <= 0) return null;
    return salesTax(a, r);
  }, [amount, rate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Pre-tax amount" value={amount} onChange={setAmount} prefix="$" />
        <Field label="Sales tax rate">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Sales tax rate" />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="grid gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 sm:grid-cols-3 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Tax amount</p>
            <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.taxAmount)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total with tax</p>
            <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.totalWithTax)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Pre-tax amount</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(amount ? parseFloat(amount) : 0)}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a pre-tax amount to calculate the sales tax.
        </p>
      )}
    </div>
  );
}