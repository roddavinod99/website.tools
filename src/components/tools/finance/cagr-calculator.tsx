"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput } from "@/components/finance/inputs";
import { cagr } from "@/lib/finance/calculations";
import { formatMoney, formatPercent } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function CagrCalculator() {
  const { currency, setCurrency } = useCurrency("cagr-calculator");
  const [begin, setBegin] = useState("1000");
  const [end, setEnd] = useState("2100");
  const [years, setYears] = useState("5");

  const result = useMemo(() => {
    const b = parseInput(begin);
    const e = parseInput(end);
    const y = parseInput(years);
    if (isNaN(b) || isNaN(e) || isNaN(y) || b <= 0 || y <= 0) return null;
    const rate = cagr(b, e, y);
    return {
      rate,
      begin: b,
      end: e,
      years: y,
      gain: e - b,
    };
  }, [begin, end, years]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Beginning value" value={begin} onChange={setBegin} currency={currency} />
        <MoneyInput label="Ending value" value={end} onChange={setEnd} currency={currency} />
        <Field label="Holding period">
          <NumberInput
            ariaLabel="Holding period in years"
            value={years}
            onChange={setYears}
            suffix="years"
            placeholder="5"
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
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">CAGR</p>
              <p className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">{formatPercent(result.rate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Net gain</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.gain, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Period</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{result.years} years</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a positive beginning value, ending value, and period.
        </p>
      )}
    </div>
  );
}