"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput } from "@/components/finance/inputs";
import { loanScheduleTotals } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function MortgagePayoff() {
  const { currency, setCurrency } = useCurrency("mortgage-payoff");
  const [principal, setPrincipal] = useState("350000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");

  const result = useMemo(() => {
    const p = parseInput(principal);
    const r = parseInput(rate);
    const y = parseInput(years);
    if (isNaN(p) || isNaN(y) || p <= 0 || y <= 0) return null;
    const months = Math.round(y * 12);
    const totals = loanScheduleTotals(p, isNaN(r) ? 0 : r, months);
    if (!totals) return null;
    const last = totals.schedule[totals.schedule.length - 1];
    return {
      emi: totals.emi,
      totalPaid: totals.totalPaid,
      totalInterest: totals.totalInterest,
      months: totals.months,
      finalBalance: last?.balance ?? 0,
    };
  }, [principal, rate, years]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Home price" value={principal} onChange={setPrincipal} currency={currency} />
        <Field label="Annual interest rate">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Annual interest rate" />
        </Field>
        <Field label="Mortgage term">
          <NumberInput
            ariaLabel="Mortgage term in years"
            value={years}
            onChange={setYears}
            suffix="years"
            placeholder="30"
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
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Monthly payment</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.emi, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total interest</p>
              <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">{formatMoney(result.totalInterest, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Payoff term</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{result.months} months</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-surface-500 dark:text-dark-muted">
            Estimated fixed-rate mortgage. Does not include tax, insurance, or homeowners&apos; association fees.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a home price and term to estimate your mortgage payment.
        </p>
      )}
    </div>
  );
}