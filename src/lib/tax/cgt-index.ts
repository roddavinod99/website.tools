import type { CgtAssetTypeId, CgtCountryMeta, CgtInput, CgtResult } from "./cgt-types";
import { cgtAustralia, cgtCanada, cgtIndia, cgtUs, cgtUk, type CgtCountryData } from "@/lib/data/cgt/config";
import { calculateCgtIndia } from "./cgt-india";
import { calculateCgtUs } from "./cgt-us";
import { calculateCgtUk } from "./cgt-uk";
import { calculateCgtCanada } from "./cgt-canada";
import { calculateCgtAustralia } from "./cgt-australia";

export * from "./cgt-types";
export { computeCapitalGain } from "./cgt-engine";

const ASSET_LABELS: Record<CgtAssetTypeId, string> = {
  "listed-shares": "Listed shares / equity funds",
  "unlisted-shares": "Unlisted shares",
  property: "Property",
  crypto: "Crypto / VDA",
  other: "Other assets",
};

function buildMeta(data: CgtCountryData, overrides: Partial<CgtCountryMeta>): CgtCountryMeta {
  return {
    code: data.countryCode,
    name: data.countryName,
    currencyCode: data.currencyCode,
    defaultTaxYearId: data.defaultTaxYearId,
    taxYears: data.taxYears.map((y) => ({ id: y.id, label: y.label })),
    usesHoldingPeriod: true,
    holdingPeriodExemptAssets: [],
    assetTypes: (Object.keys(ASSET_LABELS) as CgtAssetTypeId[]).map((id) => ({
      id,
      label: ASSET_LABELS[id],
    })),
    supportsMainResidence: false,
    needsFilingStatus: false,
    needsTaxableIncome: false,
    taxableIncomeLabel: "Taxable income (other sources)",
    needsProvince: false,
    needsResidency: false,
    ...overrides,
  };
}

const INDIA_META = buildMeta(cgtIndia, {
  usesHoldingPeriod: true,
  holdingPeriodExemptAssets: ["crypto"],
  needsIndiaMarginalSlab: true,
});

const US_META = buildMeta(cgtUs, {
  needsFilingStatus: true,
  needsTaxableIncome: true,
  taxableIncomeLabel: "Taxable income (other sources)",
});

const UK_META = buildMeta(cgtUk, {
  usesHoldingPeriod: false,
  supportsMainResidence: true,
  needsTaxableIncome: true,
  taxableIncomeLabel: "Taxable income (other sources)",
});

const CANADA_META = buildMeta(cgtCanada, {
  usesHoldingPeriod: false,
  supportsMainResidence: true,
  needsProvince: true,
  needsTaxableIncome: true,
  taxableIncomeLabel: "Taxable income (other sources)",
});

const AUSTRALIA_META = buildMeta(cgtAustralia, {
  supportsMainResidence: true,
  needsResidency: true,
  needsTaxableIncome: true,
  taxableIncomeLabel: "Taxable income (other sources)",
});

export const CGT_COUNTRY_METAS: Record<string, CgtCountryMeta> = {
  IN: INDIA_META,
  US: US_META,
  GB: UK_META,
  CA: CANADA_META,
  AU: AUSTRALIA_META,
};

export function getCgtCountries(): CgtCountryMeta[] {
  return [INDIA_META, US_META, UK_META, CANADA_META, AUSTRALIA_META];
}

export function getCgtCountryMeta(code: string): CgtCountryMeta | undefined {
  return CGT_COUNTRY_METAS[code];
}

export function calculateCgtByCountry(input: CgtInput): CgtResult | null {
  switch (input.countryCode) {
    case "IN":
      return calculateCgtIndia(input);
    case "US":
      return calculateCgtUs(input);
    case "GB":
      return calculateCgtUk(input);
    case "CA":
      return calculateCgtCanada(input);
    case "AU":
      return calculateCgtAustralia(input);
    default:
      return null;
  }
}
