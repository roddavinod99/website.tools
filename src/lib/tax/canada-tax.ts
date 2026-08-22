import type { TaxCalculationInput, TaxResult } from "../tax/types";
import { calculateTax } from "../tax/calculate";
import { canadaTaxConfig } from "../data/tax/canada/config";

export function calculateCanadaTax(input: TaxCalculationInput): TaxResult {
  return calculateTax({ ...input, countryCode: "CA" }, canadaTaxConfig);
}