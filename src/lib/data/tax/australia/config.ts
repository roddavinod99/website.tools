import type { CountryTaxConfig, TaxYearConfig } from "@/lib/tax/types";
import australia202425 from "./2024-25.json";

export const australiaTaxConfig: CountryTaxConfig = {
  countryCode: "AU",
  countryName: "Australia",
  currencyCode: "AUD",
  taxYears: [australia202425 as TaxYearConfig],
  defaultTaxYear: "2024-25",
};