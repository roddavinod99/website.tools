export interface VatGstInput {
  amount: number;
  rate: number;
  mode: "exclusive" | "inclusive";
  // For Canada provincial breakdown
  federalRate?: number;
  provincialRate?: number;
}

export interface VatGstResult {
  tax: number;
  total: number;
  base: number;
  // For Canada breakdown
  federalTax?: number;
  provincialTax?: number;
  showBreakdown?: boolean;
}

/**
 * Calculate VAT/GST/Sales Tax.
 * mode = "exclusive": amount is net price, tax added on top.
 * mode = "inclusive": amount is gross price including tax.
 */
export function calculateVatGst(input: VatGstInput): VatGstResult {
  const { amount, rate, mode, federalRate, provincialRate } = input;

  if (mode === "exclusive") {
    // amount is net price
    const tax = amount * rate;
    const result: VatGstResult = {
      tax,
      total: amount + tax,
      base: amount,
    };
    if (federalRate !== undefined) {
      result.federalTax = amount * federalRate;
    }
    if (provincialRate !== undefined) {
      result.provincialTax = amount * provincialRate;
    }
    return result;
  } else {
    // inclusive: amount includes tax
    const base = amount / (1 + rate);
    const tax = amount - base;
    const result: VatGstResult = {
      tax,
      total: amount,
      base,
    };
    if (federalRate !== undefined) {
      // federal portion of tax = base * federalRate
      result.federalTax = base * federalRate;
    }
    if (provincialRate !== undefined) {
      result.provincialTax = base * provincialRate;
    }
    return result;
  }
}

/**
 * For Canada: given combined rate and province, split into federal + provincial if possible.
 * This is a best‑effort approximation using known HST/GST+PST structures.
 */
export function splitCanadaRate(
  combinedRate: number,
  provinceCode?: string
): { federalRate: number; provincialRate: number } | null {
  if (!provinceCode) return null;
  const rates = getVatGstRate("CA");
  const province = rates?.provinces?.find((p) => p.code === provinceCode);
  if (!province) return null;

  // HST provinces: combined rate = federal 5% + provincial part
  if (province.type === "HST") {
    const federal = 0.05;
    const provincial = province.rate - federal;
    return { federalRate: federal, provincialRate: Math.max(0, provincial) };
  }
  // GST+PST (BC, MB, SK, QC)
  if (province.type === "GST+PST" || province.type === "GST+QST") {
    const federal = 0.05;
    const provincial = province.rate - federal;
    return { federalRate: federal, provincialRate: Math.max(0, provincial) };
  }
  // GST only (AB, NT, NU, YT)
  if (province.type === "GST") {
    return { federalRate: province.rate, provincialRate: 0 };
  }
  return null;
}

// import getVatGstRate from data file
import { getVatGstRate } from "@/lib/data/vat-gst-rates";