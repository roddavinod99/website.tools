"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput } from "@/components/finance/inputs";
import { loanScheduleTotals } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function StudentLoanCalculator() {
  const [principal, setPrincipal] = useState("30000");
  const [rate, setRate] = useState("5.05");
  const [years, setYears] = useState("10");

  const result = useMemo(() => {
    const p = parseInput(principal);
    const r = parseInput(rate);
    const y = parseInput(years);
    if (isNaN(p) || isNaN(y) || p <= 0 || y <= 0) return null;
    const months = Math.round(y * 12);
    const totals = loanScheduleTotals(p, isNaN(r) ? 0 : r, months);
    if (!totals) return null;
    return {
      emi: totals.emi,
      totalPaid: totals.totalPaid,
      totalInterest: totals.totalInterest,
      months: totals.months,
      startPrincipal: p,
    };
  }, [principal, rate, years]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Total loan balance" value={principal} onChange={setPrincipal} prefix="$" hint="Combine all federal and private loans" />
        <Field label="Average interest rate">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Average interest rate" />
        </Field>
        <Field label="Repayment term">
          <NumberInput ariaLabel="Repayment term in years" value={years} onChange={setYears} suffix="years" placeholder="10" />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Monthly payment</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.emi)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total paid</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.totalPaid)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total interest</p>
              <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">{formatMoney(result.totalInterest)}</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 dark:text-dark-muted">
            Standard repayment only. Income-driven, forgiveness, and forbearance options change the numbers.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter your total loan balance and term to estimate the monthly payment.
        </p>
      )}
    </div>
  );
}