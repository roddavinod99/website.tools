"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput, SelectField } from "@/components/finance/inputs";
import { compoundFutureValue, type ContributionTiming } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";
import { usePrefillTool } from "@/lib/load-example";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function CompoundInterestCalculator() {
  const { currency, setCurrency } = useCurrency("compound-interest-calculator");
  const [principal, setPrincipal] = useState("10000");
  const [monthly, setMonthly] = useState("500");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");
  const [timing, setTiming] = useState<ContributionTiming>("annuityDue");

  // Long-tail landing pages (PR 5 of PLAN.md) prefill the calculator
  // with { principal, monthly, rate, years, timing } so e.g.
  // /finance/compound-10000-10y-7pct-monthly-500 lands with the
  // projection computed immediately.
  usePrefillTool("compound-interest-calculator", (prefill) => {
    if (prefill.principal) setPrincipal(prefill.principal);
    if (prefill.monthly) setMonthly(prefill.monthly);
    if (prefill.rate) setRate(prefill.rate);
    if (prefill.years) setYears(prefill.years);
    if (prefill.timing === "annuity" || prefill.timing === "annuityDue") {
      setTiming(prefill.timing);
    }
  });

  const result = useMemo(() => {
    const p = parseInput(principal);
    const m = parseInput(monthly);
    const r = parseInput(rate);
    const y = parseInput(years);
    if (isNaN(p) || isNaN(m) || isNaN(y)) return null;
    const future = compoundFutureValue(p, m, r, y, 12, timing);
    const totalContributions = p + m * 12 * y;
    return {
      future,
      totalContributions,
      interest: Math.max(0, future - totalContributions),
      rate: r,
    };
  }, [principal, monthly, rate, years, timing]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Initial amount" value={principal} onChange={setPrincipal} currency={currency} />
        <MoneyInput label="Monthly contribution" value={monthly} onChange={setMonthly} currency={currency} />
        <Field label="Annual interest rate">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Annual interest rate" />
        </Field>
        <Field label="Investment period">
          <NumberInput
            ariaLabel="Investment period in years"
            value={years}
            onChange={setYears}
            suffix="years"
            placeholder="10"
          />
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
          className="rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Matured value</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.future, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total invested</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.totalContributions, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Interest earned</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.interest, currency)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-surface-500 dark:text-dark-muted">
            Compounding monthly at {result.rate}% p.a. for {years} years. Projection only, not financial advice.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a positive initial amount, contribution, and period to see the projection.
        </p>
      )}
    </div>
  );
}