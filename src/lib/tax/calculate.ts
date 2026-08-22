import type {
  TaxCalculationInput,
  TaxResult,
  TaxBracketResult,
  TaxRegimeConfig,
  CountryTaxConfig,
} from "./types";

export function calculateTax(input: TaxCalculationInput, countryConfig: CountryTaxConfig): TaxResult {
  const taxYearConfig = countryConfig.taxYears.find((y) => y.year === input.taxYear);
  if (!taxYearConfig) {
    throw new Error(`Tax year ${input.taxYear} not found for ${countryConfig.countryCode}`);
  }

  let regimeConfig: TaxRegimeConfig | undefined;
  if (input.regionCode) {
    const region = taxYearConfig.regions?.find((r) => r.code === input.regionCode);
    if (region) {
      const regionYearConfig = region.taxYearOverrides.find((y) => y.year === input.taxYear);
      if (regionYearConfig) {
        regimeConfig = regionYearConfig.regimes.find((r) => r.id === (input.regimeId || regionYearConfig.defaultRegime));
      }
    }
  }

  if (!regimeConfig) {
    regimeConfig = taxYearConfig.regimes.find((r) => r.id === (input.regimeId || taxYearConfig.defaultRegime));
  }

  if (!regimeConfig) {
    throw new Error(`Regime ${input.regimeId} not found for ${countryConfig.countryCode} ${input.taxYear}`);
  }

  const standardDeduction = regimeConfig.standardDeduction;
  let totalDeductions = standardDeduction;
  const deductionsClaimed: Record<string, number> = {};

  if (input.deductions) {
    for (const [key, amount] of Object.entries(input.deductions)) {
      const deductionConfig = regimeConfig.deductions.find((d) => d.name === key);
      if (deductionConfig && (!deductionConfig.applicableRegimes || deductionConfig.applicableRegimes.includes(regimeConfig!.id))) {
        const allowed = Math.min(amount, deductionConfig.maxAmount);
        deductionsClaimed[key] = allowed;
        totalDeductions += allowed;
      }
    }
  }

  const taxableIncome = Math.max(0, input.grossIncome - totalDeductions);

  let totalTax = 0;
  const brackets: TaxBracketResult[] = [];
  let marginalRate = 0;

  for (const slab of regimeConfig.slabs) {
    if (taxableIncome <= slab.min) break;
    const upper = Math.min(taxableIncome, slab.max);
    const inBracket = upper - slab.min;
    if (inBracket <= 0) continue;
    const taxInBracket = inBracket * slab.rate;
    totalTax += taxInBracket;
    marginalRate = slab.rate;
    brackets.push({ bracket: slab, taxableInBracket: inBracket, taxInBracket });
  }

  const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return {
    grossIncome: input.grossIncome,
    taxableIncome,
    totalTax,
    marginalRate,
    effectiveRate,
    brackets,
    regimeId: regimeConfig.id,
    taxYear: input.taxYear,
    countryCode: input.countryCode,
    regionCode: input.regionCode,
    standardDeduction,
    deductionsClaimed,
  };
}

export function getCountryConfig(configs: CountryTaxConfig[], countryCode: string): CountryTaxConfig | undefined {
  return configs.find((c) => c.countryCode === countryCode);
}

export function getAvailableCountries(configs: CountryTaxConfig[]): { code: string; name: string; currencyCode: string }[] {
  return configs.map((c) => ({
    code: c.countryCode,
    name: c.countryName,
    currencyCode: c.currencyCode,
  }));
}

export function getTaxYears(config: CountryTaxConfig): { year: string; label: string }[] {
  return config.taxYears.map((y) => ({ year: y.year, label: y.label }));
}

export function getRegimesForYear(config: CountryTaxConfig, taxYear: string, regionCode?: string): TaxRegimeConfig[] {
  const taxYearConfig = config.taxYears.find((y) => y.year === taxYear);
  if (!taxYearConfig) return [];

  if (regionCode && taxYearConfig.regions) {
    const region = taxYearConfig.regions.find((r) => r.code === regionCode);
    if (region) {
      const regionYearConfig = region.taxYearOverrides.find((y) => y.year === taxYear);
      if (regionYearConfig) return regionYearConfig.regimes;
    }
  }

  return taxYearConfig.regimes;
}

export function getRegionsForYear(config: CountryTaxConfig, taxYear: string): { code: string; label: string }[] {
  const taxYearConfig = config.taxYears.find((y) => y.year === taxYear);
  if (!taxYearConfig?.regions) return [];

  return taxYearConfig.regions.map((r) => ({ code: r.code, label: r.label }));
}