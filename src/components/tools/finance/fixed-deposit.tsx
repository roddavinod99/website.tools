"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput, SelectField } from "@/components/finance/inputs";
import { lumpSumFutureValue } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

type CompoundFreq = "12" | "4" | "1";

const COMPOUND_OPTIONS: { value: CompoundFreq; label: string }[] = [
  { value: "12", label: "Monthly" },
  { value: "4", label: "Quarterly" },
  { value: "1", label: "Annually" },
];

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function FixedDepositCalculator() {
  const { currency, setCurrency } = useCurrency();
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("5");
  const [freq, setFreq] = useState<CompoundFreq>("12");

  const result = useMemo(() => {
    const p = parseInput(principal);
    const r = parseInput(rate);
    const y = parseInput(years);
    if (isNaN(p) || isNaN(y) || p <= 0 || y <= 0) return null;
    const freqNum = parseInt(freq, 10);
    const future = lumpSumFutureValue(p, isNaN(r) ? 0 : r, y, freqNum);
    return {
      future,
      principal: p,
      interest: Math.max(0, future - p),
    };
  }, [principal, rate, years, freq]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Deposit amount" value={principal} onChange={setPrincipal} currency={currency} />
        <Field label="Annual interest rate">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Annual interest rate" />
        </Field>
        <Field label="Tenure">
          <NumberInput ariaLabel="Tenure in years" value={years} onChange={setYears} suffix="years" placeholder="5" />
        </Field>
        <Field label="Compounding frequency">
          <SelectField<CompoundFreq>
            value={freq}
            onChange={setFreq}
            ariaLabel="Compounding frequency"
            options={COMPOUND_OPTIONS}
          />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="grid gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 sm:grid-cols-3 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Maturity value</p>
            <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.future, currency)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Deposited</p>
            <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.principal, currency)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Interest earned</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.interest, currency)}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a deposit amount and tenure to see the maturity value.
        </p>
      )}
    </div>
  );
}