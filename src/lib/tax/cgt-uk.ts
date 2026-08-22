import type { CgtBreakdownRow, CgtInput, CgtResult } from "./cgt-types";
import { computeCapitalGain, isValidCgtBase, splitAcrossBands } from "./cgt-engine";
import { cgtUk, pickCgtYear, type CgtTaxYearData } from "@/lib/data/cgt/config";

interface UkYear extends CgtTaxYearData {
  annualExemptAmount: number;
  basicBandUpperLimit: number;
  basicRate: number;
  higherRate: number;
  mainResidenceFullyExempt: boolean;
}

export function calculateCgtUk(input: CgtInput): CgtResult | null {
  if (!isValidCgtBase(input)) return null;

  const year = pickCgtYear(cgtUk, input.taxYearId) as UkYear;
  const gain = computeCapitalGain(input);
  const warnings: string[] = [];
  const rows: CgtBreakdownRow[] = [];

  let taxableGain = 0;
  let tax = 0;

  if (input.isMainResidence && year.mainResidenceFullyExempt) {
    taxableGain = 0;
    rows.push({ label: "Main residence relief (full exemption)", amount: 0 });
    warnings.push(
      "Main residence relief applied — the full gain is exempt. This assumes the property was your only or main home throughout ownership."
    );
  } else if (gain <= 0) {
    taxableGain = 0;
    warnings.push("This is a capital loss. Losses can be carried forward against future gains — no tax is due now.");
  } else {
    const aea = year.annualExemptAmount;
    taxableGain = Math.max(0, gain - aea);
    if (aea > 0) {
      rows.push({ label: "Annual Exempt Amount applied", amount: -Math.min(gain, aea), rate: 0 });
    }

    const income = Math.max(0, input.taxableIncome ?? 0);
    if (input.taxableIncome === undefined || !Number.isFinite(input.taxableIncome)) {
      warnings.push("No other taxable income entered — assuming £0, so the whole taxable gain is treated as within the basic-rate band.");
    }

    // Portion of the gain inside the unused basic-rate band is taxed at the
    // lower CGT rate; the remainder at the higher rate.
    const unusedBasicBand = Math.max(0, year.basicBandUpperLimit - income);
    const split = splitAcrossBands(taxableGain, unusedBasicBand, year.basicRate, year.higherRate);
    tax = split.total;
    rows.push(...split.rows);
  }

  return {
    countryCode: "GB",
    countryName: cgtUk.countryName,
    currencyCode: cgtUk.currencyCode,
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
