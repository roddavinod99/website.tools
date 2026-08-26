"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, PercentInput } from "@/components/finance/inputs";
import { savingsGoal } from "@/lib/finance/calculations";
import { formatMoney, formatDurationMonths, formatDate } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function DownPaymentPlanner() {
  const { currency, setCurrency } = useCurrency();
  const [target, setTarget] = useState("40000");
  const [current, setCurrent] = useState("10000");
  const [monthly, setMonthly] = useState("500");
  const [rate, setRate] = useState("4");

  const result = useMemo(() => {
    const t = parseInput(target);
    const c = parseInput(current);
    const m = parseInput(monthly);
    const r = parseInput(rate);
    if (isNaN(t) || isNaN(c) || t <= 0) return null;
    const res = savingsGoal(
      t,
      isNaN(c) ? 0 : c,
      isNaN(m) ? 0 : m,
      isNaN(r) ? 0 : r,
      null
    );
    return res;
  }, [target, current, monthly, rate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Down payment goal" value={target} onChange={setTarget} currency={currency} />
        <MoneyInput label="Current savings" value={current} onChange={setCurrent} currency={currency} />
        <MoneyInput label="Monthly savings" value={monthly} onChange={setMonthly} currency={currency} hint="What you plan to save each month" />
        <Field label="Annual interest on savings">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Annual interest on savings" />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          {result.monthsToGoal < Infinity ? (
            <>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Time to reach your goal</p>
                <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatDurationMonths(result.monthsToGoal)}</p>
                {result.targetDate && <p className="mt-1 text-xs text-surface-500 dark:text-dark-muted">Reached around {formatDate(result.targetDate)}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Final balance</p>
                  <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.finalBalance, currency)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Interest earned</p>
                  <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.interestEarned, currency)}</p>
                </div>
                {result.targetDate && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Monthly needed if slower</p>
                    <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.requiredMonthly, currency)}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              At the current monthly savings, you will never reach the goal. Increase your monthly amount.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a down payment goal to plan your savings schedule.
        </p>
      )}
    </div>
  );
}