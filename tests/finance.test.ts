import { describe, it, expect } from "vitest";
import {
  nominalMonthlyRate,
  lumpSumFutureValue,
  recurringFutureValue,
  compoundFutureValue,
  sipFutureValue,
  growthSchedule,
  loanEmi,
  amortizationSchedule,
  cagr,
  roi,
  profitMargin,
  dtiRatio,
  creditCardPayoff,
  savingsGoal,
  calculateUsTax,
} from "@/lib/finance/calculations";

function expectClose(actual: number, expected: number, precision = 6): void {
  expect(actual).toBeCloseTo(expected, precision);
}

describe("nominalMonthlyRate", () => {
  it("converts annual percent to monthly decimal", () => {
    expectClose(nominalMonthlyRate(0), 0);
    expectClose(nominalMonthlyRate(12), 0.01);
    expectClose(nominalMonthlyRate(6.5), 0.0054166667, 7);
  });
});

describe("lumpSumFutureValue", () => {
  it("compounds a lump sum monthly", () => {
    expectClose(lumpSumFutureValue(10000, 7, 10, 12), 20096.61376695633);
    expectClose(lumpSumFutureValue(10000, 7.5, 5, 12), 14532.944082765023);
  });

  it("returns principal when rate is 0", () => {
    expect(lumpSumFutureValue(10000, 0, 10, 12)).toBe(10000);
  });

  it("returns NaN for negative principal or years", () => {
    expect(Number.isNaN(lumpSumFutureValue(-1, 5, 10))).toBe(true);
    expect(Number.isNaN(lumpSumFutureValue(100, 5, -1))).toBe(true);
  });
});

describe("recurringFutureValue", () => {
  it("computes an ordinary annuity (end-of-period contributions)", () => {
    expectClose(recurringFutureValue(500, 7, 10, 12, "annuity"), 86542.40371656852);
  });

  it("computes an annuity-due (start-of-period contributions) one period of interest higher", () => {
    const ordinary = recurringFutureValue(500, 7, 10, 12, "annuity");
    const due = recurringFutureValue(500, 7, 10, 12, "annuityDue");
    expectClose(due, ordinary * (1 + 7 / 100 / 12));
  });

  it("handles zero rate", () => {
    expect(recurringFutureValue(500, 0, 10, 12)).toBe(60000);
  });
});

describe("sipFutureValue", () => {
  it("matches the industry annuity-due formula (Groww/Zerodha convention)", () => {
    expectClose(sipFutureValue(5000, 12, 10, "annuityDue"), 1161695.3817597027);
  });

  it("matches the ordinary annuity formula", () => {
    expectClose(sipFutureValue(5000, 12, 10, "annuity"), 1150193.4472868342);
  });
});

describe("compoundFutureValue", () => {
  it("combines lump sum and recurring contribution", () => {
    expectClose(compoundFutureValue(10000, 500, 7, 10, 12, "annuity"), 106639.01748372486);
  });

  it("annuity-due only impacts the recurring portion", () => {
    const lump = lumpSumFutureValue(10000, 7, 10, 12);
    const due = compoundFutureValue(10000, 500, 7, 10, 12, "annuityDue");
    const ordinary = compoundFutureValue(10000, 500, 7, 10, 12, "annuity");
    expectClose(due, lump + (ordinary - lump) * (1 + 7 / 100 / 12));
  });

  it("handles zero rate", () => {
    expect(compoundFutureValue(10000, 500, 0, 10, 12)).toBe(70000);
  });
});

describe("growthSchedule", () => {
  it("projects year-by-year balance and contributions", () => {
    const rows = growthSchedule(10000, 500, 7, 2);
    expect(rows).toHaveLength(2);
    const last = rows[1];
    expectClose(last.balance, 24338.57596097009, 4);
    expectClose(last.contributions, 22000, 6);
  });

  it("returns an empty array for non-positive years", () => {
    expect(growthSchedule(1000, 100, 5, 0)).toEqual([]);
  });
});

describe("loanEmi", () => {
  it("computes the standard reducing-balance EMI", () => {
    expectClose(loanEmi(100000, 10, 12), 8791.58872300099);
    expectClose(loanEmi(200000, 8.5, 240), 1735.6464667310681);
    expectClose(loanEmi(350000, 6.5, 360), 2212.2380822253785);
  });

  it("returns principal / months when rate is 0", () => {
    expect(loanEmi(12000, 0, 12)).toBe(1000);
  });

  it("returns 0 for non-positive principal or months", () => {
    expect(loanEmi(0, 10, 12)).toBe(0);
    expect(loanEmi(10000, 10, 0)).toBe(0);
  });
});

describe("amortizationSchedule", () => {
  it("sums principal to the original loan amount with a zero final balance", () => {
    const schedule = amortizationSchedule(200000, 8.5, 240);
    const principalTotal = schedule.reduce((sum, row) => sum + row.principal, 0);
    expectClose(principalTotal, 200000, 2);
    expect(schedule[schedule.length - 1].balance).toBe(0);
    expect(schedule).toHaveLength(240);
  });

  it("total interest equals (payment * months) - principal", () => {
    const schedule = amortizationSchedule(200000, 8.5, 240);
    const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
    const paid = schedule.reduce((sum, row) => sum + row.payment, 0);
    expectClose(totalInterest, paid - 200000, 2);
  });

  it("never lets the balance go negative mid-schedule", () => {
    const schedule = amortizationSchedule(350000, 6.5, 360);
    for (const row of schedule) {
      expect(row.balance).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("cagr", () => {
  it("computes the compound annual growth rate", () => {
    expectClose(cagr(1000, 1000 * Math.pow(1.16, 3), 3), 0.16, 7);
  });

  it("returns NaN for non-positive begin value or years", () => {
    expect(Number.isNaN(cagr(0, 2000, 3))).toBe(true);
    expect(Number.isNaN(cagr(1000, 2000, 0))).toBe(true);
  });
});

describe("roi", () => {
  it("computes gain, simple ROI, and annualized ROI", () => {
    const r = roi(10000, 13500, 3);
    expectClose(r.gain, 3500, 6);
    expectClose(r.roiPct, 35, 6);
    expectClose(r.annualizedPct ?? 0, 10.520944959211608, 6);
  });

  it("returns null annualized ROI when years are 0", () => {
    const r = roi(10000, 13500, 0);
    expect(r.annualizedPct).toBeNull();
  });
});

describe("dtiRatio", () => {
  it("computes debt-to-income as a percentage", () => {
    expectClose(dtiRatio(1500, 5000), 30, 6);
  });

  it("returns NaN for zero income", () => {
    expect(Number.isNaN(dtiRatio(1500, 0))).toBe(true);
  });
});

describe("profitMargin", () => {
  it("computes margin and markup", () => {
    const m = profitMargin(1200, 850);
    expectClose(m.grossProfit, 350, 6);
    expectClose(m.marginPct, 29.1666667, 5);
    expectClose(m.markupPct, 41.17647058, 5);
    expect(m.isLoss).toBe(false);
  });

  it("flags losses", () => {
    const m = profitMargin(100, 200);
    expect(m.isLoss).toBe(true);
    expect(m.marginPct).toBe(-100);
  });
});

describe("creditCardPayoff", () => {
  it("computes months to pay off a balance with a fixed payment", () => {
    const result = creditCardPayoff(1000, 18, 100);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.months).toBeGreaterThan(0);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalPaid).toBeCloseTo(1000 + result.totalInterest, 2);
  });

  it("returns null when min checks fail", () => {
    expect(creditCardPayoff(0, 18, 100)).toBeNull();
    expect(creditCardPayoff(1000, 18, 0)).toBeNull();
  });
});

describe("savingsGoal", () => {
  const exactMonthsFrom = (now: Date, months: number): Date =>
    new Date(now.getTime() + months * 30.44 * 86400000);

  it("required monthly reaches the goal in exactly n months", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const targetDate = exactMonthsFrom(now, 36);
    const result = savingsGoal(50000, 30000, 0, 6, targetDate, now);
    expectClose(result.requiredMonthly, 358.4387, 3);
    expect(result.monthsToGoal).toBe(36);
    expectClose(result.finalBalance, 50000, 1);
  });

  it("interest earned equals final balance minus total contributions", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const targetDate = exactMonthsFrom(now, 36);
    const result = savingsGoal(50000, 5000, 1000, 6, targetDate, now);
    expectClose(result.interestEarned, result.finalBalance - result.totalContributions, 3);
    expect(result.interestEarned).toBeGreaterThan(0);
  });

  it("uses a straight division when rate is 0", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const targetDate = exactMonthsFrom(now, 12);
    const result = savingsGoal(12000, 2000, 0, 0, targetDate, now);
    expectClose(result.requiredMonthly, 833.3333, 3);
    expectClose(result.interestEarned, 0, 2);
  });

  it("returns onTrack=false when the monthly contribution is too small", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const targetDate = exactMonthsFrom(now, 12);
    const result = savingsGoal(2000, 0, 1, 0, targetDate, now);
    expect(result.onTrack).toBe(false);
    expect(result.monthsToGoal).toBe(Infinity);
    expect(Number.isNaN(result.finalBalance)).toBe(true);
  });
});

describe("calculateUsTax", () => {
  it("returns zero tax for income below the standard deduction", () => {
    const result = calculateUsTax(10000, "single");
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });

  it("falls back to single status without crashing for an unknown status", () => {
    const result = calculateUsTax(50000, "unknown");
    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.taxableIncome).toBeGreaterThan(0);
  });
});