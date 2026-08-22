"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { dtiRatio } from "@/lib/finance/calculations";
import { formatMoney, formatPercent } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

function dtiCategory(pct: number): { label: string; tone: string } {
  if (pct < 0) return { label: "", tone: "" };
  if (pct < 36) return { label: "Healthy range", tone: "text-emerald-600 dark:text-emerald-400" };
  if (pct < 43) return { label: "Watch your budget", tone: "text-amber-600 dark:text-amber-400" };
  return { label: "High — limits options", tone: "text-red-600 dark:text-red-400" };
}

export function DebtToIncome() {
  const { currency, setCurrency } = useCurrency();
  const [debts, setDebts] = useState("1500");
  const [income, setIncome] = useState("5000");

  const result = useMemo(() => {
    const d = parseInput(debts);
    const i = parseInput(income);
    if (isNaN(d) || isNaN(i) || i <= 0) return null;
    const pct = dtiRatio(d, i);
    return { dti: pct, debt: d, income: i };
  }, [debts, income]);

  const tone = result ? dtiCategory(result.dti) : { label: "", tone: "" };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Total monthly debt payments" value={debts} onChange={setDebts} currency={currency} hint="Mortgage, car, cards, student loans, etc." />
        <MoneyInput label="Gross monthly income" value={income} onChange={setIncome} currency={currency} hint="Income before taxes and deductions" />
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Debt-to-income ratio</p>
            <p className={`mt-1 text-3xl font-bold ${tone.tone}`}>{formatPercent(result.dti)}</p>
            {tone.label && <p className={`mt-1 text-sm font-medium ${tone.tone}`}>{tone.label}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Monthly debt</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.debt, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Monthly income</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.income, currency)}</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 dark:text-dark-muted">
            Lenders commonly prefer a ratio below 43%. Some prefer 36% or less including a new home payment.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter your monthly debt payments and gross income to calculate the ratio.
        </p>
      )}
    </div>
  );
}