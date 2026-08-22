// Presentation-only formatting helpers. Financial math should stay in
// calculations.ts with full precision; these functions format at render time.

import { getCurrency, getCurrencyLocale, getCurrencySymbol } from "@/lib/data/currencies";

export interface FormatMoneyOptions {
  locale?: string;
  decimals?: number;
  showSymbol?: boolean;
}

export function formatMoney(
  value: number,
  currencyCode = "USD",
  options: FormatMoneyOptions = {}
): string {
  if (!Number.isFinite(value)) return "—";
  const currency = getCurrency(currencyCode);
  const locale = options.locale ?? getCurrencyLocale(currencyCode);
  const decimals = options.decimals ?? currency.decimals;
  const showSymbol = options.showSymbol ?? true;

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: showSymbol ? "currency" : "decimal",
      currency: showSymbol ? currencyCode : undefined,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);

    // For negative values, Intl.NumberFormat handles the sign correctly in most locales
    // But some locales put the symbol in different positions, so we trust Intl
    return formatted;
  } catch {
    const sign = value < 0 ? "-" : "";
    const symbol = showSymbol ? getCurrencySymbol(currencyCode) : "";
    return `${sign}${symbol}${Math.abs(value).toFixed(decimals)}`;
  }
}

export function formatNumber(
  value: number,
  locale = "en-US",
  decimals = 2
): string {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}

export function formatCompact(
  value: number,
  currencyCode = "USD"
): string {
  if (!Number.isFinite(value)) return "—";
  const currency = getCurrency(currencyCode);
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const symbol = currency.symbolNative;
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [div, suffix] of units) {
    if (abs >= div) {
      const num = abs / div;
      return `${sign}${symbol}${num.toFixed(num >= 100 ? 0 : 1)}${suffix}`;
    }
  }
  return `${sign}${symbol}${abs.toFixed(0)}`;
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(iso: string, locale = "en-US"): string {
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function formatDurationMonths(months: number): string {
  if (!Number.isFinite(months)) return "—";
  if (months <= 0) return "0 months";
  const years = Math.floor(months / 12);
  const rem = Math.round(months % 12);
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (rem > 0) parts.push(`${rem} month${rem > 1 ? "s" : ""}`);
  return parts.join(" ") || "0 months";
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  SGD: "S$",
};