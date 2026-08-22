import { calculateUsTax } from "./us-tax";
import { calculateIndiaTax } from "./india-tax";
import { calculateUkTax } from "./uk-tax";
import { calculateCanadaTax } from "./canada-tax";
import { calculateAustraliaTax } from "./australia-tax";
import type { TaxCalculationInput, TaxResult } from "./types";

export function calculateTaxByCountry(input: TaxCalculationInput): TaxResult {
  switch (input.countryCode) {
    case "US":
      return calculateUsTax(input);
    case "IN":
      return calculateIndiaTax(input);
    case "GB":
      return calculateUkTax(input);
    case "CA":
      return calculateCanadaTax(input);
    case "AU":
      return calculateAustraliaTax(input);
    default:
      throw new Error(`Unsupported country: ${input.countryCode}`);
  }
}

export {
  calculateUsTax,
  calculateIndiaTax,
  calculateUkTax,
  calculateCanadaTax,
  calculateAustraliaTax,
};