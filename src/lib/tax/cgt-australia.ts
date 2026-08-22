import type { CgtBreakdownRow, CgtBracket, CgtInput, CgtResult } from "./cgt-types";
import { computeCapitalGain, isValidCgtBase, marginalTax } from "./cgt-engine";
import { cgtAustralia, pickCgtYear, type CgtTaxYearData } from "@/lib/data/cgt/config";

interface AustraliaYear extends CgtTaxYearData {
  discountHoldingMonths: number;
  discountRate: number;
  foreignResidentDiscount: boolean;
  mainResidenceFullyExempt: boolean;
  residentBrackets: CgtBracket[];
  medicareLevyRate: number;
}

export function calculateCgtAustralia(input: CgtInput): CgtResult | null {
  if (!isValidCgtBase(input)) return null;

  const year = pickCgtYear(cgtAustralia, input.taxYearId) as AustraliaYear;
  const gain = computeCapitalGain(input);
  const warnings: string[] = [];
  const rows: CgtBreakdownRow[] = [];

  const residency = input.residency ?? "resident";
  let taxableGain = 0;
  let tax = 0;

  if (input.isMainResidence && year.mainResidenceFullyExempt) {
    taxableGain = 0;
    rows.push({ label: "Main residence exemption", amount: 0 });
    warnings.push("Main residence exemption applied — the full gain is tax-free. This assumes the home was your main residence for the whole ownership period.");
  } else if (gain <= 0) {
    taxableGain = 0;
    warnings.push("This is a capital loss. Net capital losses can only be offset against future capital gains — they carry forward indefinitely.");
  } else {
    // The CGT discount is available only to resident individuals who held
    // the asset for more than the configured threshold.
    const discountEligible =
      residency === "resident" && input.holdingPeriodMonths > year.discountHoldingMonths;

    taxableGain = discountEligible ? gain * (1 - year.discountRate) : gain;
    if (discountEligible) {
      rows.push({
        label: "50% CGT discount (held over 12 months)",
        rate: -year.discountRate,
        amount: -(gain - taxableGain),
      });
    }
    if (residency === "foreign" && !year.foreignResidentDiscount) {
      warnings.push("Foreign resident not eligible for CGT discount.");
    }

    if (input.taxableIncome === undefined || !Number.isFinite(input.taxableIncome)) {
      warnings.push("No other taxable income entered — assuming A$0, which may understate your marginal rate.");
    }

    const income = Math.max(0, input.taxableIncome ?? 0);
    tax = marginalTax(income, taxableGain, year.residentBrackets);
    rows.push({ label: "Marginal tax on taxable gain", amount: tax });

    if (residency === "resident") {
      const medicare = taxableGain * year.medicareLevyRate;
      if (medicare > 0) {
        tax += medicare;
        rows.push({ label: "Medicare levy (2%)", rate: year.medicareLevyRate, amount: medicare });
      }
    } else {
      warnings.push("Foreign-resident estimate uses the resident rate schedule without Medicare. Actual foreign rates may differ.");
    }
  }

  return {
    countryCode: "AU",
    countryName: cgtAustralia.countryName,
    currencyCode: cgtAustralia.currencyCode,
    taxYearLabel: year.label,
    treatment:
      input.isMainResidence || gain <= 0
        ? "not-applicable"
        : input.holdingPeriodMonths > year.discountHoldingMonths
          ? "long-term"
          : "short-term",
    capitalGain: gain,
    taxableGain,
    estimatedTax: tax,
    netGainAfterTax: gain - tax,
    effectiveRateOnGainPct: gain > 0 ? (tax / gain) * 100 : 0,
    breakdown: rows,
    warnings,
  };
}
