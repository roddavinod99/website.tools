import type { TaxCalculationInput, TaxResult } from "../tax/types";
import { calculateTax } from "../tax/calculate";
import { indiaTaxConfig } from "../data/tax/india/config";

export function calculateIndiaTax(input: TaxCalculationInput): TaxResult {
  return calculateTax({ ...input, countryCode: "IN" }, indiaTaxConfig);
}