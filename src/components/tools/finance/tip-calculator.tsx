"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput } from "@/components/finance/inputs";
import { tipCalculator } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function TipCalculator() {
  const { currency, setCurrency } = useCurrency();
  const [bill, setBill] = useState("100");
  const [tipPct, setTipPct] = useState("18");
  const [people, setPeople] = useState("1");

  const result = useMemo(() => {
    const b = parseInput(bill);
    const t = parseInput(tipPct);
    const p = Math.round(parseInput(people));
    if (isNaN(b) || isNaN(p) || b <= 0 || p < 1) return null;
    return tipCalculator(b, isNaN(t) ? 0 : t, p);
  }, [bill, tipPct, people]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Bill amount" value={bill} onChange={setBill} currency={currency} />
        <Field label="Tip percentage">
          <PercentInput value={tipPct} onChange={setTipPct} ariaLabel="Tip percentage" />
        </Field>
        <Field label="Split between">
          <NumberInput ariaLabel="Number of people" value={people} onChange={setPeople} suffix="people" placeholder="1" />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="grid gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 sm:grid-cols-3 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Tip amount</p>
            <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.tipAmount, currency)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total with tip</p>
            <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.total, currency)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Per person</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.perPerson, currency)}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a bill amount to calculate the tip and split.
        </p>
      )}
    </div>
  );
}