// Money-precision helpers shared by the Finance tool category.
// Currency amounts displayed to users are rounded to cents using these helpers;
// everything else uses these consistently so that displayed totals reconcile
// with the underlying payment schedules.

export function roundTo(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Round a currency amount to cents (2 decimal places). */
export function roundToCents(value: number): number {
  return roundTo(value, 2);
}

/** Alias for roundToCents; use when the value is explicitly money. */
export const roundMoney = roundToCents;