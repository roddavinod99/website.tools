import type { CgtBreakdownRow, CgtInput, CgtResult } from "./cgt-types";
import { computeCapitalGain, isValidCgtBase } from "./cgt-engine";
import { cgtIndia, pickCgtYear, type CgtTaxYearData } from "@/lib/data/cgt/config";

interface IndiaYear extends CgtTaxYearData {
  holdingPeriodMonths: Record<string, number>;
  stcgFlatRates: Record<string, number>;
  ltcgFlatRates: Record<string, number>;
  slabRateAssets: string[];
  cryptoFlatRate: number;
  indexationAllowed: boolean;
  ltcgExemption?: { amount: number; appliesTo: string[]; description?: string };
}

export function calculateCgtIndia(input: CgtInput): CgtResult | null {
  if (!isValidCgtBase(input)) return null;

  const year = pickCgtYear(cgtIndia, input.taxYearId) as IndiaYear;
  const gain = computeCapitalGain(input);
  const warnings: string[] = [];
  const rows: CgtBreakdownRow[] = [];

  let treatment: CgtResult["treatment"] = "not-applicable";
  let taxableGain = 0;
  let tax = 0;

  if (input.assetType === "crypto") {
    treatment = "not-applicable";
    taxableGain = Math.max(0, gain);
    if (taxableGain > 0) {
      tax = taxableGain * year.cryptoFlatRate;
      rows.push({ label: "Crypto/VDA flat rate", rate: year.cryptoFlatRate, amount: tax });
    }
    if (gain < 0) {
      warnings.push("Virtual digital asset losses cannot be offset against other income in India.");
    }
  } else {
    const thresholdMonths = year.holdingPeriodMonths[input.assetType] ?? 24;
    treatment = input.holdingPeriodMonths > thresholdMonths ? "long-term" : "short-term";

    if (treatment === "short-term") {
      taxableGain = Math.max(0, gain);
      const flatRate = year.stcgFlatRates[input.assetType];
      if (flatRate !== undefined) {
        tax = taxableGain * flatRate;
        rows.push({ label: "Short-term rate", rate: flatRate, amount: tax });
      } else {
        const slabPct = Number.isFinite(input.indiaMarginalSlabPct)
          ? Math.min(Math.max(input.indiaMarginalSlabPct!, 0), 60)
          : 30;
        const rate = slabPct / 100;
        tax = taxableGain * rate;
        rows.push({ label: `Slab-rate estimate (${slabPct}%)`, rate, amount: tax });
        warnings.push(
          `Short-term gains on this asset are taxed at your income-tax slab rate. Using the ${slabPct}% you entered — adjust it for a closer estimate.`
        );
      }
    } else {
      taxableGain = Math.max(0, gain);
      const exemption = year.ltcgExemption;
      if (exemption?.appliesTo.includes(input.assetType) && taxableGain > 0) {
        const used = Math.min(taxableGain, exemption.amount);
        taxableGain -= used;
        rows.push({ label: "LTCG exemption applied", amount: -used });
      }
      const rate = year.ltcgFlatRates[input.assetType] ?? 0.125;
      if (taxableGain > 0) {
        tax = taxableGain * rate;
        rows.push({ label: "Long-term rate (no indexation)", rate, amount: tax });
      }
      if (!year.indexationAllowed) {
        warnings.push("Indexation benefit is not available for transfers on or after 23 July 2024.");
      }
    }
  }

  if (gain <= 0 && input.assetType !== "crypto") {
    warnings.push("This is a capital loss. Losses may be carried forward for up to 8 assessment years — tax is ₹0 here.");
  }

  return {
    countryCode: "IN",
    countryName: cgtIndia.countryName,
    currencyCode: cgtIndia.currencyCode,
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
