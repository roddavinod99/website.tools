"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput } from "@/components/finance/inputs";
import { roi } from "@/lib/finance/calculations";
import { formatMoney, formatPercent } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function RoiCalculator() {
  const { currency, setCurrency } = useCurrency("roi-calculator");
  const [invested, setInvested] = useState("10000");
  const [value, setValue] = useState("13500");
  const [years, setYears] = useState("3");

  const result = useMemo(() => {
    const i = parseInput(invested);
    const v = parseInput(value);
    const y = parseInput(years);
    if (isNaN(i) || isNaN(v) || i <= 0) return null;
    const calc = roi(i, v, isNaN(y) ? 0 : y);
    return {
      gain: calc.gain,
      roiPct: calc.roiPct,
      annualizedPct: calc.annualizedPct,
    };
  }, [invested, value, years]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Amount invested" value={invested} onChange={setInvested} currency={currency} />
        <MoneyInput label="Final value" value={value} onChange={setValue} currency={currency} />
        <Field label="Holding period">
          <NumberInput
            ariaLabel="Holding period in years"
            value={years}
            onChange={setYears}
            suffix="years"
            placeholder="3"
          />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Net profit</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.gain, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">ROI</p>
              <p className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">{formatPercent(result.roiPct)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Annualized ROI</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">
                {result.annualizedPct === null ? "—" : formatPercent(result.annualizedPct)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter the amount invested and its final value.
        </p>
      )}
    </div>
  );
}