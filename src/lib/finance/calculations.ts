// Pure financial calculation functions used by the Finance tool category.
// All functions are deterministic and dependency-free so they can be unit-tested.
// Values are kept as plain numbers with full precision; formatting and cent-rounding
// happen only at presentation time (format.ts / precision.ts).

import { roundToCents } from "@/lib/finance/precision";

export function safePositive(v: number): boolean {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

export function nominalMonthlyRate(annualRatePct: number): number {
  return annualRatePct / 100 / 12;
}

/** Future value of a single lump sum compounding at a fixed annual rate. */
export function lumpSumFutureValue(
  principal: number,
  annualRatePct: number,
  years: number,
  compoundingPerYear = 12
): number {
  if (principal < 0 || years < 0) return NaN;
  const r = annualRatePct / 100 / compoundingPerYear;
  return principal * Math.pow(1 + r, compoundingPerYear * years);
}

/** Timing convention for recurring contributions.
 *  - "annuity": contribution made at the END of each period (ordinary annuity).
 *  - "annuityDue": contribution made at the START of each period (annuity-due; used by
 *    most SIP calculators — each contribution earns one extra period of interest).
 */
export type ContributionTiming = "annuity" | "annuityDue";

/** Future value of a recurring contribution (ordinary annuity) with compounding. */
export function recurringFutureValue(
  contribution: number,
  annualRatePct: number,
  years: number,
  contributionsPerYear = 12,
  timing: ContributionTiming = "annuity"
): number {
  const r = annualRatePct / 100 / contributionsPerYear;
  const n = contributionsPerYear * years;
  if (r === 0) return contribution * n;
  const fv = contribution * ((Math.pow(1 + r, n) - 1) / r);
  return timing === "annuityDue" ? fv * (1 + r) : fv;
}

/** Combined future value: lump sum plus recurring contributions. */
export function compoundFutureValue(
  principal: number,
  monthlyContribution: number,
  annualRatePct: number,
  years: number,
  compoundingPerYear = 12,
  timing: ContributionTiming = "annuity"
): number {
  const lv = lumpSumFutureValue(principal, annualRatePct, years, compoundingPerYear);
  const rv = recurringFutureValue(monthlyContribution, annualRatePct, years, compoundingPerYear, timing);
  return lv + rv;
}

/** SIP = Systematic Investment Plan; future value of equal monthly deposits. */
export function sipFutureValue(
  monthly: number,
  annualRatePct: number,
  years: number,
  timing: ContributionTiming = "annuity"
): number {
  return recurringFutureValue(monthly, annualRatePct, years, 12, timing);
}

export interface RatePoint {
  years: number;
  balance: number;
  contributions: number;
  interest: number;
}

/** Year-by-year projection of a principal + recurring-contribution investment. */
export function growthSchedule(
  principal: number,
  monthlyContribution: number,
  annualRatePct: number,
  years: number,
  timing: ContributionTiming = "annuityDue"
): RatePoint[] {
  if (years <= 0) return [];
  const points: RatePoint[] = [];
  const rMonthly = annualRatePct / 100 / 12;
  let balance = principal;
  let contributions = principal;
  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      if (timing === "annuityDue") {
        // Contribution at the START of the month earns interest all month.
        balance = (balance + monthlyContribution) * (1 + rMonthly);
      } else {
        // Ordinary annuity: contribution lands at the END of the month.
        balance = balance * (1 + rMonthly) + monthlyContribution;
      }
      contributions += monthlyContribution;
    }
    points.push({ years: y, balance, contributions, interest: balance - contributions });
  }
  return points;
}

/** Standard EMI (equal monthly installments) for a fixed-rate loan.
 *  Pass `roundToCents = true` to get the payment a lender quotes (rounded up to
 *  the cent); the amortization schedule must then use the rounded payment and
 *  adjust the final installment so the loan still hits exactly $0. */
export function loanEmi(
  principal: number,
  annualRatePct: number,
  months: number,
  rounding = false
): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = nominalMonthlyRate(annualRatePct);
  const emi = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return rounding ? roundToCents(emi) : emi;
}

/** Reverse loan math: the principal you can borrow for a target monthly payment. */
export function loanAmountForPayment(payment: number, annualRatePct: number, months: number): number {
  if (payment <= 0 || months <= 0) return 0;
  const r = nominalMonthlyRate(annualRatePct);
  if (r === 0) return payment * months;
  return (payment * (Math.pow(1 + r, months) - 1)) / (r * Math.pow(1 + r, months));
}

export interface TipResult {
  tipAmount: number;
  total: number;
  tipPerPerson: number;
  perPerson: number;
}

/** Tip total and split for a given number of people. */
export function tipCalculator(bill: number, tipPercent: number, people: number): TipResult | null {
  if (!safePositive(bill) || people < 1) return null;
  const tip = bill * (tipPercent / 100);
  const total = bill + tip;
  return {
    tipAmount: tip,
    total,
    tipPerPerson: tip / people,
    perPerson: total / people,
  };
}

export interface RentVsBuyParams {
  homePrice: number;
  downPaymentPct: number;
  mortgageRatePct: number;
  mortgageYears: number;
  propertyTaxPct: number;
  maintenancePct: number;
  homeAppreciationPct: number;
  monthlyRent: number;
  rentGrowthPct: number;
  investmentReturnPct: number;
  horizonYears: number;
}

export interface RentVsBuyResult {
  mortgageMonthly: number;
  netBuyCost: number;
  netRentCost: number;
  buyBetter: boolean;
  tie: boolean;
  savings: number;
  homeValueAtEnd: number;
  totalRentPaid: number;
}

/**
 * Simple buy-vs-rent comparison over a fixed horizon. The buy side pays the
 * down payment, closing-free mortgage, and annual property tax + maintenance;
 * any remaining principal is netted out and the (depreciated/appreciated) home
 * value is credited back. The rent side pays a growing rent and also gains the
 * future value of the money it avoided tying up in a down payment, invested at
 * the stated return.
 */
export function rentVsBuy(p: RentVsBuyParams): RentVsBuyResult | null {
  const {
    homePrice, downPaymentPct, mortgageRatePct, mortgageYears, propertyTaxPct,
    maintenancePct, homeAppreciationPct, monthlyRent, rentGrowthPct,
    investmentReturnPct, horizonYears,
  } = p;
  if (!safePositive(homePrice) || horizonYears <= 0) return null;

  const downPayment = homePrice * (downPaymentPct / 100);
  const loanPrincipal = homePrice - downPayment;
  const mortgageMonths = Math.max(1, mortgageYears * 12);
  const mortgageSchedule = amortizationSchedule(loanPrincipal, mortgageRatePct, mortgageMonths);
  const mortgageMonthly = mortgageSchedule[0].payment;

  const annualTax = (homePrice * propertyTaxPct) / 100;
  const annualMaintenance = (homePrice * maintenancePct) / 100;

  // Buyer cash flows: down payment + monthly mortgage + annual tax/maintenance.
  // Mortgage payments only apply while the loan is outstanding, so once the
  // horizon exceeds the mortgage term no further mortgage is charged. Property
  // tax and maintenance continue for the whole horizon.
  let buySpent = downPayment;
  const horizonMonths = horizonYears * 12;
  for (let m = 0; m < horizonMonths; m++) {
    const row = mortgageSchedule[m];
    if (!row || (row.balance <= 0 && m > 0)) break;
    buySpent += row.payment;
  }
  buySpent += horizonYears * (annualTax + annualMaintenance);

  // Remaining principal owed after the horizon (zero once the term is up).
  const remainingPrincipal =
    horizonMonths >= 1 && horizonMonths <= mortgageSchedule.length
      ? mortgageSchedule[horizonMonths - 1].balance
      : 0;

  const homeValueAtEnd = homePrice * Math.pow(1 + homeAppreciationPct / 100, horizonYears);
  const netBuyCost = buySpent - Math.max(0, homeValueAtEnd - remainingPrincipal);

  // Renter: growing monthly rent + future value of money not tied up in the down payment
  let totalRent = 0;
  for (let y = 0; y < horizonYears; y++) {
    totalRent += monthlyRent * 12 * Math.pow(1 + rentGrowthPct / 100, y);
  }
  const investedDownPayment = downPayment * Math.pow(1 + investmentReturnPct / 100, horizonYears);
  const netRentCost = totalRent - investedDownPayment;

  const diff = netRentCost - netBuyCost;
  return {
    mortgageMonthly,
    netBuyCost,
    netRentCost,
    buyBetter: diff > 0,
    tie: Math.abs(diff) < 1,
    savings: Math.abs(diff),
    homeValueAtEnd,
    totalRentPaid: totalRent,
  };
}

export interface AmortizationRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

/** Full amortization schedule for a fixed-rate loan. The monthly payment is the
 *  standard EMI rounded to the cent (what a lender quotes); every installment is
 *  that rounded payment except the final one, which is the exact remnant needed
 *  to bring the loan to $0. Interest is computed at full precision, so the
 *  schedule reconciles exactly: the sum of principal portions equals the loan
 *  amount and the sum of payments equals principal + total interest. */
export function amortizationSchedule(
  principal: number,
  annualRatePct: number,
  months: number
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  if (principal <= 0 || months <= 0) return schedule;
  const r = nominalMonthlyRate(annualRatePct);
  if (r === 0) {
    const payment = roundToCents(principal / months);
    let remaining = principal;
    for (let i = 1; i <= months; i++) {
      const isLast = i === months;
      const principalPortion = isLast ? remaining : Math.min(payment, remaining);
      remaining -= principalPortion;
      schedule.push({
        period: i,
        payment: principalPortion,
        interest: 0,
        principal: principalPortion,
        balance: Math.max(0, remaining),
      });
    }
    return schedule;
  }

  // Cent-rounded EMI paid every month; the last month pays whatever is left.
  const payment = roundToCents((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
  let balance = principal;
  for (let i = 1; i <= months; i++) {
    const interest = balance * r;
    const isLast = i === months;
    const principalPortion = isLast ? balance : Math.min(payment - interest, balance);
    const pay = interest + principalPortion;
    balance -= principalPortion;
    schedule.push({
      period: i,
      payment: isLast ? pay : payment,
      interest,
      principal: principalPortion,
      balance: Math.max(0, balance),
    });
  }
  return schedule;
}

/** One aggregate result of a fully-reconciled loan schedule.
 *  `totalInterest` and `totalPaid` both come from the schedule, so they match
 *  the component's amortization table instead of a naive emi * months. */
export interface LoanScheduleTotals {
  emi: number;
  totalPaid: number;
  totalInterest: number;
  months: number;
  schedule: AmortizationRow[];
}

/** Compute a loan's payments with the fully-reconciled totals. */
export function loanScheduleTotals(
  principal: number,
  annualRatePct: number,
  months: number
): LoanScheduleTotals | null {
  if (principal <= 0 || months <= 0) return null;
  const schedule = amortizationSchedule(principal, annualRatePct, months);
  const emi = schedule[0].payment;
  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  return { emi, totalPaid, totalInterest, months, schedule };
}

export function cagr(beginValue: number, endValue: number, years: number): number {
  if (beginValue <= 0 || years <= 0) return NaN;
  return Math.pow(endValue / beginValue, 1 / years) - 1;
}

export interface RoiResult {
  gain: number;
  roiPct: number;
  annualizedPct: number | null;
}

export function roi(
  initialInvestment: number,
  finalValue: number,
  years: number,
  additionalCosts = 0
): RoiResult {
  const totalOutlay = initialInvestment + Math.max(additionalCosts, 0);
  const gain = finalValue - totalOutlay;
  const roiPct = totalOutlay > 0 ? (gain / totalOutlay) * 100 : NaN;
  const canAnnualize = totalOutlay > 0 && years > 0 && finalValue >= 0;
  const annualizedPct = canAnnualize
    ? (Math.pow(finalValue / totalOutlay, 1 / years) - 1) * 100
    : null;
  return { gain, roiPct, annualizedPct };
}

export function dtiRatio(monthlyDebtPayments: number, grossMonthlyIncome: number): number {
  if (grossMonthlyIncome <= 0) return NaN;
  return (monthlyDebtPayments / grossMonthlyIncome) * 100;
}

export interface BreakEvenResult {
  contributionMarginPerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
}

export function breakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number
): BreakEvenResult {
  const contribution = sellingPricePerUnit - variableCostPerUnit;
  if (sellingPricePerUnit <= 0 || contribution <= 0) {
    return { contributionMarginPerUnit: contribution, breakEvenUnits: NaN, breakEvenRevenue: NaN };
  }
  const units = fixedCosts / contribution;
  return {
    contributionMarginPerUnit: contribution,
    breakEvenUnits: units,
    breakEvenRevenue: units * sellingPricePerUnit,
  };
}

export interface MarginResult {
  grossProfit: number;
  marginPct: number;
  markupPct: number;
  isLoss: boolean;
}

export function profitMargin(revenue: number, cost: number): MarginResult {
  const grossProfit = revenue - cost;
  const marginPct = revenue > 0 ? (grossProfit / revenue) * 100 : NaN;
  const markupPct = cost > 0 ? (grossProfit / cost) * 100 : NaN;
  return { grossProfit, marginPct, markupPct, isLoss: grossProfit < 0 };
}

export interface CreditPayoffResult {
  months: number;
  yearsDecimal: number;
  totalPaid: number;
  totalInterest: number;
  schedule: { month: number; balance: number; interest: number; payment: number }[];
}

/** Credit card payoff given a fixed monthly payment. */
export function creditCardPayoff(
  balance: number,
  annualApr: number,
  monthlyPayment: number
): CreditPayoffResult | null {
  if (!safePositive(balance) || !safePositive(monthlyPayment) || annualApr < 0) return null;
  const r = annualApr / 100 / 12;
  const schedule: CreditPayoffResult["schedule"] = [];
  let bal = balance;
  let totalInterest = 0;
  let months = 0;
  while (bal > 0.005 && months < 1200) {
    months++;
    const interest = bal * r;
    const payment = Math.min(monthlyPayment, bal + interest);
    bal = bal + interest - payment;
    totalInterest += interest;
    schedule.push({ month: months, balance: bal < 0.005 ? 0 : bal, interest, payment });
  }
  if (bal > 0.005) return null;
  return { months, yearsDecimal: months / 12, totalPaid: balance + totalInterest, totalInterest, schedule };
}

export interface DebtEntry {
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
}

export interface DebtPayoffPayment {
  name: string;
  amount: number;
}

export interface DebtPayoffMonth {
  month: number;
  payments: DebtPayoffPayment[];
  paidOff: string[];
  totalInterest: number;
}

export interface DebtPayoffResult {
  months: number;
  totalInterest: number;
  schedule: DebtPayoffMonth[];
  order: string[];
}

/**
 * Debt payoff plan. "snowball" knocks out the smallest balance first; "avalanche"
 * targets the highest APR first. Minimum payments are always applied; the excess
 * above the sum of this month's actual minimums goes to the target debt. When a
 * debt is paid off, its freed minimum rolls into the target for the next month,
 * so the full monthly budget is spent every month (standard snowball/avalanche).
 */
export function debtPayoff(
  debts: DebtEntry[],
  strategy: "snowball" | "avalanche",
  monthlyBudget: number
): DebtPayoffResult | null {
  const active = debts.map((d) => ({ ...d })).filter((d) => d.balance > 0);
  if (active.length === 0) return null;

  const totalMin = active.reduce((sum, d) => sum + d.minPayment, 0);
  if (totalMin > monthlyBudget) return null;

  const order = sortDebts(active, strategy).map((d) => d.name);
  const schedule: DebtPayoffMonth[] = [];
  let months = 0;
  let totalInterest = 0;

  while (active.some((d) => d.balance > 0.005) && months < 1200) {
    months++;
    const mapPay = new Map<string, number>();
    let interestThisMonth = 0;
    let minPaidThisMonth = 0;

    for (const debt of active) {
      if (debt.balance <= 0.005) continue;
      const interest = (debt.balance * debt.apr) / 100 / 12;
      interestThisMonth += interest;
      debt.balance += interest;
      const minP = Math.min(debt.minPayment, debt.balance);
      debt.balance -= minP;
      minPaidThisMonth += minP;
      mapPay.set(debt.name, (mapPay.get(debt.name) ?? 0) + minP);
    }

    // Extra is the budget minus THIS month's actual minimums, so freed minimums
    // from debts paid off earlier naturally roll into the target payment.
    let extra = monthlyBudget - minPaidThisMonth;
    while (extra > 0.005) {
      const target = sortDebts(active, strategy).find((d) => d.balance > 0.005);
      if (!target) break;
      const pay = Math.min(extra, target.balance);
      target.balance -= pay;
      mapPay.set(target.name, (mapPay.get(target.name) ?? 0) + pay);
      extra -= pay;
    }

    totalInterest += interestThisMonth;
    for (const debt of active) {
      if (debt.balance <= 0.005) debt.balance = 0;
    }
    const payments: DebtPayoffPayment[] = [...mapPay.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .filter((p) => p.amount > 0);
    const paidOff = active.filter((d) => d.balance <= 0.005).map((d) => d.name);
    schedule.push({ month: months, payments, paidOff, totalInterest });
  }

  return { months, totalInterest, schedule, order };
}

function sortDebts(debts: DebtEntry[], strategy: "snowball" | "avalanche"): DebtEntry[] {
  return [...debts].sort(
    strategy === "snowball"
      ? (a, b) => a.balance - b.balance || a.name.localeCompare(b.name)
      : (a, b) => b.apr - a.apr || a.balance - b.balance
  );
}

// ---------------------------------------------------------------------------
// US federal income tax — tax year 2025 (IRS Rev. Proc. 2024-40 + OBBBA
// standard deduction increases). Only federal ordinary income tax is modelled.
// ---------------------------------------------------------------------------

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface TaxStatusDef {
  id: "single" | "mfj" | "mfs" | "hoh";
  label: string;
  standardDeduction: number;
  brackets: TaxBracket[];
}

export const US_2025_STATUSES: Record<string, TaxStatusDef> = {
  single: {
    id: "single",
    label: "Single",
    standardDeduction: 15750,
    brackets: [
      { min: 0, max: 11925, rate: 0.1 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 626350, rate: 0.35 },
      { min: 626350, max: Infinity, rate: 0.37 },
    ],
  },
  mfj: {
    id: "mfj",
    label: "Married Filing Jointly",
    standardDeduction: 31500,
    brackets: [
      { min: 0, max: 23850, rate: 0.1 },
      { min: 23850, max: 96950, rate: 0.12 },
      { min: 96950, max: 206700, rate: 0.22 },
      { min: 206700, max: 394600, rate: 0.24 },
      { min: 394600, max: 501050, rate: 0.32 },
      { min: 501050, max: 751600, rate: 0.35 },
      { min: 751600, max: Infinity, rate: 0.37 },
    ],
  },
  mfs: {
    id: "mfs",
    label: "Married Filing Separately",
    standardDeduction: 15750,
    brackets: [
      { min: 0, max: 11925, rate: 0.1 },
      { min: 11925, max: 48475, rate: 0.12 },
      { min: 48475, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250525, rate: 0.32 },
      { min: 250525, max: 375800, rate: 0.35 },
      { min: 375800, max: Infinity, rate: 0.37 },
    ],
  },
  hoh: {
    id: "hoh",
    label: "Head of Household",
    standardDeduction: 23625,
    brackets: [
      { min: 0, max: 17000, rate: 0.1 },
      { min: 17000, max: 64850, rate: 0.12 },
      { min: 64850, max: 103350, rate: 0.22 },
      { min: 103350, max: 197300, rate: 0.24 },
      { min: 197300, max: 250500, rate: 0.32 },
      { min: 250500, max: 626350, rate: 0.35 },
      { min: 626350, max: Infinity, rate: 0.37 },
    ],
  },
};

export interface TaxBracketResult {
  bracket: TaxBracket;
  taxableInBracket: number;
  taxInBracket: number;
}

export interface TaxResult {
  grossIncome: number;
  standardDeduction: number;
  taxableIncome: number;
  totalTax: number;
  marginalRate: number;
  effectiveRate: number;
  brackets: TaxBracketResult[];
  statusId: string;
  year: number;
}

export function calculateUsTax(
  grossIncome: number,
  statusId: string
): TaxResult {
  const status = US_2025_STATUSES[statusId] ?? US_2025_STATUSES.single;
  const taxable = Math.max(0, grossIncome - status.standardDeduction);
  let totalTax = 0;
  const rows: TaxBracketResult[] = [];
  let marginalRate = 0;
  for (const bracket of status.brackets) {
    if (taxable <= bracket.min) break;
    const upper = Math.min(taxable, bracket.max);
    const inBracket = upper - bracket.min;
    if (inBracket <= 0) continue;
    const taxInBracket = inBracket * bracket.rate;
    totalTax += taxInBracket;
    marginalRate = bracket.rate;
    rows.push({ bracket, taxableInBracket: inBracket, taxInBracket });
  }
  const effectiveRate = taxable > 0 ? (totalTax / taxable) * 100 : 0;
  return {
    grossIncome,
    standardDeduction: status.standardDeduction,
    taxableIncome: taxable,
    totalTax,
    marginalRate,
    effectiveRate,
    brackets: rows,
    statusId,
    year: 2025,
  };
}

export interface CapitalGainsResult {
  capitalGain: number;
  taxableGain: number;
  estimatedTax: number;
}

export function capitalGainsTax(
  purchasePrice: number,
  salePrice: number,
  purchaseCosts: number,
  sellingCosts: number,
  taxRatePct: number
): CapitalGainsResult {
  const capitalGain = salePrice - purchasePrice - purchaseCosts - sellingCosts;
  const taxableGain = Math.max(0, capitalGain);
  return {
    capitalGain,
    taxableGain,
    estimatedTax: taxableGain * (taxRatePct / 100),
  };
}

export interface SavingsGoalResult {
  requiredMonthly: number;
  totalContributions: number;
  interestEarned: number;
  monthsToGoal: number;
  finalBalance: number;
  targetDate: string | null;
  onTrack: boolean;
}

const AVG_DAYS_PER_MONTH = 30.44;

/** Balance after `months` end-of-month contributions, compounding month by month. */
function simulateSavings(
  start: number,
  monthly: number,
  rMonthly: number,
  months: number
): number {
  let balance = start;
  for (let m = 0; m < months; m++) {
    balance = balance * (1 + rMonthly) + monthly;
  }
  return balance;
}

/**
 * Find the smallest monthly contribution that reaches `targetAmount` after
 * exactly `months` end-of-month contributions (binary search on the simulation,
 * so the answer agrees exactly with the integer-month loop used elsewhere).
 */
function binarySearchRequiredMonthly(
  currentSavings: number,
  targetAmount: number,
  rMonthly: number,
  months: number
): number {
  if (months <= 0) return Math.max(0, targetAmount - currentSavings);
  if (rMonthly === 0) return Math.max(0, (targetAmount - currentSavings) / months);

  let lo = 0;
  let hi = Math.max(0, targetAmount - currentSavings);
  // Widen the search range until the goal is reachable within `months`.
  while (simulateSavings(currentSavings, hi, rMonthly, months) < targetAmount - 0.005 && hi < targetAmount * 4) {
    hi *= 2;
  }
  for (let i = 0; i < 100 && hi - lo > 1e-9; i++) {
    const mid = (lo + hi) / 2;
    if (simulateSavings(currentSavings, mid, rMonthly, months) >= targetAmount - 0.005) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return Math.max(0, hi);
}

export function savingsGoal(
  targetAmount: number,
  currentSavings: number,
  monthlyContribution: number,
  annualRatePct: number,
  targetDate: Date | null,
  now: Date = new Date()
): SavingsGoalResult {
  const remaining = Math.max(0, targetAmount - currentSavings);
  const monthsLeft = targetDate
    ? Math.max(0, (targetDate.getTime() - now.getTime()) / (AVG_DAYS_PER_MONTH * 86400000))
    : null;

  // Use an integer number of months so requiredMonthly reconciles with the
  // integer-month simulation below (the 30.44-day month is an approximation).
  const nMonths = monthsLeft == null ? null : Math.max(1, Math.round(monthsLeft));
  const rMonthly = nominalMonthlyRate(annualRatePct);

  let requiredMonthly = 0;
  if (remaining > 0 && nMonths != null) {
    requiredMonthly = binarySearchRequiredMonthly(currentSavings, remaining + currentSavings, rMonthly, nMonths);
  }

  const effMonthly = monthlyContribution > 0 ? monthlyContribution : requiredMonthly;
  let m = 0;
  let balance = currentSavings;
  while (balance < targetAmount - 0.005 && m < 1200) {
    m++;
    balance = balance * (1 + rMonthly) + effMonthly;
  }
  const monthsToGoal = m < 1200 ? m : Infinity;
  const reached = Number.isFinite(monthsToGoal);
  const totalContributions = currentSavings + effMonthly * monthsToGoal;
  const finalBalance = reached ? balance : NaN;
  const interestEarned = reached ? Math.max(0, balance - totalContributions) : NaN;

  const usableTargetDate = targetDate && targetDate.getTime() > now.getTime() ? targetDate : null;
  const onTrack = usableTargetDate ? monthsLeft != null && monthsToGoal <= monthsLeft + 0.5 : true;

  return {
    requiredMonthly,
    totalContributions,
    interestEarned,
    monthsToGoal,
    finalBalance,
    targetDate: usableTargetDate ? usableTargetDate.toISOString() : null,
    onTrack,
  };
}

export interface SalesTaxResult {
  taxAmount: number;
  totalWithTax: number;
}

/** Sales tax: price before tax multiplied by the tax rate in percent. */
export function salesTax(amount: number, taxRatePct: number): SalesTaxResult {
  const tax = amount * (taxRatePct / 100);
  return { taxAmount: tax, totalWithTax: amount + tax };
}

export interface SimpleInterestResult {
  interest: number;
  total: number;
}

/** Simple interest (no compounding): principle * rate * time. */
export function simpleInterest(principal: number, annualRatePct: number, years: number): SimpleInterestResult {
  const interest = principal * (annualRatePct / 100) * years;
  return { interest, total: principal + interest };
}

export interface InflationResult {
  futureValue: number;
  todayValue: number;
  lossPct: number;
}

/** Converts an amount across years using a constant annual inflation rate. */
export function inflation(amount: number, annualRatePct: number, years: number): InflationResult {
  const factor = Math.pow(1 + annualRatePct / 100, years);
  const futureValue = amount * factor;
  return {
    futureValue,
    todayValue: amount / factor,
    lossPct: (1 - 1 / factor) * 100,
  };
}

export interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

/** Net worth from a total of assets and liabilities. */
export function netWorth(assets: number, liabilities: number): NetWorthResult {
  return {
    totalAssets: Math.max(0, assets),
    totalLiabilities: Math.max(0, liabilities),
    netWorth: assets - liabilities,
  };
}

export interface EmergencyFundResult {
  monthsCovered: number;
  targetAmount: number;
  onTrack: boolean;
  monthsGoal: number;
}

/** How many months a current balance covers; accepts a target months goal. */
export function emergencyFund(
  monthlyExpenses: number,
  currentSavings: number,
  monthsGoal: number
): EmergencyFundResult | null {
  if (!safePositive(monthlyExpenses)) return null;
  const monthsCovered = currentSavings / monthlyExpenses;
  const targetAmount = monthlyExpenses * monthsGoal;
  return {
    monthsCovered,
    targetAmount,
    onTrack: monthsCovered >= monthsGoal,
    monthsGoal,
  };
}
