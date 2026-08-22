import type { TaxCalculationInput, TaxResult } from "../tax/types";
import { calculateTax } from "../tax/calculate";
import { australiaTaxConfig } from "../data/tax/australia/config";

export function calculateAustraliaTax(input: TaxCalculationInput): TaxResult {
  return calculateTax({ ...input, countryCode: "AU" }, australiaTaxConfig);
}