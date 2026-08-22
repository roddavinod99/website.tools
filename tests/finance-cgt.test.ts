import { describe, it, expect } from "vitest";
import { calculateCgtIndia } from "@/lib/tax/cgt-india";
import { calculateCgtUs } from "@/lib/tax/cgt-us";
import { calculateCgtUk } from "@/lib/tax/cgt-uk";
import { calculateCgtCanada } from "@/lib/tax/cgt-canada";
import { calculateCgtAustralia } from "@/lib/tax/cgt-australia";
import type { CgtInput } from "@/lib/tax/cgt-types";

function expectClose(actual: number, expected: number, precision = 6): void {
  expect(actual).toBeCloseTo(expected, precision);
}

function IN(input: Partial<CgtInput> = {}): CgtInput {
  return { countryCode: "IN", ...input } as CgtInput;
}
function US(input: Partial<CgtInput> = {}): CgtInput {
  return { countryCode: "US", filingStatus: "single", taxableIncome: 100000, ...input } as CgtInput;
}
function UK(input: Partial<CgtInput> = {}): CgtInput {
  return { countryCode: "GB", ...input } as CgtInput;
}
function CA(input: Partial<CgtInput> = {}): CgtInput {
  return { countryCode: "CA", province: "on", taxableIncome: 80000, ...input } as CgtInput;
}
function AU(input: Partial<CgtInput> = {}): CgtInput {
  return { countryCode: "AU", taxableIncome: 80000, residency: "resident", ...input } as CgtInput;
}

describe("CGT India", () => {
  it("ST listed shares (≤12m) at 20%", () => {
    const r = calculateCgtIndia(IN({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 150000, expenses: 0, holdingPeriodMonths: 6 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 50000);
    expectClose(r!.taxableGain, 50000);
    expectClose(r!.estimatedTax, 10000);
    expect(r!.treatment).toBe("short-term");
  });

  it("LT listed shares (>12m) with ₹1.25L exemption", () => {
    const r = calculateCgtIndia(IN({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 300000, expenses: 0, holdingPeriodMonths: 18 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 200000);
    expectClose(r!.taxableGain, 75000);
    expectClose(r!.estimatedTax, 9375);
    expect(r!.treatment).toBe("long-term");
  });

  it("LT listed shares — big gain exceeds exemption", () => {
    const r = calculateCgtIndia(IN({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 500000, expenses: 0, holdingPeriodMonths: 24 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 400000);
    expectClose(r!.taxableGain, 275000);
    expectClose(r!.estimatedTax, 34375);
    expect(r!.treatment).toBe("long-term");
  });

  it("LT property (>24m) at 12.5% no indexation", () => {
    const r = calculateCgtIndia(IN({ assetType: "property", purchasePrice: 100000, salePrice: 200000, expenses: 0, holdingPeriodMonths: 36 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 100000);
    expectClose(r!.taxableGain, 100000);
    expectClose(r!.estimatedTax, 12500);
    expect(r!.treatment).toBe("long-term");
  });

  it("ST property (≤24m) at slab rate estimate 30%", () => {
    const r = calculateCgtIndia(IN({ assetType: "property", purchasePrice: 100000, salePrice: 150000, expenses: 0, holdingPeriodMonths: 12, indiaMarginalSlabPct: 30 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 50000);
    expectClose(r!.taxableGain, 50000);
    expectClose(r!.estimatedTax, 15000);
    expect(r!.treatment).toBe("short-term");
  });

  it("Crypto flat 30% regardless of holding period", () => {
    const r = calculateCgtIndia(IN({ assetType: "crypto", purchasePrice: 100000, salePrice: 150000, expenses: 0, holdingPeriodMonths: 6 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 50000);
    expectClose(r!.taxableGain, 50000);
    expectClose(r!.estimatedTax, 15000);
    expect(r!.treatment).toBe("not-applicable");
  });

  it("Loss → zero tax, warning", () => {
    const r = calculateCgtIndia(IN({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 80000, expenses: 0, holdingPeriodMonths: 18 }));
    expect(r).not.toBeNull();
    expect(r!.capitalGain).toBe(-20000);
    expect(r!.taxableGain).toBe(0);
    expect(r!.estimatedTax).toBe(0);
    expect(r!.warnings.some((w: string) => w.includes("capital loss"))).toBe(true);
  });
});

describe("CGT US", () => {
  const makeUS = (overrides: Partial<CgtInput> = {}): CgtInput => ({
    countryCode: "US",
    filingStatus: "single",
    taxableIncome: 100000,
    ...overrides,
  } as CgtInput);

  it("ST at ordinary rates", () => {
    const r = calculateCgtUs(US({ assetType: "listed-shares", purchasePrice: 10000, salePrice: 20000, expenses: 0, holdingPeriodMonths: 6 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 10000);
    expectClose(r!.estimatedTax, 2333, 0);
    expect(r!.treatment).toBe("short-term");
  });

  it("LT low income crosses 0% → 15% boundary", () => {
    const r = calculateCgtUs(US({ assetType: "listed-shares", purchasePrice: 10000, salePrice: 20000, expenses: 0, holdingPeriodMonths: 18, taxableIncome: 40000 }));
    expect(r).not.toBeNull();
    expectClose(r!.estimatedTax, 446.25, 1);
    expect(r!.treatment).toBe("long-term");
  });

  it("LT high income → 20% bracket", () => {
    const r = calculateCgtUs(US({ assetType: "listed-shares", purchasePrice: 50000, salePrice: 100000, expenses: 0, holdingPeriodMonths: 24, taxableIncome: 600000 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 50000);
    const baseRow = r!.breakdown.find((b) => b.label.includes("Long-term"));
    expectClose(baseRow!.amount, 10000);
    const niitRow = r!.breakdown.find((b) => b.label.includes("Investment Income Tax"));
    expectClose(niitRow!.amount, 1900);
    expectClose(r!.estimatedTax, 11900);
    expect(r!.treatment).toBe("long-term");
  });

  it("NIIT triggers above threshold", () => {
    const r = calculateCgtUs(US({ purchasePrice: 100000, salePrice: 150000, expenses: 0, holdingPeriodMonths: 24, taxableIncome: 180000 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 50000);
    expectClose(r!.estimatedTax - 1140, 7500, 1);
    expect(r!.breakdown.some((b: { label: string }) => b.label.includes("Investment Income Tax"))).toBe(true);
  });

  it("Loss → zero tax, warning", () => {
    const r = calculateCgtUs(US({ purchasePrice: 100000, salePrice: 80000, expenses: 0, holdingPeriodMonths: 18, taxableIncome: 50000 }));
    expect(r).not.toBeNull();
    expect(r!.capitalGain).toBe(-20000);
    expect(r!.taxableGain).toBe(0);
    expect(r!.estimatedTax).toBe(0);
    expect(r!.warnings.some((w: string) => w.includes("capital loss"))).toBe(true);
  });
});

describe("CGT UK", () => {
  const makeUK = (overrides: Partial<CgtInput> = {}): CgtInput => ({
    countryCode: "GB",
    ...overrides,
  } as CgtInput);

  it("AEA £3,000 applied", () => {
    const r = calculateCgtUk(makeUK({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 150000, expenses: 0, holdingPeriodMonths: 24, taxableIncome: 30000 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 50000);
    expectClose(r!.taxableGain, 47000);
    expectClose(r!.estimatedTax, 10818);
    expect(r!.treatment).toBe("not-applicable");
  });

  it("Main residence fully exempt", () => {
    const r = calculateCgtUk(makeUK({ assetType: "property", purchasePrice: 200000, salePrice: 400000, expenses: 0, holdingPeriodMonths: 60, taxableIncome: 50000, isMainResidence: true }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 200000);
    expect(r!.taxableGain).toBe(0);
    expect(r!.estimatedTax).toBe(0);
    expect(r!.breakdown.some((b: { label: string }) => b.label.includes("Main residence"))).toBe(true);
  });

  it("Higher rate all in higher band", () => {
    const r = calculateCgtUk(makeUK({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 110000, expenses: 0, holdingPeriodMonths: 24, taxableIncome: 60000 }));
    expect(r).not.toBeNull();
    expectClose(r!.estimatedTax, 1680);
  });
});

describe("CGT Canada", () => {
  const makeCA = (overrides: Partial<CgtInput> = {}): CgtInput => ({
    countryCode: "CA",
    province: "on",
    taxableIncome: 80000,
    ...overrides,
  } as CgtInput);

  it("50% inclusion, combined marginal", () => {
    const r = calculateCgtCanada(CA({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 140000, expenses: 0, holdingPeriodMonths: 36, province: "on", taxableIncome: 80000 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 40000);
    expectClose(r!.taxableGain, 20000);
    expect(r!.estimatedTax).toBeGreaterThan(5500);
    expect(r!.estimatedTax).toBeLessThan(7000);
    expect(r!.treatment).toBe("not-applicable");
  });

  it("Principal residence exemption", () => {
    const r = calculateCgtCanada(CA({ assetType: "property", purchasePrice: 300000, salePrice: 500000, expenses: 0, holdingPeriodMonths: 60, province: "on", taxableIncome: 80000, isMainResidence: true }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 200000);
    expect(r!.taxableGain).toBe(0);
    expect(r!.estimatedTax).toBe(0);
  });

  it("Loss → zero tax, carryforward note", () => {
    const r = calculateCgtCanada(CA({ assetType: "listed-shares", purchasePrice: 50000, salePrice: 40000, expenses: 0, holdingPeriodMonths: 12, province: "on", taxableIncome: 80000 }));
    expect(r).not.toBeNull();
    expect(r!.capitalGain).toBe(-10000);
    expect(r!.taxableGain).toBe(0);
    expect(r!.estimatedTax).toBe(0);
  });
});

describe("CGT Australia", () => {
  const makeAU = (overrides: Partial<CgtInput> = {}): CgtInput => ({
    countryCode: "AU",
    taxableIncome: 80000,
    residency: "resident",
    ...overrides,
  } as CgtInput);

  it("50% discount after 12m for resident", () => {
    const r = calculateCgtAustralia(AU({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 140000, expenses: 0, holdingPeriodMonths: 24, residency: "resident", taxableIncome: 80000 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 40000);
    expectClose(r!.taxableGain, 20000);
    expect(r!.estimatedTax).toBeGreaterThan(6000);
    expect(r!.estimatedTax).toBeLessThan(7500);
    expect(r!.treatment).toBe("long-term");
  });

  it("No discount for <12m", () => {
    const r = calculateCgtAustralia(AU({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 140000, expenses: 0, holdingPeriodMonths: 6, residency: "resident", taxableIncome: 80000 }));
    expect(r).not.toBeNull();
    expectClose(r!.taxableGain, 40000);
    expect(r!.treatment).toBe("short-term");
  });

  it("Foreign resident no discount", () => {
    const r = calculateCgtAustralia(AU({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 140000, expenses: 0, holdingPeriodMonths: 24, residency: "foreign", taxableIncome: 80000 }));
    expect(r).not.toBeNull();
    expectClose(r!.taxableGain, 40000);
    expect(r!.warnings.some((w: string) => /foreign[- ]resident/i.test(w))).toBe(true);
  });

  it("Main residence exempt", () => {
    const r = calculateCgtAustralia(AU({ assetType: "property", purchasePrice: 500000, salePrice: 800000, expenses: 0, holdingPeriodMonths: 60, residency: "resident", taxableIncome: 80000, isMainResidence: true }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 300000);
    expect(r!.taxableGain).toBe(0);
    expect(r!.estimatedTax).toBe(0);
  });
});

describe("Edge cases", () => {
  it("Zero/negative gain → zero tax", () => {
    const r = calculateCgtIndia(IN({ assetType: "listed-shares", purchasePrice: 100000, salePrice: 100000, expenses: 0, holdingPeriodMonths: 18 }));
    expect(r).not.toBeNull();
    expectClose(r!.capitalGain, 0);
    expectClose(r!.estimatedTax, 0);
  });

  it("Crypto loss shows VDA warning", () => {
    const r = calculateCgtIndia(IN({ assetType: "crypto", purchasePrice: 100000, salePrice: 80000, expenses: 0, holdingPeriodMonths: 12 }));
    expect(r).not.toBeNull();
    expect(r!.capitalGain).toBe(-20000);
    expect(r!.warnings.some((w: string) => w.includes("cannot be offset"))).toBe(true);
  });
});