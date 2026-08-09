"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput } from "@/components/finance/inputs";
import { recurringFutureValue } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function RecurringDepositCalculator() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("5");

  const result = useMemo(() => {
    const m = parseInput(monthly);
    const r = parseInput(rate);
    const y = parseInput(years);
    if (isNaN(m) || isNaN(y) || m <= 0 || y <= 0) return null;
    const future = recurringFutureValue(m, isNaN(r) ? 0 : r, y, 12, "annuityDue");
    const invested = m * y * 12;
    return {
      future,
      invested,
      interest: Math.max(0, future - invested),
    };
  }, [monthly, rate, years]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Monthly deposit" value={monthly} onChange={setMonthly} prefix="$" />
        <Field label="Annual interest rate">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Annual interest rate" />
        </Field>
        <Field label="Tenure">
          <NumberInput ariaLabel="Tenure in years" value={years} onChange={setYears} suffix="years" placeholder="5" />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="grid gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 sm:grid-cols-3 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Maturity value</p>
            <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.future)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total deposited</p>
            <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.invested)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Interest earned</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.interest)}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a monthly deposit and tenure to see the maturity value.
        </p>
      )}
    </div>
  );
}