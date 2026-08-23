"use client";

import { formatMoney } from "@/lib/finance/format";

interface CurrencyGridProps {
  baseAmount: number;
  baseCurrency: string;
  rates: Record<string, number>;
  targetCurrency: string;
  featured?: string[];
  maxVisible?: number;
  onSelect: (currency: string) => void;
  className?: string;
}

export function CurrencyGrid({
  baseAmount,
  baseCurrency,
  rates,
  targetCurrency,
  featured = ["EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD", "HKD", "AED", "KRW", "BRL"],
  maxVisible = 12,
  onSelect,
  className = "",
}: CurrencyGridProps) {
  const featuredRates = featured
    .filter((c) => c !== baseCurrency && rates[c])
    .slice(0, maxVisible);

  const otherRates = Object.keys(rates)
    .filter((c) => c !== baseCurrency && !featured.includes(c) && rates[c])
    .sort()
    .slice(0, Math.max(0, maxVisible - featuredRates.length));

  const displayCurrencies = [...featuredRates, ...otherRates];

  if (displayCurrencies.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-result-primary mb-3">Other Currency Values</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {displayCurrencies.map((currency) => {
          const rate = rates[currency];
          const converted = (baseAmount / rates[baseCurrency]) * rate;
          const isActive = currency === targetCurrency;

          return (
            <button
              key={currency}
              onClick={() => onSelect(currency)}
              className={`
                relative rounded-lg border p-3 text-left transition-all
                ${isActive
                  ? "border-brand-primary bg-brand-50 dark:bg-brand-900/20"
                  : "border-tool-border bg-tool-surface hover:border-brand-primary/50 hover:shadow-[var(--tool-card-shadow)]"}
              `}
              aria-pressed={isActive}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-semibold text-result-primary">{currency}</span>
                {isActive && <span className="text-xs text-brand-primary">Selected</span>}
              </div>
              <div className="mt-1 text-sm text-result-secondary">
                {formatMoney(converted, currency)}
              </div>
              <div className="mt-1 text-xs text-result-secondary">
                1 {baseCurrency} = {formatMoney(rate / rates[baseCurrency], currency)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}