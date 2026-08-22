export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
}

export interface DeductionConfig {
  name: string;
  maxAmount: number;
  description?: string;
  applicableRegimes?: string[];
}

export interface TaxRegimeConfig {
  id: string;
  label: string;
  description?: string;
  standardDeduction: number;
  slabs: TaxSlab[];
  deductions: DeductionConfig[];
}

export interface TaxYearConfig {
  year: string;
  label: string;
  regimes: TaxRegimeConfig[];
  defaultRegime: string;
  regions?: {
    code: string;
    label: string;
    taxYearOverrides: TaxYearConfig[];
  }[];
}

export interface CountryTaxConfig {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  taxYears: TaxYearConfig[];
  defaultTaxYear: string;
  regions?: {
    code: string;
    label: string;
    taxYearOverrides: TaxYearConfig[];
  }[];
}

export interface TaxCalculationInput {
  grossIncome: number;
  countryCode: string;
  taxYear: string;
  regionCode?: string;
  regimeId?: string;
  deductions?: Record<string, number>;
}

export interface TaxBracketResult {
  bracket: TaxSlab;
  taxableInBracket: number;
  taxInBracket: number;
}

export interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  totalTax: number;
  marginalRate: number;
  effectiveRate: number;
  brackets: TaxBracketResult[];
  regimeId: string;
  taxYear: string;
  countryCode: string;
  regionCode?: string;
  standardDeduction: number;
  deductionsClaimed: Record<string, number>;
}