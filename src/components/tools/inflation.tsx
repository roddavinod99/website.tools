"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput } from "@/components/finance/inputs";
import { inflation } from "@/lib/finance/calculations";
import { formatMoney, formatPercent } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function InflationCalculator() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("3");
  const [years, setYears] = useState("10");

  const result = useMemo(() => {
    const a = parseInput(amount);
    const r = parseInput(rate);
    const y = parseInput(years);
    if (isNaN(a) || isNaN(y) || a <= 0 || y <= 0) return null;
    return inflation(a, isNaN(r) ? 0 : r, y);
  }, [amount, rate, years]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Amount" value={amount} onChange={setAmount} prefix="$" />
        <Field label="Annual inflation rate">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Annual inflation rate" />
        </Field>
        <Field label="Years">
          <NumberInput ariaLabel="Years" value={years} onChange={setYears} suffix="years" placeholder="10" />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Purchasing power loss</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{formatPercent(result.lossPct)}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Equivalent to today</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.todayValue)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Would cost in the future</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.futureValue)}</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 dark:text-dark-muted">
            In {years || "10"} years at {rate || "0"}% inflation, {formatMoney(amount ? parseFloat(amount) : 0)} today buys as much as {formatMoney(result.todayValue)} buys today.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter an amount and years to see the effect of inflation.
        </p>
      )}
    </div>
  );
}