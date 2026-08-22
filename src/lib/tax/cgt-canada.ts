import type { CgtBreakdownRow, CgtBracket, CgtInput, CgtResult } from "./cgt-types";
import { computeCapitalGain, isValidCgtBase, marginalTax } from "./cgt-engine";
import { cgtCanada, canadaProvinceBrackets, pickCgtYear, type CgtTaxYearData } from "@/lib/data/cgt/config";

interface CanadaYear extends CgtTaxYearData {
  inclusionRate: number;
  mainResidenceFullyExempt: boolean;
  federalBrackets: CgtBracket[];
}

export function calculateCgtCanada(input: CgtInput): CgtResult | null {
  if (!isValidCgtBase(input)) return null;

  const year = pickCgtYear(cgtCanada, input.taxYearId) as CanadaYear;
  const gain = computeCapitalGain(input);
  const warnings: string[] = [];
  const rows: CgtBreakdownRow[] = [];

  const provinceCode = (input.province ?? "on").toLowerCase();
  const provincialBrackets = canadaProvinceBrackets[provinceCode];

  let taxableGain = 0;
  let tax = 0;

  if (input.isMainResidence && year.mainResidenceFullyExempt) {
    taxableGain = 0;
    rows.push({ label: "Principal residence exemption", amount: 0 });
    warnings.push("Principal residence exemption applied — the full gain is tax-free. This assumes the home was your principal residence for every year of ownership.");
  } else if (gain <= 0) {
    taxableGain = 0;
    warnings.push("This is a capital loss. Allowable capital losses offset capital gains and carry forward indefinitely (or back 3 years).");
  } else {
    taxableGain = gain * year.inclusionRate;
    rows.push({
      label: `Taxable amount (${Math.round(year.inclusionRate * 100)}% inclusion rate)`,
      rate: year.inclusionRate,
      amount: taxableGain,
    });

    if (!provincialBrackets) {
      warnings.push(`Provincial brackets for "${input.province}" were not found — using federal rates only.`);
    }
    if (input.taxableIncome === undefined || !Number.isFinite(input.taxableIncome)) {
      warnings.push("No other taxable income entered — assuming $0, which may understate your marginal rate.");
    }

    const income = Math.max(0, input.taxableIncome ?? 0);
    const combined = [
      ...year.federalBrackets,
      ...(provincialBrackets ?? []),
    ].sort((a, b) => a.min - b.min);

    tax = marginalTax(income, taxableGain, combined);
    rows.push({ label: "Combined federal + provincial marginal tax", amount: tax });
    warnings.push("Provincial surtaxes and credits are not modelled — this is an approximation.");
  }

  return {
    countryCode: "CA",
    countryName: cgtCanada.countryName,
    currencyCode: cgtCanada.currencyCode,
    taxYearLabel: year.label,
    treatment: "not-applicable",
    capitalGain: gain,
    taxableGain,
    estimatedTax: tax,
    netGainAfterTax: gain - tax,
    effectiveRateOnGainPct: gain > 0 ? (tax / gain) * 100 : 0,
    breakdown: rows,
    warnings,
  };
}
