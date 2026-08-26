"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, SelectField } from "@/components/finance/inputs";
import { calculateUsTax } from "@/lib/finance/calculations";
import { formatMoney, formatNumber, formatPercent } from "@/lib/finance/format";

type TaxStatus = "single" | "mfj" | "hoh";

const STATUS_OPTIONS: { value: TaxStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "mfj", label: "Married Filing Jointly" },
  { value: "hoh", label: "Head of Household" },
];

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function UsIncomeTaxCalculator() {
  const [income, setIncome] = useState("75000");
  const [status, setStatus] = useState<TaxStatus>("single");

  const result = useMemo(() => {
    const i = parseInput(income);
    if (isNaN(i) || i <= 0) return null;
    return calculateUsTax(i, status);
  }, [income, status]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Annual gross income" value={income} onChange={setIncome} currency="USD" placeholder="75,000" />
        <Field label="Filing status">
          <SelectField<TaxStatus>
            value={status}
            onChange={setStatus}
            ariaLabel="Filing status"
            options={STATUS_OPTIONS}
          />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Federal income tax</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.totalTax)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Effective tax rate</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatPercent(result.effectiveRate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Marginal tax rate</p>
              <p className="mt-1 text-xl font-semibold text-brand-600 dark:text-brand-400">{formatPercent(result.marginalRate * 100)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Taxable income</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.taxableIncome)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Standard deduction</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.standardDeduction)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Effective on gross</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatPercent((result.totalTax / result.grossIncome) * 100)}</p>
            </div>
          </div>

          {result.brackets.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-bg">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-200 text-xs uppercase tracking-wide text-surface-500 dark:border-dark-border dark:text-dark-muted">
                    <th className="px-3 py-2 font-medium">Rate</th>
                    <th className="px-3 py-2 font-medium">Income range</th>
                    <th className="px-3 py-2 font-medium">Taxed amount</th>
                    <th className="px-3 py-2 font-medium">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {result.brackets.map((row, i) => (
                    <tr key={i} className="border-b border-surface-100 dark:border-dark-border">
                      <td className="px-3 py-2 font-mono text-surface-900 dark:text-dark-text">{formatPercent(row.bracket.rate * 100)}</td>
                      <td className="px-3 py-2 text-surface-600 dark:text-dark-muted">
                        {formatMoney(row.bracket.min)} – {row.bracket.max === Infinity ? "above" : formatMoney(row.bracket.max)}
                      </td>
                      <td className="px-3 py-2 text-surface-600 dark:text-dark-muted">{formatNumber(row.taxableInBracket)}</td>
                      <td className="px-3 py-2 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(row.taxInBracket)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-surface-500 dark:text-dark-muted">
            Taxes 2025 US federal brackets and the standard deduction only. Does not include state taxes, credits, itemized deductions, or FICA.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter an annual gross income to estimate federal income tax.
        </p>
      )}
    </div>
  );
}