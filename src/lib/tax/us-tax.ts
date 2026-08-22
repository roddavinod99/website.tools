import type { TaxCalculationInput, TaxResult } from "../tax/types";
import { calculateTax } from "../tax/calculate";
import { usTaxConfig } from "../data/tax/us/config";

export function calculateUsTax(input: TaxCalculationInput): TaxResult {
  return calculateTax({ ...input, countryCode: "US" }, usTaxConfig);
}