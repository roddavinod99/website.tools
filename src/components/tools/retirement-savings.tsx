"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput, SelectField } from "@/components/finance/inputs";
import { compoundFutureValue, type ContributionTiming } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function RetirementSavingsCalculator() {
  const { currency, setCurrency } = useCurrency();
  const [current, setCurrent] = useState("50000");
  const [monthly, setMonthly] = useState("500");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("30");
  const [timing, setTiming] = useState<ContributionTiming>("annuityDue");

  const result = useMemo(() => {
    const c = parseInput(current);
    const m = parseInput(monthly);
    const r = parseInput(rate);
    const y = parseInput(years);
    if (isNaN(c) || isNaN(m) || isNaN(y) || y <= 0) return null;
    const future = compoundFutureValue(c, m, isNaN(r) ? 0 : r, y, 12, timing);
    const invested = c + m * y * 12;
    return {
      future,
      invested,
      interest: Math.max(0, future - invested),
      monthly: m,
    };
  }, [current, monthly, rate, years, timing]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Current retirement savings" value={current} onChange={setCurrent} currency={currency} />
        <MoneyInput label="Monthly contribution" value={monthly} onChange={setMonthly} currency={currency} />
        <Field label="Expected annual return">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Expected annual return" />
        </Field>
        <Field label="Years to retirement">
          <NumberInput ariaLabel="Years to retirement" value={years} onChange={setYears} suffix="years" placeholder="30" />
        </Field>
        <Field label="Contribution timing">
          <SelectField<ContributionTiming>
            value={timing}
            onChange={setTiming}
            ariaLabel="Contribution timing"
            options={[
              { value: "annuityDue", label: "Start of month" },
              { value: "annuity", label: "End of month" },
            ]}
          />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="grid gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 sm:grid-cols-3 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Projected at retirement</p>
            <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.future, currency)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total you contribute</p>
            <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.invested, currency)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Est. growth</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.interest, currency)}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter your current savings and monthly contribution to project your retirement balance.
        </p>
      )}
    </div>
  );
}