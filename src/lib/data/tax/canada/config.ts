import type { CountryTaxConfig, TaxYearConfig } from "@/lib/tax/types";
import canadaFederal from "./2024-federal.json";

export const canadaTaxConfig: CountryTaxConfig = {
  countryCode: "CA",
  countryName: "Canada",
  currencyCode: "CAD",
  taxYears: [canadaFederal as TaxYearConfig],
  defaultTaxYear: "2024",
};