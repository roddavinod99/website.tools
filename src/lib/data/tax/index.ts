export { indiaTaxConfig } from "./india/config";
export { ukTaxConfig } from "./uk/config";
export { canadaTaxConfig } from "./canada/config";
export { australiaTaxConfig } from "./australia/config";
export { usTaxConfig } from "./us/config";

import type { CountryTaxConfig, TaxRegimeConfig } from "@/lib/tax/types";
import { indiaTaxConfig } from "./india/config";
import { ukTaxConfig } from "./uk/config";
import { canadaTaxConfig } from "./canada/config";
import { australiaTaxConfig } from "./australia/config";
import { usTaxConfig } from "./us/config";

export const allCountryTaxConfigs: CountryTaxConfig[] = [
  usTaxConfig,
  indiaTaxConfig,
  ukTaxConfig,
  canadaTaxConfig,
  australiaTaxConfig,
];

export function getCountryTaxConfig(countryCode: string): CountryTaxConfig | undefined {
  return allCountryTaxConfigs.find((c) => c.countryCode === countryCode);
}

export function getAllCountries(): { code: string; name: string; currencyCode: string }[] {
  return allCountryTaxConfigs.map((c) => ({
    code: c.countryCode,
    name: c.countryName,
    currencyCode: c.currencyCode,
  }));
}

export function getTaxYears(config: CountryTaxConfig): { year: string; label: string }[] {
  return config.taxYears.map((y) => ({ year: y.year, label: y.label }));
}

export function getRegimesForYear(config: CountryTaxConfig, taxYear: string, regionCode?: string): TaxRegimeConfig[] {
  const taxYearConfig = config.taxYears.find((y) => y.year === taxYear);
  if (!taxYearConfig) return [];

  if (regionCode && taxYearConfig.regions) {
    const region = taxYearConfig.regions.find((r) => r.code === regionCode);
    if (region) {
      const regionYearConfig = region.taxYearOverrides.find((y) => y.year === taxYear);
      if (regionYearConfig) return regionYearConfig.regimes;
    }
  }

  return taxYearConfig.regimes;
}

export function getRegionsForYear(config: CountryTaxConfig, taxYear: string): { code: string; label: string }[] {
  const taxYearConfig = config.taxYears.find((y) => y.year === taxYear);
  if (!taxYearConfig?.regions) return [];

  return taxYearConfig.regions.map((r) => ({ code: r.code, label: r.label }));
}