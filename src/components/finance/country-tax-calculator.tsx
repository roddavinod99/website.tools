"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, SelectField } from "@/components/finance/inputs";
import { CountrySelector } from "@/components/finance/country-selector";
import { calculateTaxByCountry } from "@/lib/tax";
import { getAllCountries, getRegimesForYear, getRegionsForYear, getTaxYears, getCountryTaxConfig } from "@/lib/data/tax";
import { formatMoney, formatPercent } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

type RegionCode = string;
type RegimeId = string;
type TaxYear = string;

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

interface CountryTaxCalculatorProps {
  defaultCountry?: string;
  defaultCurrency?: string;
  onCountryChange?: (country: string) => void;
}

export function CountryTaxCalculator({
  defaultCountry = "US",
  defaultCurrency = "USD",
  onCountryChange,
}: CountryTaxCalculatorProps) {
  const { setCurrency: setGlobalCurrency } = useCurrency();
  const [country, setCountry] = useState(defaultCountry);
  const [taxYear, setTaxYear] = useState("");
  const [region, setRegion] = useState("");
  const [regime, setRegime] = useState("");
  const [income, setIncome] = useState("75000");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [deductions, setDeductions] = useState<Record<string, number>>({});

  const countries = useMemo(() => getAllCountries(), []);
  const currentCountry = countries.find((c) => c.code === country);

  const countryConfig = useMemo(() => getCountryTaxConfig(country), [country]);

  const taxYears = useMemo(() => {
    if (!countryConfig) return [];
    return getTaxYears(countryConfig);
  }, [countryConfig]);

  const regimes = useMemo(() => {
    if (!countryConfig || !taxYear) return [];
    return getRegimesForYear(countryConfig, taxYear, region);
  }, [countryConfig, taxYear, region]);

  const regions = useMemo(() => {
    if (!countryConfig || !taxYear) return [];
    return getRegionsForYear(countryConfig, taxYear);
  }, [countryConfig, taxYear]);

  const result = useMemo(() => {
    const i = parseInput(income);
    if (isNaN(i) || i <= 0) return null;
    try {
      return calculateTaxByCountry({
        grossIncome: i,
        countryCode: country,
        taxYear,
        regionCode: region || undefined,
        regimeId: regime || undefined,
        deductions: Object.keys(deductions).length > 0 ? deductions : undefined,
      });
    } catch {
      return null;
    }
  }, [income, country, taxYear, region, regime, deductions]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setTaxYear("");
    setRegion("");
    setRegime("");
    onCountryChange?.(newCountry);
  };

  const handleTaxYearChange = (newTaxYear: string) => {
    setTaxYear(newTaxYear);
    setRegion("");
    setRegime("");
  };

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    setRegime("");
  };

  const handleRegimeChange = (newRegime: string) => {
    setRegime(newRegime);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setGlobalCurrency(newCurrency);
  };

  const handleDeductionChange = (name: string, value: number) => {
    setDeductions((prev) => ({ ...prev, [name]: value }));
  };

  if (!currentCountry) {
    return (
      <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
        Select a country to calculate income tax.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CountrySelector
          value={country}
          onChange={handleCountryChange}
          ariaLabel="Select country"
        />
        <CurrencySelector
          value={currency}
          onChange={handleCurrencyChange}
          ariaLabel="Select currency"
        />
        <Field label="Tax Year">
          <SelectField<TaxYear>
            value={taxYear}
            onChange={handleTaxYearChange}
            ariaLabel="Select tax year"
            options={taxYears.map((t) => ({ value: t.year, label: t.label }))}
          />
        </Field>
        {regions.length > 0 && (
          <Field label="Region">
            <SelectField<RegionCode>
              value={region}
              onChange={handleRegionChange}
              ariaLabel="Select region"
              options={regions.map((r) => ({ value: r.code, label: r.label }))}
            />
          </Field>
        )}
        {regimes.length > 1 && (
          <Field label="Regime">
            <SelectField<RegimeId>
              value={regime}
              onChange={handleRegimeChange}
              ariaLabel="Select tax regime"
              options={regimes.map((r) => ({ value: r.id, label: r.label }))}
            />
          </Field>
        )}
        <MoneyInput label="Annual gross income" value={income} onChange={setIncome} currency={currency} placeholder="75,000" />
      </div>

      {regimes.find((r) => r.id === regime)?.deductions.length && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-surface-700 dark:text-dark-text">Deductions</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {regimes.find((r) => r.id === regime)?.deductions.map((d) => (
              <Field key={d.name} label={d.name} hint={d.description}>
                <MoneyInput
                  label={d.name}
                  value={String(deductions[d.name] || "")}
                  onChange={(v) => handleDeductionChange(d.name, parseInput(v))}
                  currency={currency}
                  placeholder="0"
                />
              </Field>
            ))}
          </div>
        </div>
      )}

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Income tax</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.totalTax, currency)}</p>
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
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.taxableIncome, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Standard deduction</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.standardDeduction, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Effective on gross</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatPercent((result.totalTax / result.grossIncome) * 100)}</p>
            </div>
          </div>

          {result.deductionsClaimed && Object.keys(result.deductionsClaimed).length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Deductions claimed</p>
              <div className="grid gap-2 sm:grid-cols-2 mt-2">
                {Object.entries(result.deductionsClaimed).map(([name, amount]) => (
                  <div key={name} className="flex justify-between text-sm">
                    <span className="text-surface-600 dark:text-dark-muted">{name}</span>
                    <span className="font-semibold text-surface-900 dark:text-dark-text">{formatMoney(amount, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                        {formatMoney(row.bracket.min, currency)} – {row.bracket.max === Infinity ? "above" : formatMoney(row.bracket.max, currency)}
                      </td>
                      <td className="px-3 py-2 text-surface-600 dark:text-dark-muted">{formatMoney(row.taxableInBracket, currency)}</td>
                      <td className="px-3 py-2 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(row.taxInBracket, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-surface-500 dark:text-dark-muted">
            Tax calculations are estimates based on the selected tax year ({taxYear}), region ({region || "default"}), and regime ({regimes.find((r) => r.id === regime)?.label || "default"}). Consult a qualified tax advisor for your specific situation.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter an annual gross income to estimate income tax.
        </p>
      )}
    </div>
  );
}