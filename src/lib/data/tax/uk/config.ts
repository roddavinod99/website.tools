import type { CountryTaxConfig, TaxYearConfig } from "@/lib/tax/types";
import uk202425 from "./2024-25.json";

export const ukTaxConfig: CountryTaxConfig = {
  countryCode: "GB",
  countryName: "United Kingdom",
  currencyCode: "GBP",
  taxYears: [uk202425 as unknown as TaxYearConfig],
  defaultTaxYear: "2024-25",
};