import type { CgtBracket, CgtInput } from "./cgt-types";

/** Sale − Purchase − Eligible Expenses. May be negative (a loss). */
export function computeCapitalGain(input: Pick<CgtInput, "salePrice" | "purchasePrice" | "expenses">): number {
  return input.salePrice - input.purchasePrice - Math.max(0, input.expenses);
}

export function isValidCgtBase(input: CgtInput): boolean {
  const nums = [input.purchasePrice, input.salePrice, input.expenses, input.holdingPeriodMonths];
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return false;
  return true;
}

/** Total tax on `amount` when taxed progressively from zero through `brackets`. */
export function bracketTax(amount: number, brackets: CgtBracket[]): number {
  let tax = 0;
  for (const b of brackets) {
    if (amount <= b.min) break;
    const upper = Math.min(amount, b.max);
    const inBand = upper - b.min;
    if (inBand > 0) tax += inBand * b.rate;
  }
  return tax;
}

/**
 * Marginal-difference method: the extra tax caused by adding `addition` on top
 * of `base`. Credits and constant deductions cancel, so this isolates the gain's cost.
 */
export function marginalTax(base: number, addition: number, brackets: CgtBracket[]): number {
  return bracketTax(base + addition, brackets) - bracketTax(base, brackets);
}

/** Split a gain across an unused lower band and a higher band. */
export function splitAcrossBands(
  gain: number,
  unusedLowerBand: number,
  lowerRate: number,
  upperRate: number
): { rows: { label: string; rate: number; amount: number }[]; total: number } {
  const lowerPortion = Math.min(Math.max(0, gain), Math.max(0, unusedLowerBand));
  const upperPortion = Math.max(0, gain - lowerPortion);
  const rows = [
    { label: "Taxed at basic rate", rate: lowerRate, amount: lowerPortion * lowerRate },
    { label: "Taxed at higher rate", rate: upperRate, amount: upperPortion * upperRate },
  ].filter((r) => r.amount > 0);
  return { rows, total: lowerPortion * lowerRate + upperPortion * upperRate };
}
