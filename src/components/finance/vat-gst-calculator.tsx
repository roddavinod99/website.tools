"use client";

import { useMemo, useState } from "react";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { MoneyInput } from "@/components/finance/money-input";
import { Field, SelectField, PercentInput } from "@/components/finance/inputs";
import { CountrySelector } from "@/components/finance/country-selector";
import { calculateVatGst, splitCanadaRate } from "@/lib/tax/vat-gst";
import { getVatGstRate } from "@/lib/data/vat-gst-rates";
import { formatMoney, formatPercent } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";
import { getAllCountries } from "@/lib/data/vat-gst-rates";
import { usePrefillTool } from "@/lib/load-example";

interface ProvinceOption {
  code: string;
  name: string;
  type: string;
  rate: number;
}

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}

type RateOption = { value: string; label: string };

type VatGstResultWithBreakdown = {
  tax: number;
  total: number;
  base: number;
  federalTax?: number;
  provincialTax?: number;
  showBreakdown?: boolean;
};

export function VatGstCalculator() {
  const { setCurrency: setGlobalCurrency } = useCurrency();
  const [country, setCountry] = useState("US");
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [province, setProvince] = useState("");
  const [customRate, setCustomRate] = useState("");

  // Long-tail landing pages (PR 7 of PLAN.md) prefill the calculator
  // with { country, mode, rate, amount, currency, province } so e.g.
  // /vat/germany-19-on-100 lands with the German VAT already applied.
  // The shared VatGstCalculator is used by both the /tools/vat-gst page
  // and the long-tail /vat/* pages; the prefill only fires on the
  // long-tail pages because the /tools/* page doesn't dispatch the
  // devstackio:prefill-tool event.
  usePrefillTool("vat-gst", (prefill) => {
    if (prefill.country) setCountry(prefill.country);
    if (prefill.mode === "exclusive" || prefill.mode === "inclusive") setMode(prefill.mode);
    if (prefill.amount) setAmount(prefill.amount);
    if (prefill.currency) setCurrency(prefill.currency);
    if (prefill.province) setProvince(prefill.province);
    // The "rate" key in the prefill is interpreted as a pre-chosen rate
    // option (e.g. "standard" or "reduced" or a numeric value); we just
    // pass it through. The prefill event is fired by the landing-page
    // route, not the /tools/vat-gst page.
    if (prefill.rate) setRate(prefill.rate);
  });

  const countries = useMemo(() => getAllCountries(), []);
  const currentCountry = countries.find((c) => c.code === country);
  const rateInfo = useMemo(() => getVatGstRate(country), [country]);

  const rateOptions = useMemo((): RateOption[] => {
    if (!rateInfo) return [];
    // Dedupe by value: countries like the US have standardRate 0 alongside
    // zeroRate true, which would otherwise emit two "0"-valued options and
    // collide React keys in SelectField.
    const opts: RateOption[] = [];
    const push = (value: string, label: string) => {
      if (!opts.some((o) => o.value === value)) opts.push({ value, label });
    };
    push(
      String(rateInfo.standardRate),
      `${rateInfo.taxName} (${formatPercent(rateInfo.standardRate * 100)})`
    );
    for (const r of rateInfo.reducedRates) {
      push(String(r), `Reduced ${formatPercent(r * 100)}`);
    }
    if (rateInfo.zeroRate) {
      push("0", "Zero rate (0%)");
    }
    push("custom", "Custom rate…");
    return opts;
  }, [rateInfo]);

  const provinceList: ProvinceOption[] = rateInfo?.provinces ?? [];
  const provinces = provinceList.map((p) => ({ value: p.code, label: `${p.name} (${p.type} ${formatPercent(p.rate * 100)})` }));

  const result = useMemo((): VatGstResultWithBreakdown | null => {
    const amt = parseInput(amount);
    const selRate = parseInput(rate === "custom" ? customRate : rate);
    if (isNaN(amt) || isNaN(selRate) || amt <= 0) return null;

    // Canada special handling
    if (country === "CA" && province) {
      const split = splitCanadaRate(selRate, province);
      if (split) {
        const res = calculateVatGst({
          amount: amt,
          rate: selRate,
          mode,
          federalRate: split.federalRate,
          provincialRate: split.provincialRate,
        });
        return { ...res, showBreakdown: true };
      }
    }

    return calculateVatGst({ amount: amt, rate: selRate, mode });
  }, [amount, rate, customRate, mode, country, province]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setRate("");
    setCustomRate("");
    setProvince("");
    // set default mode per country
    const info = getVatGstRate(newCountry);
    setMode(info?.defaultInclusive ? "inclusive" : "exclusive");
    // set default currency
    if (info) setCurrency(info.currencyCode ?? "USD");
  };

  const handleRateChange = (newRate: string) => {
    setRate(newRate);
  };

  const handleModeChange = (newMode: "exclusive" | "inclusive") => {
    setMode(newMode);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setGlobalCurrency(newCurrency);
  };

  if (!currentCountry) {
    return (
      <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
        Select a country to calculate tax.
      </p>
    );
  }

  // Human-readable applied rate for the result footer; handles the custom case
  // where `rate` is the sentinel "custom" rather than a number.
  const displayRate =
    rate === "custom"
      ? formatPercent(parseInput(customRate) * 100)
      : rate !== ""
        ? formatPercent(parseFloat(rate) * 100)
        : "";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CountrySelector value={country} onChange={handleCountryChange} ariaLabel="Select country" />
        <CurrencySelector value={currency} onChange={handleCurrencyChange} ariaLabel="Select currency" />
        <Field label="Mode">
          <SelectField<"exclusive" | "inclusive">
            value={mode}
            onChange={handleModeChange}
            ariaLabel="Tax mode"
            options={[
              { value: "exclusive", label: "Exclusive (tax added on top)" },
              { value: "inclusive", label: "Inclusive (tax included)" },
            ]}
          />
        </Field>
        <Field label="Tax rate">
          <SelectField<string>
            value={rate}
            onChange={handleRateChange}
            ariaLabel="Tax rate"
            options={rateOptions}
          />
        </Field>
        {rate === "custom" && (
          <Field label="Custom rate" hint="Enter the tax rate percentage to apply">
            <PercentInput value={customRate} onChange={setCustomRate} ariaLabel="Custom tax rate percent" />
          </Field>
        )}
        {country === "CA" && rateInfo?.provinces && rateInfo.provinces.length > 0 && (
          <Field label="Province / Territory">
            <SelectField<string>
              value={province}
              onChange={(v) => setProvince(v)}
              ariaLabel="Province"
              options={[{ value: "", label: "Select province…" }, ...provinces]}
            />
          </Field>
        )}
        <MoneyInput label="Amount" value={amount} onChange={setAmount} currency={currency} placeholder="100" />
      </div>

      {result ? (
        <div
          data-testid="tool-output"
          className="space-y-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Tax ({rateInfo?.taxName})</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">{formatMoney(result.tax, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">{mode === "exclusive" ? "Total" : "Base amount"}</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">{formatMoney(mode === "exclusive" ? result.total : result.base, currency)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">{mode === "exclusive" ? "Base amount" : "Total (incl. tax)"}</p>
              <p className="mt-1 text-xl font-semibold text-brand-600 dark:text-brand-400">{formatMoney(mode === "exclusive" ? result.base : result.total, currency)}</p>
            </div>
          </div>

          {result.showBreakdown && (result.federalTax !== undefined || result.provincialTax !== undefined) && (
            <div className="grid gap-4 sm:grid-cols-2 text-sm border-t border-surface-200 pt-4 dark:border-dark-border">
              {result.federalTax !== undefined && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Federal tax (GST)</p>
                  <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.federalTax, currency)}</p>
                </div>
              )}
              {result.provincialTax !== undefined && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Provincial tax</p>
                  <p className="mt-1 font-semibold text-surface-900 dark:text-dark-text">{formatMoney(result.provincialTax, currency)}</p>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-surface-500 dark:text-dark-muted">
            {mode === "exclusive"
              ? `Tax calculated on base amount. ${rateInfo?.taxName} rate applied: ${displayRate}.`
              : `Tax extracted from inclusive amount. ${rateInfo?.taxName} rate applied: ${displayRate}.`}
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          Enter an amount and select a tax rate to calculate.
        </p>
      )}
    </div>
  );
}