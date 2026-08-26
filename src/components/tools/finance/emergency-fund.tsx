"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput } from "@/components/finance/inputs";
import { emergencyFund } from "@/lib/finance/calculations";
import { formatMoney, formatNumber } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function EmergencyFundCalculator() {
  const { currency, setCurrency } = useCurrency();
  const [expenses, setExpenses] = useState("4000");
  const [savings, setSavings] = useState("20000");
  const [targetMonths, setTargetMonths] = useState("6");

  const result = useMemo(() => {
    const e = parseInput(expenses);
    const s = parseInput(savings);
    const m = Math.round(parseInput(targetMonths));
    if (isNaN(e) || e <= 0 || isNaN(m) || m < 1) return null;
    return emergencyFund(e, isNaN(s) ? 0 : s, m);
  }, [expenses, savings, targetMonths]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Monthly expenses" value={expenses} onChange={setExpenses} currency={currency} hint="Rent, food, utilities, insurance, minimum payments" />
        <MoneyInput label="Emergency fund balance" value={savings} onChange={setSavings} currency={currency} />
        <Field label="Target emergency fund">
          <NumberInput ariaLabel="Target months of expenses" value={targetMonths} onChange={setTargetMonths} suffix="months" placeholder="6" />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Covered by current savings</p>
            <p className={`mt-1 text-3xl font-bold ${result.onTrack ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {formatNumber(result.monthsCovered, "en-US", 1)} months
            </p>
            <p className="mt-1 text-sm text-surface-600 dark:text-dark-muted">
              {result.onTrack ? "Your fund meets the target" : "Keep building toward your target"}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Monthly expenses</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(parseFloat(expenses) || 0, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Target amount ({result.monthsGoal} months)</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.targetAmount, currency)}</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 dark:text-dark-muted">
            A common guideline is to hold 3-6 months of expenses in liquid, low-risk savings.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter your monthly expenses to check your emergency fund coverage.
        </p>
      )}
    </div>
  );
}