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