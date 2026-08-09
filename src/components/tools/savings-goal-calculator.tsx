"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { NumberInput, Field, PercentInput } from "@/components/finance/inputs";
import { savingsGoal } from "@/lib/finance/calculations";
import { formatMoney, formatDurationMonths } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function SavingsGoalCalculator() {
  const [target, setTarget] = useState("50000");
  const [current, setCurrent] = useState("5000");
  const [monthly, setMonthly] = useState("1000");
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState("3");

  const result = useMemo(() => {
    const t = parseInput(target);
    const c = parseInput(current);
    const m = parseInput(monthly);
    const r = parseInput(rate);
    const y = parseInput(years);
    if (isNaN(t) || t <= 0) return null;
    if (isNaN(y) || y <= 0) return null;
    const months = Math.round(y * 12);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);
    const res = savingsGoal(t, c, isNaN(m) ? 0 : m, isNaN(r) ? 0 : r, targetDate);
    return {
      requiredMonthly: res.requiredMonthly,
      monthsToGoal: res.monthsToGoal,
      totalContributions: res.totalContributions,
      interestEarned: res.interestEarned,
      onTrack: res.onTrack,
      targetDate: res.targetDate,
    };
  }, [target, current, monthly, rate, years]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Goal amount" value={target} onChange={setTarget} prefix="$" />
        <MoneyInput label="Current savings" value={current} onChange={setCurrent} prefix="$" />
        <MoneyInput label="Monthly contribution" value={monthly} onChange={setMonthly} prefix="$" />
        <Field label="Expected annual return">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Expected annual return" />
        </Field>
<Field label="Time horizon">
          <NumberInput
            value={years}
            onChange={setYears}
            suffix="years"
            placeholder="3"
            ariaLabel="Time horizon in years"
          />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Required monthly</p>
              <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">{formatMoney(result.requiredMonthly)}</p>
              <p className="mt-1 text-xs text-surface-500 dark:text-dark-muted">
                {result.requiredMonthly <= (parseInput(monthly) || 0) ? "You are on track" : "Need to increase savings"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Time to goal</p>
              <p className="mt-1 text-xl font-semibold text-surface-900 dark:text-dark-text">
                {Number.isFinite(result.monthsToGoal) ? formatDurationMonths(result.monthsToGoal) : "—"}
              </p>
              <p className="mt-1 text-xs text-surface-500 dark:text-dark-muted">
                {result.targetDate ? `Est. by ${new Date(result.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Interest earned</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.interestEarned)}</p>
            </div>
          </div>
          <p className={`mt-4 text-xs ${result.onTrack ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {result.onTrack
              ? "On target for your savings goal with the current monthly contribution."
              : "An increase in monthly savings will be needed to hit this goal on time."}
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a goal amount and time horizon to plan your savings.
        </p>
      )}
    </div>
  );
}