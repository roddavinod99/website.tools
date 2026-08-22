import type { CgtBreakdownRow, CgtInput, CgtResult } from "./cgt-types";
import { computeCapitalGain, isValidCgtBase, marginalTax } from "./cgt-engine";
import { cgtUs, pickCgtYear, type CgtTaxYearData } from "@/lib/data/cgt/config";

interface UsYear extends CgtTaxYearData {
  longTermThresholdMonths: number;
  filingStatuses: { id: string; label: string }[];
  ordinaryBrackets: Record<string, { min: number; max: number; rate: number }[]>;
  ltcgBrackets: Record<string, { min: number; max: number; rate: number }[]>;
  niit: {
    rate: number;
    thresholds: Record<string, number>;
  };
}

const VALID_STATUSES = ["single", "mfj", "hoh"];

export function calculateCgtUs(input: CgtInput): CgtResult | null {
  if (!isValidCgtBase(input)) return null;

  const year = pickCgtYear(cgtUs, input.taxYearId) as UsYear;
  const status = VALID_STATUSES.includes(input.filingStatus ?? "") ? input.filingStatus! : "single";

  const gain = computeCapitalGain(input);
  const warnings: string[] = [];
  const rows: CgtBreakdownRow[] = [];

  if (input.taxableIncome === undefined || !Number.isFinite(input.taxableIncome) || input.taxableIncome < 0) {
    warnings.push("No other taxable income entered — assuming $0, which may understate your marginal rate.");
  }
  const income = Math.max(0, input.taxableIncome ?? 0);

  let treatment: CgtResult["treatment"];
  let taxableGain = 0;
  let tax = 0;

  if (gain <= 0) {
    treatment = input.holdingPeriodMonths > year.longTermThresholdMonths ? "long-term" : "short-term";
    taxableGain = 0;
    warnings.push("This is a capital loss. Losses offset gains and up to $3,000 of ordinary income per year; the rest carries forward.");
  } else {
    taxableGain = gain;

    const isLongTerm = input.holdingPeriodMonths > year.longTermThresholdMonths;
    treatment = isLongTerm ? "long-term" : "short-term";
    const brackets = isLongTerm ? year.ltcgBrackets[status] : year.ordinaryBrackets[status];

    tax = marginalTax(income, gain, brackets);
    rows.push({
      label: isLongTerm ? "Long-term capital gains rates" : "Ordinary income rates (short-term)",
      amount: tax,
    });

    // Net Investment Income Tax (approximation of MAGI). Applies to both
    // short- and long-term net investment income.
    const threshold = year.niit.thresholds[status] ?? year.niit.thresholds.single;
    const magiApprox = income + gain;
    if (magiApprox > threshold) {
      const niitBase = Math.min(gain, magiApprox - threshold);
      const niit = niitBase * year.niit.rate;
      tax += niit;
      rows.push({ label: "Net Investment Income Tax (3.8%)", rate: year.niit.rate, amount: niit });
      warnings.push("NIIT is approximated using MAGI ≈ taxable income + gain. Other investment income may change this.");
    }

    if (!isLongTerm) {
      warnings.push("Short-term gains are taxed as ordinary income — holding for over 12 months usually reduces the rate.");
    }
  }

  return {
    countryCode: "US",
    countryName: cgtUs.countryName,
    currencyCode: cgtUs.currencyCode,
    taxYearLabel: year.label,
    treatment,
    capitalGain: gain,
    taxableGain,
    estimatedTax: tax,
    netGainAfterTax: gain - tax,
    effectiveRateOnGainPct: gain > 0 ? (tax / gain) * 100 : 0,
    breakdown: rows,
    warnings,
  };
}
