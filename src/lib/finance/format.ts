// Presentation-only formatting helpers. Financial math should stay in
// calculations.ts with full precision; these functions format at render time.

export function formatMoney(
  value: number,
  currency = "USD",
  decimals = 2
): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  try {
    return (
      sign +
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(Math.abs(value))
    );
  } catch {
    return `${sign}$${Math.abs(value).toFixed(decimals)}`;
  }
}

export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [div, suffix] of units) {
    if (abs >= div) {
      const num = abs / div;
      return `${sign}$${num.toFixed(num >= 100 ? 0 : 1)}${suffix}`;
    }
  }
  return `${sign}$${abs.toFixed(0)}`;
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
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
