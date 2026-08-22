import type { CountryTaxConfig, TaxYearConfig } from "@/lib/tax/types";
import indiaFY202425 from "./fy-2024-25.json";
import indiaFY202526 from "./fy-2025-26.json";

export const indiaTaxConfig: CountryTaxConfig = {
  countryCode: "IN",
  countryName: "India",
  currencyCode: "INR",
  taxYears: [indiaFY202425 as TaxYearConfig, indiaFY202526 as TaxYearConfig],
  defaultTaxYear: "fy-2025-26",
};