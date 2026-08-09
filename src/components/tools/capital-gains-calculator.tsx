"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, PercentInput } from "@/components/finance/inputs";
import { capitalGainsTax } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function CapitalGainsCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("50000");
  const [salePrice, setSalePrice] = useState("75000");
  const [purchaseCosts, setPurchaseCosts] = useState("500");
  const [sellingCosts, setSellingCosts] = useState("1000");
  const [taxRate, setTaxRate] = useState("15");

  const result = useMemo(() => {
    const pp = parseInput(purchasePrice);
    const sp = parseInput(salePrice);
    const pc = parseInput(purchaseCosts);
    const sc = parseInput(sellingCosts);
    const tr = parseInput(taxRate);
    if (isNaN(pp) || isNaN(sp)) return null;
    return capitalGainsTax(pp, sp, isNaN(pc) ? 0 : pc, isNaN(sc) ? 0 : sc, isNaN(tr) ? 0 : tr);
  }, [purchasePrice, salePrice, purchaseCosts, sellingCosts, taxRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Purchase price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" placeholder="50,000" />
        <MoneyInput label="Sale price" value={salePrice} onChange={setSalePrice} prefix="$" placeholder="75,000" />
        <MoneyInput label="Purchase costs or fees" value={purchaseCosts} onChange={setPurchaseCosts} prefix="$" hint="Commissions, legal fees, etc." />
        <MoneyInput label="Selling costs or fees" value={sellingCosts} onChange={setSellingCosts} prefix="$" hint="Agent commission, closing costs, etc." />
        <Field label="Capital gains tax rate">
          <PercentInput value={taxRate} onChange={setTaxRate} ariaLabel="Capital gains tax rate" />
        </Field>
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="grid gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 sm:grid-cols-3 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Capital gain</p>
            <p className={`mt-1 text-2xl font-bold ${result.capitalGain >= 0 ? "text-surface-900 dark:text-dark-text" : "text-red-600 dark:text-red-400"}`}>
              {formatMoney(result.capitalGain)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Taxable gain</p>
            <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(result.taxableGain)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Estimated tax</p>
            <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">{formatMoney(result.estimatedTax)}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a purchase and sale price to estimate the capital gain.
        </p>
      )}
    </div>
  );
}