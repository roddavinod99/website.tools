import type { CountryTaxConfig, TaxYearConfig } from "@/lib/tax/types";
import us2025 from "./2025.json";

export const usTaxConfig: CountryTaxConfig = {
  countryCode: "US",
  countryName: "United States",
  currencyCode: "USD",
  taxYears: [us2025 as TaxYearConfig],
  defaultTaxYear: "2025",
};