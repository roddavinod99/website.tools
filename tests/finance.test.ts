import { describe, it, expect } from "vitest";
import {
  nominalMonthlyRate,
  lumpSumFutureValue,
  recurringFutureValue,
  compoundFutureValue,
  sipFutureValue,
  growthSchedule,
  loanEmi,
  loanAmountForPayment,
  loanScheduleTotals,
  amortizationSchedule,
  cagr,
  roi,
  profitMargin,
  dtiRatio,
  breakEven,
  tipCalculator,
  creditCardPayoff,
  debtPayoff,
  savingsGoal,
  calculateUsTax,
  salesTax,
  simpleInterest,
  inflation,
  netWorth,
  emergencyFund,
  capitalGainsTax,
  rentVsBuy,
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
  it("defaults to annuity-due (start-of-month contributions) like the SIP tools", () => {
    const rows = growthSchedule(10000, 500, 7, 2);
    expect(rows).toHaveLength(2);
    expectClose(rows[1].balance, 24413.47896972142, 4);
    expectClose(rows[1].contributions, 22000, 6);
  });

  it("supports ordinary annuity (end-of-month contributions)", () => {
    const rows = growthSchedule(10000, 500, 7, 2, "annuity");
    expectClose(rows[1].balance, 24338.57596097009, 4);
    expectClose(rows[1].contributions, 22000, 6);
  });

  it("annuity-due beats ordinary annuity each year", () => {
    const due = growthSchedule(10000, 500, 7, 5, "annuityDue");
    const ordinary = growthSchedule(10000, 500, 7, 5, "annuity");
    for (let y = 0; y < 5; y++) {
      expect(due[y].balance).toBeGreaterThan(ordinary[y].balance);
    }
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

  it("rounds to the cent when requested", () => {
    expect(loanEmi(100000, 10, 12, true)).toBe(8791.59);
    expect(loanEmi(200000, 8.5, 240, true)).toBe(1735.65);
  });

  it("returns 0 for non-positive principal or months", () => {
    expect(loanEmi(0, 10, 12)).toBe(0);
    expect(loanEmi(10000, 10, 0)).toBe(0);
  });
});

describe("loanAmountForPayment", () => {
  it("computes the principal affordable for a payment", () => {
    expectClose(loanAmountForPayment(1000, 6, 12), 11618.932066816182);
    expectClose(loanAmountForPayment(1500, 4.5, 360), 296041.7385132896);
  });

  it("returns payment * months when rate is 0", () => {
    expect(loanAmountForPayment(1000, 0, 12)).toBe(12000);
  });

  it("returns 0 for non-positive payment or months", () => {
    expect(loanAmountForPayment(0, 6, 12)).toBe(0);
    expect(loanAmountForPayment(1000, 6, 0)).toBe(0);
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

  it("reconciles: sum of payments equals principal plus total interest", () => {
    const schedule = amortizationSchedule(200000, 8.5, 240);
    const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
    const paid = schedule.reduce((sum, row) => sum + row.payment, 0);
    expectClose(paid, 200000 + totalInterest, 2);
  });

  it("uses a cent-rounded monthly payment (the quoted EMI)", () => {
    const schedule = amortizationSchedule(200000, 8.5, 240);
    for (const row of schedule.slice(0, -1)) {
      expect(row.payment).toBeCloseTo(1735.65, 2);
    }
  });

  it("never lets the balance go negative mid-schedule", () => {
    const schedule = amortizationSchedule(350000, 6.5, 360);
    for (const row of schedule) {
      expect(row.balance).toBeGreaterThanOrEqual(0);
    }
  });

  it("handles a zero interest rate", () => {
    const schedule = amortizationSchedule(12000, 0, 12);
    expect(schedule).toHaveLength(12);
    expect(schedule.every((r) => r.interest === 0)).toBe(true);
    expectClose(
      schedule.reduce((sum, r) => sum + r.payment, 0),
      12000,
      2
    );
  });
});

describe("loanScheduleTotals", () => {
  it("totals reconcile with the amortization schedule", () => {
    const totals = loanScheduleTotals(200000, 8.5, 240);
    expect(totals).not.toBeNull();
    if (!totals) return;
    expect(totals.emi).toBeCloseTo(1735.65, 2);
    expectClose(totals.totalPaid, totals.totalInterest + 200000, 2);
    expectClose(totals.totalPaid, totals.schedule.reduce((s, r) => s + r.payment, 0), 2);
  });

  it("returns null for non-positive principal or months", () => {
    expect(loanScheduleTotals(0, 5, 12)).toBeNull();
    expect(loanScheduleTotals(10000, 5, 0)).toBeNull();
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

  it("returns null annualized ROI when the final value is negative (no NaN)", () => {
    const r = roi(10000, -5000, 3);
    expectClose(r.roiPct, -150, 6);
    expect(r.annualizedPct).toBeNull();
  });

  it("returns -100% annualized ROI when the final value is zero", () => {
    const r = roi(10000, 0, 3);
    expectClose(r.roiPct, -100, 6);
    expectClose(r.annualizedPct ?? 0, -100, 6);
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

describe("breakEven", () => {
  it("computes break-even units and revenue", () => {
    const r = breakEven(10000, 50, 100);
    expectClose(r.contributionMarginPerUnit, 50, 6);
    expectClose(r.breakEvenUnits, 200, 6);
    expectClose(r.breakEvenRevenue, 20000, 6);
  });

  it("returns NaN units when the price does not cover variable costs", () => {
    const r = breakEven(100, 60, 50);
    expect(Number.isNaN(r.breakEvenUnits)).toBe(true);
    expect(Number.isNaN(r.breakEvenRevenue)).toBe(true);
    expect(r.contributionMarginPerUnit).toBe(-10);
  });
});

describe("tipCalculator", () => {
  it("computes tip, total, and per-person splits", () => {
    const r = tipCalculator(100, 20, 4);
    expect(r).not.toBeNull();
    if (!r) return;
    expectClose(r.tipAmount, 20, 6);
    expectClose(r.total, 120, 6);
    expectClose(r.tipPerPerson, 5, 6);
    expectClose(r.perPerson, 30, 6);
  });

  it("returns null for non-positive bill or fewer than one person", () => {
    expect(tipCalculator(0, 20, 2)).toBeNull();
    expect(tipCalculator(-5, 20, 2)).toBeNull();
    expect(tipCalculator(100, 20, 0)).toBeNull();
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

describe("debtPayoff", () => {
  const debts = [
    { name: "Card A", balance: 4000, apr: 18.99, minPayment: 100 },
    { name: "Loan B", balance: 8000, apr: 7.5, minPayment: 150 },
  ];

  it("snowball targets the smallest balance first", () => {
    const result = debtPayoff(debts, "snowball", 500);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.order).toEqual(["Card A", "Loan B"]);
    expect(result.months).toBe(27);
    expectClose(result.totalInterest, 1352.9444583582135, 2);
  });

  it("avalanche targets the highest APR first", () => {
    const result = debtPayoff(debts, "avalanche", 500);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.order).toEqual(["Card A", "Loan B"]);
  });

  it("never spends more than the monthly budget in any month", () => {
    const result = debtPayoff(debts, "snowball", 500);
    expect(result).not.toBeNull();
    if (!result) return;
    for (const month of result.schedule) {
      const spent = month.payments.reduce((sum, p) => sum + p.amount, 0);
      expect(spent).toBeLessThanOrEqual(500 + 0.005);
    }
  });

  it("uses the full budget after a debt is paid off (freed minimum rolls in)", () => {
    const result = debtPayoff(debts, "snowball", 500);
    expect(result).not.toBeNull();
    if (!result) return;
    // Once Card A is gone its $100 minimum is redirected, so the budget stays
    // fully deployed; the total paid equals balances + interest.
    const totalBalances = debts.reduce((sum, d) => sum + d.balance, 0);
    const totalPaid = result.schedule.reduce((sum, m) => sum + m.payments.reduce((s, p) => s + p.amount, 0), 0);
    expectClose(totalPaid, totalBalances + result.totalInterest, 2);
  });

  it("payoff completes with every debt zeroed", () => {
    const result = debtPayoff(debts, "avalanche", 500);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.months).toBeGreaterThan(0);
    expect(result.schedule[result.schedule.length - 1].paidOff).toHaveLength(2);
  });

  it("handles a zero-interest scenario deterministically", () => {
    const result = debtPayoff(
      [
        { name: "A", balance: 1200, apr: 0, minPayment: 100 },
        { name: "B", balance: 800, apr: 0, minPayment: 100 },
      ],
      "snowball",
      300
    );
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.totalInterest).toBe(0);
    expect(result.months).toBe(7);
  });

  it("returns null when the budget does not cover minimums", () => {
    expect(debtPayoff(debts, "snowball", 100)).toBeNull();
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
    expect(result.onTrack).toBe(true);
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

  it("is on track when the goal is already reached", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const result = savingsGoal(2000, 3000, 0, 0, null, now);
    expect(result.monthsToGoal).toBe(0);
    expect(result.requiredMonthly).toBe(0);
    expect(result.onTrack).toBe(true);
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

  it("computes the 2025 single brackets correctly", () => {
    // 200k gross, 15750 standard deduction => 184250 taxable.
    const r = calculateUsTax(200000, "single");
    // 11925*0.10 + 36550*0.12 + 54875*0.22 + 80900*0.24
    expectClose(r.totalTax, 1192.5 + 4386 + 12072.5 + 19416, 4);
    expectClose(r.marginalRate, 0.24, 6);
    expect(r.standardDeduction).toBe(15750);
  });

  it("computes the 2025 married filing separately brackets correctly", () => {
    // Same taxable income as single up to the 35% bracket threshold.
    const r = calculateUsTax(200000, "mfs");
    expectClose(r.totalTax, 37067, 4);
    expectClose(r.marginalRate, 0.24, 6);
    expect(r.standardDeduction).toBe(15750);
  });

  it("correctly taxes income inside the MFS 35% bracket", () => {
    // 315750 gross => 300000 taxable (minus 15750 std deduction) lands the
    // MFS 35% bracket, which runs 250525..375800 for 2025.
    const r = calculateUsTax(315750, "mfs");
    expect(r.marginalRate).toBe(0.35);
    const breakpoints = [11925, 48475, 103350, 197300, 250525, 375800];
    const rates = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35];
    let expected = 0;
    let prev = 0;
    for (let i = 0; i < breakpoints.length; i++) {
      const cap = Math.min(breakpoints[i], r.taxableIncome);
      if (cap <= prev) continue;
      expected += (cap - prev) * rates[i];
      prev = cap;
    }
    const top = r.taxableIncome - prev;
    if (top > 0) expected += top * 0.37;
    expectClose(r.totalTax, expected, 4);
  });
});

describe("simple calculators (salesTax, simpleInterest, inflation, netWorth, emergencyFund)", () => {
  it("salesTax computes tax and total", () => {
    const r = salesTax(100, 8.875);
    expectClose(r.taxAmount, 8.875, 6);
    expectClose(r.totalWithTax, 108.875, 6);
  });

  it("simpleInterest does not compound", () => {
    const r = simpleInterest(10000, 5, 3);
    expectClose(r.interest, 1500, 6);
    expectClose(r.total, 11500, 6);
  });

  it("inflation converts across years", () => {
    const r = inflation(1000, 3, 10);
    expectClose(r.futureValue, 1343.9163793441223, 6);
    expectClose(r.todayValue, 744.093914896725, 6);
    expectClose(r.lossPct, 25.590608510327506, 4);
  });

  it("inflation is the identity for zero years", () => {
    const r = inflation(1000, 3, 0);
    expectClose(r.futureValue, 1000, 6);
    expectClose(r.lossPct, 0, 6);
  });

  it("netWorth subtracts liabilities and clamps negative inputs", () => {
    const r = netWorth(500000, 300000);
    expect(r.totalAssets).toBe(500000);
    expect(r.totalLiabilities).toBe(300000);
    expect(r.netWorth).toBe(200000);
    const neg = netWorth(-5, 1000);
    expect(neg.totalAssets).toBe(0);
    expect(neg.netWorth).toBe(-1005);
  });

  it("emergencyFund covers current savings against monthly expenses", () => {
    const r = emergencyFund(4000, 12000, 6);
    expect(r).not.toBeNull();
    if (!r) return;
    expectClose(r.monthsCovered, 3, 6);
    expect(r.targetAmount).toBe(24000);
    expect(r.onTrack).toBe(false);
  });

  it("emergencyFund returns null for non-positive expenses", () => {
    expect(emergencyFund(0, 1000, 6)).toBeNull();
  });
});

describe("capitalGainsTax", () => {
  it("computes capital gain, taxable gain, and estimated tax", () => {
    const r = capitalGainsTax(50000, 75000, 500, 1000, 15);
    expectClose(r.capitalGain, 23500, 6);
    expectClose(r.taxableGain, 23500, 6);
    expectClose(r.estimatedTax, 3525, 6);
  });

  it("treats a loss as zero taxable gain", () => {
    const r = capitalGainsTax(75000, 50000, 0, 0, 15);
    expect(r.capitalGain).toBe(-25000);
    expect(r.taxableGain).toBe(0);
    expect(r.estimatedTax).toBe(0);
  });
});

describe("rentVsBuy", () => {
  const baseParams = {
    homePrice: 400000,
    downPaymentPct: 20,
    mortgageRatePct: 6.5,
    mortgageYears: 30,
    propertyTaxPct: 1,
    maintenancePct: 1,
    homeAppreciationPct: 3,
    monthlyRent: 2000,
    rentGrowthPct: 3,
    investmentReturnPct: 5,
    horizonYears: 5,
  };

  it("produces a verdict with finite costs", () => {
    const r = rentVsBuy(baseParams);
    expect(r).not.toBeNull();
    if (!r) return;
    expect(Number.isFinite(r.netBuyCost)).toBe(true);
    expect(Number.isFinite(r.netRentCost)).toBe(true);
    expect(r.homeValueAtEnd).toBeGreaterThan(0);
    expect(r.totalRentPaid).toBeGreaterThan(0);
    expect([true, false]).toContain(r.buyBetter);
  });

  it("reconciles net costs for a short horizon", () => {
    const r = rentVsBuy(baseParams);
    expect(r).not.toBeNull();
    if (!r) return;
    expect(r.mortgageMonthly).toBeGreaterThan(0);
    expectClose(r.homeValueAtEnd, 400000 * Math.pow(1.03, 5), 4);
  });

  it("stops charging mortgage once the horizon exceeds the mortgage term", () => {
    const r = rentVsBuy({ ...baseParams, horizonYears: 40 });
    expect(r).not.toBeNull();
    if (!r) return;
    // At 40 years the mortgage is fully paid; the buy side pays tax + maintenance
    // for all 40 years but no further mortgage. Sanity: renting should be far more
    // expensive, so buying wins.
    expect(r.buyBetter).toBe(true);
  });

  it("returns null for non-positive home price or horizon", () => {
    expect(rentVsBuy({ ...baseParams, homePrice: 0 })).toBeNull();
    expect(rentVsBuy({ ...baseParams, horizonYears: 0 })).toBeNull();
  });
});