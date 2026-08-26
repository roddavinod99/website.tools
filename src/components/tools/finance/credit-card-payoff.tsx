"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, PercentInput } from "@/components/finance/inputs";
import { creditCardPayoff } from "@/lib/finance/calculations";
import { formatMoney, formatDurationMonths } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function CreditCardPayoff() {
  const { currency, setCurrency } = useCurrency();
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("19.99");
  const [payment, setPayment] = useState("200");

  const result = useMemo(() => {
    const b = parseInput(balance);
    const a = parseInput(apr);
    const p = parseInput(payment);
    if (isNaN(b) || isNaN(p) || b <= 0 || p <= 0) return null;
    const r = creditCardPayoff(b, isNaN(a) ? 0 : a, p);
    if (!r) return null;
    return r;
  }, [balance, apr, payment]);

  const interestOnly = useMemo(() => {
    const b = parseInput(balance);
    const a = parseInput(apr);
    if (isNaN(b) || isNaN(a) || b <= 0) return 0;
    return (b * a) / 100 / 12;
  }, [balance, apr]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector value={currency} onChange={setCurrency} ariaLabel="Select currency" />
        <MoneyInput label="Current balance" value={balance} onChange={setBalance} currency={currency} placeholder="5,000" />
        <Field label="Annual APR">
          <PercentInput value={apr} onChange={setApr} ariaLabel="Annual APR" />
        </Field>
        <MoneyInput
          label="Monthly payment"
          value={payment}
          onChange={setPayment}
          currency={currency}
          hint={`Monthly interest alone is about ${formatMoney(interestOnly, currency)}`}
        />
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Payoff time</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatDurationMonths(result.months)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total interest</p>
              <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">{formatMoney(result.totalInterest, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Total paid</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.totalPaid, currency)}</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 dark:text-dark-muted">
            Assumes a fixed monthly payment and no new purchases. If your payment only covers the monthly interest, you will never pay the balance off.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a balance and a monthly payment above the monthly interest to see the payoff plan.
        </p>
      )}
    </div>
  );
}