"use client";

import { CountryTaxCalculator } from "@/components/finance/country-tax-calculator";

export function IncomeTaxCalculator() {
  return <CountryTaxCalculator defaultCountry="US" defaultCurrency="USD" />;
}