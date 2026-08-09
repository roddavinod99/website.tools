"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, NumberInput, PercentInput } from "@/components/finance/inputs";
import { rentVsBuy, type RentVsBuyParams } from "@/lib/finance/calculations";
import { formatMoney } from "@/lib/finance/format";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

export function RentVsBuy() {
  const [homePrice, setHomePrice] = useState("400000");
  const [downPct, setDownPct] = useState("20");
  const [rent, setRent] = useState("2000");
  const [mortgageRate, setMortgageRate] = useState("6.5");
  const [horizon, setHorizon] = useState("5");
  const [appreciation, setAppreciation] = useState("3");
  const [investmentReturn, setInvestmentReturn] = useState("5");

  const result = useMemo(() => {
    const hp = parseInput(homePrice);
    const r = parseInput(rent);
    if (isNaN(hp) || isNaN(r) || hp <= 0 || r <= 0) return null;
    const params: RentVsBuyParams = {
      homePrice: hp,
      downPaymentPct: isNaN(parseInput(downPct)) ? 0 : parseInput(downPct),
      mortgageRatePct: isNaN(parseInput(mortgageRate)) ? 0 : parseInput(mortgageRate),
      mortgageYears: 30,
      propertyTaxPct: 1,
      maintenancePct: 1,
      homeAppreciationPct: isNaN(parseInput(appreciation)) ? 0 : parseInput(appreciation),
      monthlyRent: r,
      rentGrowthPct: 3,
      investmentReturnPct: isNaN(parseInput(investmentReturn)) ? 0 : parseInput(investmentReturn),
      horizonYears: Math.max(1, isNaN(parseInput(horizon)) ? 5 : parseInput(horizon)),
    };
    return rentVsBuy(params);
  }, [homePrice, downPct, rent, mortgageRate, horizon, appreciation, investmentReturn]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Home price" value={homePrice} onChange={setHomePrice} prefix="$" />
        <MoneyInput label="Monthly rent (comparable home)" value={rent} onChange={setRent} prefix="$" />
        <Field label="Down payment">
          <PercentInput value={downPct} onChange={setDownPct} ariaLabel="Down payment percent" />
        </Field>
        <Field label="Mortgage rate">
          <PercentInput value={mortgageRate} onChange={setMortgageRate} ariaLabel="Mortgage rate" />
        </Field>
        <Field label="How long will you stay?">
          <NumberInput ariaLabel="Horizon in years" value={horizon} onChange={setHorizon} suffix="years" placeholder="5" />
        </Field>
        <Field label="Home appreciation (yearly)">
          <PercentInput value={appreciation} onChange={setAppreciation} ariaLabel="Home appreciation per year" />
        </Field>
        <MoneyInput label="Alternative investment return" value={investmentReturn} onChange={setInvestmentReturn} prefix="%" hint="What the down payment could earn if not used for a home" />
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Verdict</p>
            <p className={`mt-1 text-2xl font-bold ${result.buyBetter ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {result.tie ? "It's a wash" : result.buyBetter ? "Buying wins" : "Renting wins"}
            </p>
            <p className="mt-1 text-sm text-surface-600 dark:text-dark-muted">
              {result.buyBetter ? `Cheaper than renting by` : `More expensive than renting by`} {formatMoney(result.savings)} over {horizon || "5"} years.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Net cost of buying</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.netBuyCost)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Net cost of renting</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.netRentCost)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Monthly mortgage</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.mortgageMonthly)}</p>
            </div>
          </div>
          <p className="text-xs text-surface-500 dark:text-dark-muted">
            Simplified comparison over the horizon. Assumes 1% property tax + 1% maintenance, 3% annual rent growth, and 30-year mortgage. Closing costs and moving costs are not included.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a home price and a comparable rent to compare the two paths.
        </p>
      )}
    </div>
  );
}