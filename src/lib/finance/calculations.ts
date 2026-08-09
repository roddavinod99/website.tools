// Pure financial calculation functions used by the Finance tool category.
// All functions are deterministic and dependency-free so they can be unit-tested.
// Values are kept as plain numbers with full precision; formatting happens in format.ts
// only at presentation time.

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
  years: number
): RatePoint[] {
  if (years <= 0) return [];
  const points: RatePoint[] = [];
  const rMonthly = annualRatePct / 100 / 12;
  let balance = principal;
  let contributions = principal;
  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      balance = balance * (1 + rMonthly) + monthlyContribution;
      contributions += monthlyContribution;
    }
    points.push({ years: y, balance, contributions, interest: balance - contributions });
  }
  return points;
}

/** Standard EMI (equal monthly installments) for a fixed-rate loan. */
export function loanEmi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = nominalMonthlyRate(annualRatePct);
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

export interface AmortizationRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

/** Full amortization schedule for a fixed-rate loan. The final payment is
 *  adjusted so principal sums exactly to the loan amount (final balance 0). */
export function amortizationSchedule(
  principal: number,
  annualRatePct: number,
  months: number
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  if (principal <= 0 || months <= 0) return schedule;
  const r = nominalMonthlyRate(annualRatePct);
  const payment = loanEmi(principal, annualRatePct, months);
  let balance = principal;
  for (let i = 1; i <= months; i++) {
    const interest = balance * r;
    const isLast = i === months;
    const principalPortion = isLast ? balance : Math.min(payment - interest, balance);
    const pay = interest + principalPortion;
    balance -= principalPortion;
    schedule.push({
      period: i,
      payment: pay,
      interest,
      principal: principalPortion,
      balance: balance < 0 ? 0 : balance,
    });
  }
  return schedule;
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
  const annualizedPct = totalOutlay > 0 && years > 0
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
 * above the sum of minimums goes to the target debt each month.
 */
export function debtPayoff(
  debts: DebtEntry[],
  strategy: "snowball" | "avalanche",
  monthlyBudget: number
): DebtPayoffResult | null {
  const active = debts.map((d) => ({ ...d })).filter((d) => d.balance > 0);
  if (active.length === 0) return null;

  const minPayments = active.reduce((sum, d) => sum + d.minPayment, 0);
  if (minPayments > monthlyBudget) return null;

  const order = sortDebts(active, strategy).map((d) => d.name);
  const schedule: DebtPayoffMonth[] = [];
  let months = 0;
  let totalInterest = 0;

  while (active.some((d) => d.balance > 0.005) && months < 1200) {
    months++;
    const mapPay = new Map<string, number>();
    let interestThisMonth = 0;

    for (const debt of active) {
      if (debt.balance <= 0.005) continue;
      const interest = (debt.balance * debt.apr) / 100 / 12;
      interestThisMonth += interest;
      debt.balance += interest;
      const minP = Math.min(debt.minPayment, debt.balance);
      debt.balance -= minP;
      mapPay.set(debt.name, (mapPay.get(debt.name) ?? 0) + minP);
    }

    let extra = monthlyBudget - minPayments;
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

export function savingsGoal(
  targetAmount: number,
  currentSavings: number,
  monthlyContribution: number,
  annualRatePct: number,
  targetDate: Date | null,
  now: Date = new Date()
): SavingsGoalResult {
  const rMonthly = nominalMonthlyRate(annualRatePct);
  const remaining = Math.max(0, targetAmount - currentSavings);
  const monthsLeft = targetDate
    ? Math.max(0, (targetDate.getTime() - now.getTime()) / (AVG_DAYS_PER_MONTH * 86400000))
    : null;

  let requiredMonthly = 0;
  if (remaining > 0) {
    const n = Math.max(monthsLeft ?? 1, 1);
    if (rMonthly === 0) {
      requiredMonthly = remaining / n;
    } else {
      // Correct closed form: the current balance compounds too, so the monthly
      // deposit only needs to cover the discounted gap between target and the
      // current balance's own future value.
      requiredMonthly = Math.max(
        0,
        ((targetAmount - currentSavings * Math.pow(1 + rMonthly, n)) * rMonthly) /
          (Math.pow(1 + rMonthly, n) - 1)
      );
    }
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
  const onTrack = usableTargetDate ? monthsToGoal <= (monthsLeft ?? Infinity) : true;

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
