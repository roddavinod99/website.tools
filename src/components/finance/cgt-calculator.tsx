"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, SelectField, NumberInput, PercentInput } from "@/components/finance/inputs";
import { calculateCgtByCountry, getCgtCountries, getCgtCountryMeta, type CgtAssetTypeId } from "@/lib/tax/cgt-index";
import { formatMoney, formatPercent } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

const CANADA_PROVINCES: { value: string; label: string }[] = [
  { value: "on", label: "Ontario" },
  { value: "ab", label: "Alberta" },
  { value: "bc", label: "British Columbia" },
  { value: "mb", label: "Manitoba" },
  { value: "nb", label: "New Brunswick" },
  { value: "nl", label: "Newfoundland and Labrador" },
  { value: "ns", label: "Nova Scotia" },
  { value: "nt", label: "Northwest Territories" },
  { value: "nu", label: "Nunavut" },
  { value: "pe", label: "Prince Edward Island" },
  { value: "qc", label: "Quebec" },
  { value: "sk", label: "Saskatchewan" },
  { value: "yt", label: "Yukon" },
];

export function CgtCalculator() {
  const { setCurrency: setGlobalCurrency } = useCurrency();
  const countries = useMemo(() => getCgtCountries(), []);

  const [countryCode, setCountryCode] = useState("IN");
  const [taxYearId, setTaxYearId] = useState("");
  const [assetType, setAssetType] = useState<CgtAssetTypeId>("listed-shares");
  const [years, setYears] = useState("2");
  const [months, setMonths] = useState("0");
  const [purchasePrice, setPurchasePrice] = useState("100000");
  const [salePrice, setSalePrice] = useState("150000");
  const [expenses, setExpenses] = useState("2000");
  const [currency, setCurrency] = useState("INR");
  const [filingStatus, setFilingStatus] = useState("single");
  const [taxableIncome, setTaxableIncome] = useState("");
  const [province, setProvince] = useState("on");
  const [residency, setResidency] = useState<"resident" | "foreign">("resident");
  const [isMainResidence, setIsMainResidence] = useState(false);
  const [indiaMarginalSlabPct, setIndiaMarginalSlabPct] = useState("30");

  const meta = useMemo(() => getCgtCountryMeta(countryCode), [countryCode]);
  const effectiveTaxYearId = taxYearId || meta?.defaultTaxYearId || "";

  const showHoldingPeriod =
    meta?.usesHoldingPeriod === true &&
    !(meta.holdingPeriodExemptAssets ?? []).includes(assetType);
  const showMainResidence =
    meta?.supportsMainResidence === true && assetType === "property";

  const holdingPeriodMonths = Math.max(0, (parseInput(years) || 0) * 12 + Math.round(parseInput(months) || 0));

  const result = useMemo(() => {
    if (!meta) return null;
    return calculateCgtByCountry({
      countryCode: countryCode,
      assetType,
      purchasePrice: parseInput(purchasePrice),
      salePrice: parseInput(salePrice),
      expenses: parseInput(expenses),
      holdingPeriodMonths,
      taxYearId: effectiveTaxYearId,
      filingStatus: filingStatus || undefined,
      taxableIncome: taxableIncome.trim() === "" ? undefined : parseInput(taxableIncome),
      province: province || undefined,
      residency,
      isMainResidence,
      indiaMarginalSlabPct: parseFloat(indiaMarginalSlabPct),
    });
  }, [
    meta,
    countryCode,
    assetType,
    purchasePrice,
    salePrice,
    expenses,
    holdingPeriodMonths,
    effectiveTaxYearId,
    filingStatus,
    taxableIncome,
    province,
    residency,
    isMainResidence,
    indiaMarginalSlabPct,
  ]);

  const handleCountryChange = (code: string) => {
    const nextMeta = getCgtCountryMeta(code);
    setCountryCode(code);
    setTaxYearId(nextMeta?.defaultTaxYearId ?? "");
    if (!nextMeta?.supportsMainResidence) setIsMainResidence(false);
    if (nextMeta) {
      setCurrency(nextMeta.currencyCode);
      setGlobalCurrency(nextMeta.currencyCode);
    }
  };

  const handleAssetChange = (next: string) => {
    setAssetType(next as CgtAssetTypeId);
    if (next !== "property") setIsMainResidence(false);
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    setGlobalCurrency(code);
  };

  if (!meta) {
    return (
      <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
        Select a country to estimate capital gains tax.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Country">
          <SelectField
            value={countryCode}
            onChange={handleCountryChange}
            ariaLabel="Select country"
            options={countries.map((c) => ({ value: c.code, label: c.name }))}
          />
        </Field>
        <CurrencySelector value={currency} onChange={handleCurrencyChange} ariaLabel="Select currency" />
        {meta.taxYears.length > 1 ? (
          <Field label="Tax year">
            <SelectField
              value={effectiveTaxYearId}
              onChange={(v) => setTaxYearId(v)}
              ariaLabel="Select tax year"
              options={meta.taxYears.map((t) => ({ value: t.id, label: t.label }))}
            />
          </Field>
        ) : (
          <Field label="Tax year">
            <div className="rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-600 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
              {meta.taxYears[0]?.label}
            </div>
          </Field>
        )}
        <Field label="Asset type">
          <SelectField
            value={assetType}
            onChange={handleAssetChange}
            ariaLabel="Select asset type"
            options={meta.assetTypes.map((a) => ({ value: a.id, label: a.label }))}
          />
        </Field>
        {showHoldingPeriod && (
          <>
            <Field label="Holding period (years)">
              <NumberInput ariaLabel="Holding period years" value={years} onChange={setYears} min={0} suffix="years" placeholder="2" />
            </Field>
            <Field label="Holding period (months)">
              <NumberInput ariaLabel="Holding period months" value={months} onChange={setMonths} min={0} max={11} suffix="months" placeholder="0" />
            </Field>
          </>
        )}
        {meta.needsFilingStatus && (
          <Field label="Filing status">
            <SelectField
              value={filingStatus}
              onChange={(v) => setFilingStatus(v)}
              ariaLabel="Filing status"
              options={[
                { value: "single", label: "Single" },
                { value: "mfj", label: "Married Filing Jointly" },
                { value: "hoh", label: "Head of Household" },
              ]}
            />
          </Field>
        )}
        {meta.needsProvince && (
          <Field label="Province / Territory">
            <SelectField
              value={province}
              onChange={(v) => setProvince(v)}
              ariaLabel="Select province"
              options={CANADA_PROVINCES}
            />
          </Field>
        )}
        {meta.needsResidency && (
          <Field label="Residency">
            <SelectField<"resident" | "foreign">
              value={residency}
              onChange={(v) => setResidency(v)}
              ariaLabel="Select residency"
              options={[
                { value: "resident", label: "Australian resident" },
                { value: "foreign", label: "Foreign resident" },
              ]}
            />
          </Field>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MoneyInput label="Purchase price" value={purchasePrice} onChange={setPurchasePrice} currency={currency} />
        <MoneyInput label="Sale price" value={salePrice} onChange={setSalePrice} currency={currency} />
        <MoneyInput
          label="Eligible expenses"
          value={expenses}
          onChange={setExpenses}
          currency={currency}
          hint="Brokerage, stamp duty, legal fees, improvements where deductible"
        />
        {meta.needsTaxableIncome && (
          <MoneyInput
            label={meta.taxableIncomeLabel ?? "Taxable income (other sources)"}
            value={taxableIncome}
            onChange={setTaxableIncome}
            currency={currency}
            hint="Used to find your marginal rate — leave blank to assume zero"
          />
        )}
        {countryCode === "IN" &&
          showHoldingPeriod &&
          ["unlisted-shares", "property", "other"].includes(assetType) && (
            <Field label="Your marginal slab rate" hint="Short-term gains on this asset are taxed at your slab rate">
              <PercentInput value={indiaMarginalSlabPct} onChange={setIndiaMarginalSlabPct} ariaLabel="Marginal slab rate percent" />
            </Field>
          )}
        {showMainResidence && (
          <label className="flex items-center gap-3 self-end rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">
            <input
              type="checkbox"
              checked={isMainResidence}
              onChange={(e) => setIsMainResidence(e.target.checked)}
              className="h-4 w-4 rounded border-surface-300"
              aria-label="This was my main residence"
            />
            This was my main / principal residence
          </label>
        )}
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Capital gain</p>
              <p className={`mt-1 text-2xl font-bold ${result.capitalGain >= 0 ? "text-surface-900 dark:text-dark-text" : "text-red-600 dark:text-red-400"}`}>
                {formatMoney(result.capitalGain, currency)}
              </p>
              <p className="mt-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                {result.treatment === "not-applicable" ? "Treatment not applicable" : result.treatment === "long-term" ? "Long-term treatment" : "Short-term treatment"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Estimated tax</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.estimatedTax, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Net gain after tax</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(result.netGainAfterTax, currency)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Taxable gain</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.taxableGain, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Effective rate on gain</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatPercent(result.effectiveRateOnGainPct)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Tax year</p>
              <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{result.taxYearLabel}</p>
            </div>
          </div>

          {result.breakdown.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-bg">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-200 text-xs uppercase tracking-wide text-surface-500 dark:border-dark-border dark:text-dark-muted">
                    <th className="px-3 py-2 font-medium">Item</th>
                    <th className="px-3 py-2 font-medium">Rate</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row, i) => (
                    <tr key={i} className="border-b border-surface-100 last:border-b-0 dark:border-dark-border">
                      <td className="px-3 py-2 text-surface-600 dark:text-dark-muted">{row.label}</td>
                      <td className="px-3 py-2 font-mono text-surface-900 dark:text-dark-text">
                        {row.rate === undefined ? "—" : formatPercent(row.rate * 100)}
                      </td>
                      <td className={`px-3 py-2 font-semibold ${row.amount < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-surface-900 dark:text-dark-text"}`}>
                        {formatMoney(row.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.warnings.length > 0 && (
            <ul className="list-inside list-disc space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}

          <p className="text-xs text-surface-500 dark:text-dark-muted">
            Estimates for the {result.taxYearLabel} tax year based on the selected country, asset type, and inputs.
            This is not tax advice — consult a qualified tax professional for your situation.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter a purchase price and sale price (both can be any non-negative amount) to estimate capital gains tax.
        </p>
      )}
    </div>
  );
}
