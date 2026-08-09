"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, SelectField } from "@/components/finance/inputs";
import { debtPayoff, type DebtEntry } from "@/lib/finance/calculations";
import { formatMoney, formatDurationMonths } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

interface DebtRow {
  name: string;
  balance: string;
  apr: string;
  min: string;
}

function toEntries(rows: DebtRow[]): DebtEntry[] {
  return rows.map((r) => ({
    name: r.name.trim() || "Debt",
    balance: parseInput(r.balance),
    apr: parseInput(r.apr),
    minPayment: parseInput(r.min),
  }));
}

export function DebtPayoff() {
  const [debts, setDebts] = useState<DebtRow[]>([
    { name: "Card A", balance: "4000", apr: "18.99", min: "100" },
    { name: "Loan B", balance: "8000", apr: "7.5", min: "150" },
  ]);
  const [budget, setBudget] = useState("500");
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("snowball");

  const updateDebt = (i: number, patch: Partial<DebtRow>) => {
    setDebts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };

  const result = useMemo(() => {
    const b = parseInput(budget);
    if (isNaN(b) || b <= 0) return null;
    return debtPayoff(toEntries(debts), strategy, b);
  }, [debts, budget, strategy]);

  const monthlyTotal = useMemo(() => {
    const entries = toEntries(debts);
    return entries.reduce((sum, d) => sum + (isNaN(d.minPayment) ? 0 : d.minPayment), 0);
  }, [debts]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput
          label="Monthly payment budget"
          value={budget}
          onChange={setBudget}
          prefix="$"
          hint={`Sum of current minimums: ${formatMoney(monthlyTotal)}`}
        />
        <Field label="Strategy">
          <SelectField<"snowball" | "avalanche">
            value={strategy}
            onChange={setStrategy}
            ariaLabel="Debt payoff strategy"
            options={[
              { value: "snowball", label: "Snowball (smallest balance first)" },
              { value: "avalanche", label: "Avalanche (highest APR first)" },
            ]}
          />
        </Field>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-surface-700 dark:text-dark-text">Debts</p>
        {debts.map((debt, i) => (
          <div
            key={i}
            className="grid gap-3 rounded-xl border border-surface-200 bg-white p-4 sm:grid-cols-4 dark:border-dark-border dark:bg-dark-surface"
          >
            <Field label="Name">
              <input
                type="text"
                value={debt.name}
                onChange={(e) => updateDebt(i, { name: e.target.value })}
                aria-label={`Debt ${i + 1} name`}
                className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-900 focus-ring dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
              />
            </Field>
            <Field label="Balance">
              <NumberInput
                ariaLabel={`Debt ${i + 1} balance`}
                value={debt.balance}
                onChange={(v) => updateDebt(i, { balance: v })}
                suffix="$"
                placeholder="5000"
              />
            </Field>
            <Field label="APR">
              <NumberInput ariaLabel={`Debt ${i + 1} APR`} value={debt.apr} onChange={(v) => updateDebt(i, { apr: v })} suffix="%" placeholder="15" />
            </Field>
            <Field label="Min payment">
              <NumberInput
                ariaLabel={`Debt ${i + 1} minimum payment`}
                value={debt.min}
                onChange={(v) => updateDebt(i, { min: v })}
                suffix="$"
                placeholder="100"
              />
            </Field>
          </div>
        ))}
        <p className="text-xs text-surface-400 dark:text-dark-muted">
          Paid-off debts are ignored automatically. Focus any extra budget on the target debt each month.
        </p>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Time to debt-free</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatDurationMonths(result.months)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total interest paid</p>
              <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">{formatMoney(result.totalInterest)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Payoff order</p>
              <p className="mt-1 text-sm font-semibold text-surface-700 dark:text-dark-text">{result.order.join(" → ")}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter your debts and a monthly budget that covers at least the minimum payments.
        </p>
      )}
    </div>
  );
}