"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput } from "@/components/finance/inputs";
import { loanAmountForPayment } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function HomeAffordabilityCalculator() {
  const { currency, setCurrency } = useCurrency();
  const [income, setIncome] = useState("90000");
  const [monthlyDebt, setMonthlyDebt] = useState("0");
  const [downPayment, setDownPayment] = useState("40000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [maxDti, setMaxDti] = useState("36");

  const result = useMemo(() => {
    const inc = parseInput(income);
    const debt = parseInput(monthlyDebt);
    const dp = parseInput(downPayment);
    const r = parseInput(rate);
    const y = parseInput(years);
    const dti = parseInput(maxDti);
    if (isNaN(inc) || isNaN(dp) || isNaN(y) || inc <= 0) return null;
    const months = Math.round(y * 12);
    const monthlyIncome = inc / 12;
    const allowedDebt = monthlyIncome * (isNaN(dti) || dti <= 0 ? 0.36 : dti / 100);
    const housingBudget = Math.max(0, allowedDebt - (isNaN(debt) ? 0 : debt));
    const loanPrincipal = loanAmountForPayment(housingBudget, isNaN(r) ? 0 : r, months);
    const affordablePrice = loanPrincipal + dp;
    return {
      housingBudget,
      loanPrincipal,
      affordablePrice,
      months,
    };
  }, [income, monthlyDebt, downPayment, rate, years, maxDti]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Annual household income" value={income} onChange={setIncome} currency={currency} />
        <MoneyInput label="Other monthly debt payments" value={monthlyDebt} onChange={setMonthlyDebt} currency={currency} hint="Cards, auto, student loans" />
        <MoneyInput label="Down payment available" value={downPayment} onChange={setDownPayment} currency={currency} />
        <Field label="Mortgage rate">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Mortgage rate" />
        </Field>
        <Field label="Term">
          <NumberInput ariaLabel="Term in years" value={years} onChange={setYears} suffix="years" placeholder="30" />
        </Field>
        <Field label="Max debt-to-income you want to allow">
          <PercentInput value={maxDti} onChange={setMaxDti} ariaLabel="Maximum debt-to-income" />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Affordable home price</p>
            <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.affordablePrice, currency)}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Financed amount</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.loanPrincipal, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Monthly housing budget</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.housingBudget, currency)}</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 dark:text-dark-muted">
            Based on the max debt-to-income you allow. Property taxes, insurance, and HOA are not counted.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter your income to estimate an affordable home price.
        </p>
      )}
    </div>
  );
}