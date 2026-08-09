"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput, SelectField } from "@/components/finance/inputs";
import { sipFutureValue, type ContributionTiming } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function SipCalculator() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const [timing, setTiming] = useState<ContributionTiming>("annuityDue");

  const result = useMemo(() => {
    const m = parseInput(monthly);
    const r = parseInput(rate);
    const y = parseInput(years);
    if (isNaN(m) || isNaN(y)) return null;
    const future = sipFutureValue(m, isNaN(r) ? 0 : r, y, timing);
    const invested = m * y * 12;
    return {
      future,
      invested,
      interest: Math.max(0, future - invested),
    };
  }, [monthly, rate, years, timing]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Monthly investment" value={monthly} onChange={setMonthly} prefix="$" />
        <Field label="Expected annual return">
          <PercentInput value={rate} onChange={setRate} ariaLabel="Expected annual return" />
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
          className="grid gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 sm:grid-cols-3 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Matured value</p>
            <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.future)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Invested</p>
            <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.invested)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Est. returns</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.interest)}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a monthly investment and period to see the projection.
        </p>
      )}
    </div>
  );
}