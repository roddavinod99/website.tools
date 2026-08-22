export type CgtAssetTypeId = "listed-shares" | "unlisted-shares" | "property" | "crypto" | "other";

export interface CgtInput {
  countryCode: string;
  assetType: CgtAssetTypeId;
  purchasePrice: number;
  salePrice: number;
  expenses: number;
  holdingPeriodMonths: number;
  taxYearId?: string;
  /** US: single | mfj | hoh */
  filingStatus?: string;
  /** US / UK / CA / AU: taxable income from other sources (after deductions) */
  taxableIncome?: number;
  /** India: marginal slab rate percent for ST non-equity assets */
  indiaMarginalSlabPct?: number;
  /** Canada: province/territory code */
  province?: string;
  /** Australia: resident or foreign */
  residency?: "resident" | "foreign";
  /** UK / CA / AU: main-residence exemption */
  isMainResidence?: boolean;
}

export interface CgtBreakdownRow {
  label: string;
  /** decimal fraction, omitted when not a simple rate */
  rate?: number;
  amount: number;
}

export interface CgtResult {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  taxYearLabel: string;
  treatment: "short-term" | "long-term" | "not-applicable";
  capitalGain: number;
  taxableGain: number;
  estimatedTax: number;
  netGainAfterTax: number;
  effectiveRateOnGainPct: number;
  breakdown: CgtBreakdownRow[];
  warnings: string[];
}

export interface CgtBracket {
  min: number;
  max: number;
  rate: number;
}

/** Declarative descriptor so the shared UI never hardcodes country logic. */
export interface CgtCountryMeta {
  code: string;
  name: string;
  currencyCode: string;
  defaultTaxYearId: string;
  taxYears: { id: string; label: string }[];
  usesHoldingPeriod: boolean;
  /** asset types where holding period is irrelevant even though the country uses it */
  holdingPeriodExemptAssets?: CgtAssetTypeId[];
  assetTypes: { id: CgtAssetTypeId; label: string }[];
  supportsMainResidence: boolean;
  needsFilingStatus: boolean;
  needsTaxableIncome: boolean;
  taxableIncomeLabel?: string;
  needsProvince: boolean;
  needsResidency: boolean;
  needsIndiaMarginalSlab?: boolean;
}
