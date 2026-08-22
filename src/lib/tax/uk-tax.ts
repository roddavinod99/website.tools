import type { TaxCalculationInput, TaxResult } from "../tax/types";
import { calculateTax } from "../tax/calculate";
import { ukTaxConfig } from "../data/tax/uk/config";

export function calculateUkTax(input: TaxCalculationInput): TaxResult {
  return calculateTax({ ...input, countryCode: "GB" }, ukTaxConfig);
}