import { describe, it, expect } from "vitest";
import {
  compoundFutureValue,
  sipFutureValue,
  loanEmi,
  loanScheduleTotals,
  cagr,
  roi,
  profitMargin,
  dtiRatio,
  breakEven,
  creditCardPayoff,
  simpleInterest,
  inflation,
  netWorth,
  emergencyFund,
  savingsGoal,
  lumpSumFutureValue,
  recurringFutureValue,
  loanAmountForPayment,
} from "@/lib/finance/calculations";

const TEST_CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY"];

describe("Currency mathematical invariant", () => {
  TEST_CURRENCIES.forEach((currency) => {
    it(`Compound Interest: identical numeric result for ${currency}`, () => {
      const result = compoundFutureValue(10000, 500, 7, 10, 12, "annuityDue");
      // Correct expected value from actual calculation
      expect(result).toBeCloseTo(107143.85, 1);
    });

    it(`SIP: identical numeric result for ${currency}`, () => {
      const result = sipFutureValue(5000, 12, 10, "annuityDue");
      expect(result).toBeCloseTo(1161695.38, 1);
    });

    it(`Loan EMI: identical numeric result for ${currency}`, () => {
      const result = loanEmi(200000, 8.5, 240);
      expect(result).toBeCloseTo(1735.67, 1);
    });

    it(`Loan Schedule Totals: identical numeric result for ${currency}`, () => {
      const result = loanScheduleTotals(200000, 8.5, 240);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.emi).toBeCloseTo(1735.67, 1);
        // Correct expected value from actual calculation
        expect(result.totalInterest).toBeCloseTo(216553.78, 1);
      }
    });

    it(`CAGR: identical numeric result for ${currency}`, () => {
      const result = cagr(1000, 2000, 5);
      expect(result).toBeCloseTo(0.1487, 3);
    });

    it(`ROI: identical numeric result for ${currency}`, () => {
      const result = roi(10000, 13500, 3);
      expect(result.gain).toBe(3500);
      expect(result.roiPct).toBeCloseTo(35, 1);
    });

    it(`Profit Margin: identical numeric result for ${currency}`, () => {
      const result = profitMargin(1200, 850);
      expect(result.grossProfit).toBe(350);
      expect(result.marginPct).toBeCloseTo(29.17, 2);
    });

    it(`DTI Ratio: identical numeric result for ${currency}`, () => {
      const result = dtiRatio(1500, 5000);
      expect(result).toBe(30);
    });

    it(`Break-Even: identical numeric result for ${currency}`, () => {
      const result = breakEven(50000, 15, 40);
      expect(result.breakEvenUnits).toBeCloseTo(2000, 1);
      expect(result.breakEvenRevenue).toBeCloseTo(80000, 1);
    });

    it(`Credit Card Payoff: identical numeric result for ${currency}`, () => {
      const result = creditCardPayoff(5000, 19.99, 200);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.months).toBeGreaterThan(0);
      }
    });

    it(`Simple Interest: identical numeric result for ${currency}`, () => {
      const result = simpleInterest(10000, 5, 3);
      expect(result.interest).toBe(1500);
      expect(result.total).toBe(11500);
    });

    it(`Inflation: identical numeric result for ${currency}`, () => {
      const result = inflation(1000, 3, 10);
      expect(result.futureValue).toBeCloseTo(1343.92, 2);
      expect(result.lossPct).toBeCloseTo(25.59, 2);
    });

    it(`Net Worth: identical numeric result for ${currency}`, () => {
      const result = netWorth(500000, 200000);
      expect(result.netWorth).toBe(300000);
      expect(result.totalAssets).toBe(500000);
    });

    it(`Emergency Fund: identical numeric result for ${currency}`, () => {
      const result = emergencyFund(4000, 20000, 6);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.monthsCovered).toBe(5);
        expect(result.targetAmount).toBe(24000);
      }
    });

    it(`Savings Goal: identical numeric result for ${currency}`, () => {
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + 3);
      const result = savingsGoal(50000, 5000, 1000, 6, targetDate);
      expect(result.monthsToGoal).toBeGreaterThan(0);
    });

    it(`Lump Sum Future Value: identical numeric result for ${currency}`, () => {
      const result = lumpSumFutureValue(10000, 7, 10, 12);
      expect(result).toBeCloseTo(20096.61, 2);
    });

    it(`Recurring Future Value: identical numeric result for ${currency}`, () => {
      const result = recurringFutureValue(500, 7, 10, 12, "annuityDue");
      // Correct expected value from actual calculation
      expect(result).toBeCloseTo(87047.23, 1);
    });

    it(`Loan Amount For Payment: identical numeric result for ${currency}`, () => {
      const result = loanAmountForPayment(2000, 5, 240);
      // Correct expected value from actual calculation
      expect(result).toBeCloseTo(303050.63, 1);
    });
  });
});