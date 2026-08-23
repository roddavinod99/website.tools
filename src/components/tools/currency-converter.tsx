"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, NumberInput } from "@/components/finance/inputs";
import { CurrencySelector } from "@/components/finance/currency-selector";
import { formatMoney } from "@/lib/finance/format";
import { useCurrency } from "@/lib/stores/currency-store";

const POPULAR_CURRENCIES = [
  "USD", "EUR", "GBP", "INR", "JPY", "CNY", "AUD", "CAD", "CHF", "SGD",
  "NZD", "HKD", "KRW", "AED", "BRL", "MXN", "ZAR", "TRY", "IDR", "MYR",
];

interface RatesPayload {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
}

interface CurrencyState extends RatesPayload {
  receivedAt: number;
}

function parseInput(raw: string): number {
  const v = parseFloat(raw);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export function CurrencyConverter() {
  const { currency: fromCurrency, setCurrency: setFromCurrency } = useCurrency("currency-converter");
  const [rates, setRates] = useState<CurrencyState | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("100");
  const [toCurrency, setToCurrency] = useState("INR");
  const [showAllRates, setShowAllRates] = useState(false);
  const [rateSearch, setRateSearch] = useState("");

  const converted = useMemo(() => {
    if (!rates || !rates.rates[fromCurrency] || !rates.rates[toCurrency]) return null;
    const amountNum = parseInput(amount);
    if (amountNum <= 0) return null;
    return (amountNum / rates.rates[fromCurrency]) * rates.rates[toCurrency];
  }, [rates, amount, fromCurrency, toCurrency]);

  const exchangeRate = useMemo(() => {
    if (!rates || !rates.rates[fromCurrency] || !rates.rates[toCurrency]) return null;
    return rates.rates[toCurrency] / rates.rates[fromCurrency];
  }, [rates, fromCurrency, toCurrency]);

  const currencies = useMemo(() => {
    if (!rates) return POPULAR_CURRENCIES;
    const known = Object.keys(rates.rates).sort();
    const union = [...POPULAR_CURRENCIES];
    for (const c of known) if (!union.includes(c)) union.push(c);
    return union;
  }, [rates]);

  async function fetchRates(): Promise<RatesPayload> {
    const res = await fetch("/api/currency-rates");
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.error) {
      throw new Error(json?.error ?? `Request failed (${res.status})`);
    }
    return json;
  }

  function applyRates(json: RatesPayload) {
    setRates({ ...json, receivedAt: Date.now() });
    setStatus(
      `Rates as of ${json.updatedAt ? new Date(json.updatedAt).toLocaleString() : "now"}. Cached for 10 minutes.`
    );
  }

  function refresh() {
    setError("");
    setStatus("");
    setLoading(true);
    fetchRates()
      .then(applyRates)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load currency rates."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let active = true;
    fetchRates()
      .then((json) => {
        if (!active) return;
        setRates({ ...json, receivedAt: Date.now() });
        setStatus(
          `Rates as of ${json.updatedAt ? new Date(json.updatedAt).toLocaleString() : "now"}. Cached for 10 minutes.`
        );
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load currency rates. Check your connection.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const hasRates = rates !== null;
  const isOffline = error && !loading;
  const lastUpdated = rates ? new Date(rates.receivedAt).toLocaleString() : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount">
          <NumberInput ariaLabel="Amount to convert" value={amount} onChange={setAmount} placeholder="100" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelector
          value={fromCurrency}
          onChange={setFromCurrency}
          ariaLabel="From currency"
        />
        <CurrencySelector
          value={toCurrency}
          onChange={setToCurrency}
          ariaLabel="To currency"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
        >
          {loading ? "Loading…" : hasRates ? "Refresh rates" : "Load rates"}
        </button>
        {status && <p className="text-xs text-surface-400 dark:text-dark-muted">{status}</p>}
        {lastUpdated && <p className="text-xs text-brand-600 dark:text-brand-400">Last updated: {lastUpdated}</p>}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Using cached rates. Results may be outdated.
          </p>
          <button onClick={refresh} className="mt-1 text-xs text-brand-500 hover:text-brand-600">
            Retry
          </button>
        </div>
      )}

      {isOffline && rates && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Offline mode — showing cached rates from {lastUpdated}
          </p>
        </div>
      )}

      {converted !== null && exchangeRate !== null && rates ? (
        <div className="space-y-4">
          <div
            data-testid="tool-output"
            className="grid gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 sm:grid-cols-3 dark:border-dark-border dark:bg-dark-surface"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">You convert</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">
                {formatMoney(parseInput(amount), fromCurrency)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">Exchange rate</p>
              <p className="mt-1 text-xl font-semibold text-surface-700 dark:text-dark-text">
                1 {fromCurrency} = {formatMoney(exchangeRate, toCurrency)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-dark-muted">You get</p>
              <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-dark-text">
                {formatMoney(converted, toCurrency)}
              </p>
            </div>
          </div>

          {/* All Rates Table - Top 20 + Searchable "Show All" */}
          <div className="rounded-xl border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-dark-border">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-dark-text">All Exchange Rates</h3>
              <button
                onClick={() => setShowAllRates(!showAllRates)}
                className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium flex items-center gap-1"
                aria-expanded={showAllRates}
              >
                {showAllRates ? "Show less" : "Show all rates"} ({Object.keys(rates.rates).length} currencies)
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={rateSearch}
                onChange={(e) => setRateSearch(e.target.value)}
                placeholder="Search currencies..."
                className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted mb-3"
                aria-label="Search exchange rates"
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-dark-border">
                      <th className="text-left py-2 px-3 font-medium text-surface-600 dark:text-dark-muted">Currency</th>
                      <th className="text-right py-2 px-3 font-medium text-surface-600 dark:text-dark-muted">Rate (1 {rates.base})</th>
                      <th className="text-right py-2 px-3 font-medium text-surface-600 dark:text-dark-muted">1 {toCurrency} =</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(rates.rates)
                      .filter(([code]) => code.toLowerCase().includes(rateSearch.toLowerCase()))
                      .sort((a, b) => {
                        const aPop = POPULAR_CURRENCIES.indexOf(a[0]);
                        const bPop = POPULAR_CURRENCIES.indexOf(b[0]);
                        if (aPop !== -1 && bPop !== -1) return aPop - bPop;
                        if (aPop !== -1) return -1;
                        if (bPop !== -1) return 1;
                        return a[0].localeCompare(b[0]);
                      })
                      .slice(0, showAllRates ? undefined : 20)
                      .map(([code, rate]) => (
                        <tr key={code} className="border-b border-surface-100 dark:border-dark-border/50 hover:bg-surface-50 dark:hover:bg-dark-surface/50">
                          <td className="py-2 px-3 font-medium text-surface-900 dark:text-dark-text">{code}</td>
                          <td className="py-2 px-3 text-right text-surface-700 dark:text-dark-text font-mono">{rate.toFixed(6)}</td>
                          <td className="py-2 px-3 text-right text-surface-500 dark:text-dark-muted font-mono">
                            {(1 / rate).toFixed(6)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!showAllRates && Object.keys(rates.rates).length > 20 && (
                <p className="mt-2 text-xs text-surface-500 dark:text-dark-muted text-center">
                  Showing top 20 of {Object.keys(rates.rates).length} currencies. Click &ldquo;Show all rates&rdquo; to see more.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        !error && (
          <p className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
            {loading ? "Loading live rates…" : "Enter an amount and load rates to convert."}
          </p>
        )
      )}

      <p className="text-xs text-surface-400 dark:text-dark-muted">
        Live rates are fetched from a public exchange-rate API and cached for 10 minutes. Results are indicative and not for transactional use.
      </p>
    </div>
  );
}