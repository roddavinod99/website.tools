/**
 * Long-tail landing-page dataset for finance calculators (PR 5 of
 * the rapidtables-alternative plan: PLAN.md).
 *
 * Three URL patterns, one per calculator:
 *   /finance/mortgage-<amount>-<years>y-<rate>pct
 *   /finance/compound-<amount>-<years>y-<rate>pct[-monthly-<contribution>]
 *   /finance/loan-<amount>-<years>y-<rate>pct
 *
 * The mortgage + EMI pairs are the highest-volume "X dollar mortgage
 * payment" queries globally. The compound-interest pairs are the
 * highest-volume "X dollars at Y% for Z years" queries.
 *
 * Each entry's prefill is a flat Record<string, string> that the
 * calculator's usePrefillTool hook applies on mount.
 */

import type { LandingPage } from "./landing-pages";

const URL_CATEGORY = "finance";
const TOOL_MORTGAGE = "mortgage-payoff";
const TOOL_COMPOUND = "compound-interest-calculator";
const TOOL_LOAN = "loan-emi-calculator";

// ─────────────────────────────────────────────────────────────────────
// Mortgage: 30 entries. The most-searched US mortgage amounts are
// 200k, 300k, 400k, 500k. Rates 5-8%, terms 15/20/30 years.
// ─────────────────────────────────────────────────────────────────────

interface MortgageFill {
  principal: string;
  rate: string;
  years: string;
  title: string;
}

const MORTGAGE_FILLS: MortgageFill[] = [
  { principal: "200000", rate: "6", years: "30", title: "$200,000 mortgage at 6% for 30 years" },
  { principal: "200000", rate: "7", years: "30", title: "$200,000 mortgage at 7% for 30 years" },
  { principal: "250000", rate: "6", years: "30", title: "$250,000 mortgage at 6% for 30 years" },
  { principal: "250000", rate: "7", years: "30", title: "$250,000 mortgage at 7% for 30 years" },
  { principal: "300000", rate: "6", years: "30", title: "$300,000 mortgage at 6% for 30 years" },
  { principal: "300000", rate: "6.5", years: "30", title: "$300,000 mortgage at 6.5% for 30 years" },
  { principal: "300000", rate: "7", years: "30", title: "$300,000 mortgage at 7% for 30 years" },
  { principal: "300000", rate: "7", years: "15", title: "$300,000 mortgage at 7% for 15 years" },
  { principal: "350000", rate: "6.5", years: "30", title: "$350,000 mortgage at 6.5% for 30 years" },
  { principal: "400000", rate: "6", years: "30", title: "$400,000 mortgage at 6% for 30 years" },
  { principal: "400000", rate: "6.5", years: "30", title: "$400,000 mortgage at 6.5% for 30 years" },
  { principal: "400000", rate: "7", years: "30", title: "$400,000 mortgage at 7% for 30 years" },
  { principal: "400000", rate: "7", years: "15", title: "$400,000 mortgage at 7% for 15 years" },
  { principal: "450000", rate: "6.5", years: "30", title: "$450,000 mortgage at 6.5% for 30 years" },
  { principal: "500000", rate: "6", years: "30", title: "$500,000 mortgage at 6% for 30 years" },
  { principal: "500000", rate: "6.5", years: "30", title: "$500,000 mortgage at 6.5% for 30 years" },
  { principal: "500000", rate: "7", years: "30", title: "$500,000 mortgage at 7% for 30 years" },
  { principal: "500000", rate: "7", years: "15", title: "$500,000 mortgage at 7% for 15 years" },
  { principal: "500000", rate: "8", years: "30", title: "$500,000 mortgage at 8% for 30 years" },
  { principal: "600000", rate: "6.5", years: "30", title: "$600,000 mortgage at 6.5% for 30 years" },
  { principal: "600000", rate: "7", years: "30", title: "$600,000 mortgage at 7% for 30 years" },
  { principal: "700000", rate: "7", years: "30", title: "$700,000 mortgage at 7% for 30 years" },
  { principal: "750000", rate: "7", years: "30", title: "$750,000 mortgage at 7% for 30 years" },
  { principal: "1000000", rate: "6", years: "30", title: "$1,000,000 mortgage at 6% for 30 years" },
  { principal: "1000000", rate: "7", years: "30", title: "$1,000,000 mortgage at 7% for 30 years" },
  { principal: "100000", rate: "7", years: "30", title: "$100,000 mortgage at 7% for 30 years" },
  { principal: "150000", rate: "6", years: "30", title: "$150,000 mortgage at 6% for 30 years" },
  { principal: "150000", rate: "7", years: "30", title: "$150,000 mortgage at 7% for 30 years" },
  { principal: "400000", rate: "6", years: "15", title: "$400,000 mortgage at 6% for 15 years" },
  { principal: "300000", rate: "5", years: "30", title: "$300,000 mortgage at 5% for 30 years" },
];

function mortgageSlug(m: MortgageFill): string {
  return `mortgage-${m.principal}-${m.years}y-${m.rate}pct`;
}

function mortgageDescription(m: MortgageFill): string {
  return `Estimate the monthly payment, total interest, and total cost for a $${Number(m.principal).toLocaleString()} ${m.years}-year mortgage at ${m.rate}% APR. Free, instant, browser-based.`;
}

function mortgageFormula(m: MortgageFill): string {
  const p = Number(m.principal);
  const r = Number(m.rate) / 100 / 12;
  const n = Number(m.years) * 12;
  if (r === 0) {
    const emi = p / n;
    return `EMI = $${emi.toFixed(2)}/month (zero interest)`;
  }
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return `EMI = $${emi.toFixed(2)}/month (${m.years}-yr × 12 × ${m.rate}% APR)`;
}

function mortgageSeeAlso(m: MortgageFill, knownSlugs: Set<string>): string[] {
  const out: string[] = [];
  const variants: { principal?: string; rate?: string; years?: string; title: string }[] = [
    { rate: "6", title: "" },
    { rate: "7", title: "" },
    { years: "15", title: "" },
    { years: "20", title: "" },
  ];
  for (const v of variants) {
    const slug = mortgageSlug({
      principal: v.principal ?? m.principal,
      rate: v.rate ?? m.rate,
      years: v.years ?? m.years,
      title: "",
    });
    const ref = `${URL_CATEGORY}/${slug}`;
    if (knownSlugs.has(ref) && !out.includes(ref) && ref !== `${URL_CATEGORY}/${mortgageSlug(m)}`) {
      out.push(ref);
      if (out.length === 4) return out;
    }
  }
  return out;
}

function mortgageFaq(m: MortgageFill): { question: string; answer: string }[] {
  const p = Number(m.principal);
  const r = Number(m.rate) / 100 / 12;
  const n = Number(m.years) * 12;
  const emi = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n;
  return [
    {
      question: `What is the monthly payment on a $${p.toLocaleString()} mortgage at ${m.rate}% for ${m.years} years?`,
      answer: `Approximately $${Math.round(emi).toLocaleString()}/month. The exact value is shown in the calculator above. Use the "Home price" field to try other amounts.`,
    },
    {
      question: `How much interest do I pay on a $${p.toLocaleString()} ${m.years}-year mortgage at ${m.rate}%?`,
      answer: `Total interest = monthly payment × ${n} − $${p.toLocaleString()}. The "Total interest" figure in the calculator shows the exact number.`,
    },
    {
      question: `Is ${m.rate}% a realistic mortgage rate?`,
      answer: `Mortgage rates vary by country, lender, credit score, and term. ${m.rate}% is a reasonable mid-range estimate. Compare with current rates from a licensed lender before committing.`,
    },
  ];
}

function mortgageFills(): LandingPage[] {
  const knownSlugs = new Set(MORTGAGE_FILLS.map((m) => `${URL_CATEGORY}/${mortgageSlug(m)}`));
  return MORTGAGE_FILLS.map((m) => ({
    canonicalSlug: TOOL_MORTGAGE,
    category: URL_CATEGORY,
    slug: mortgageSlug(m),
    intent: "compute" as const,
    title: m.title,
    description: mortgageDescription(m),
    prefill: { principal: m.principal, rate: m.rate, years: m.years },
    content: {
      formula: mortgageFormula(m),
      seeAlso: mortgageSeeAlso(m, knownSlugs),
    },
    faq: mortgageFaq(m),
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Compound Interest: 30 entries. Combinations of principal, term,
// rate, and (optionally) a monthly contribution. The most-searched
// pattern is "$X at Y% for Z years" with no monthly contribution.
// ─────────────────────────────────────────────────────────────────────

interface CompoundFill {
  principal: string;
  rate: string;
  years: string;
  monthly?: string;
  title?: string;
}

const COMPOUND_FILLS: CompoundFill[] = [
  // Lump sum, 10-year horizon, varying rate
  { principal: "10000", rate: "5", years: "10" },
  { principal: "10000", rate: "7", years: "10" },
  { principal: "10000", rate: "10", years: "10" },
  { principal: "25000", rate: "7", years: "10" },
  { principal: "50000", rate: "7", years: "10" },
  { principal: "100000", rate: "7", years: "10" },
  // 20-year horizon
  { principal: "10000", rate: "7", years: "20" },
  { principal: "10000", rate: "10", years: "20" },
  { principal: "25000", rate: "7", years: "20" },
  { principal: "50000", rate: "7", years: "20" },
  { principal: "100000", rate: "7", years: "20" },
  { principal: "100000", rate: "10", years: "20" },
  // 30-year horizon (retirement-style)
  { principal: "10000", rate: "7", years: "30" },
  { principal: "10000", rate: "10", years: "30" },
  { principal: "25000", rate: "7", years: "30" },
  { principal: "50000", rate: "7", years: "30" },
  { principal: "50000", rate: "10", years: "30" },
  { principal: "100000", rate: "7", years: "30" },
  { principal: "100000", rate: "10", years: "30" },
  // With monthly contributions (savings-plan queries)
  { principal: "1000", rate: "7", years: "20", monthly: "200" },
  { principal: "1000", rate: "7", years: "30", monthly: "200" },
  { principal: "1000", rate: "7", years: "30", monthly: "500" },
  { principal: "5000", rate: "7", years: "20", monthly: "300" },
  { principal: "5000", rate: "7", years: "30", monthly: "500" },
  { principal: "10000", rate: "7", years: "20", monthly: "500" },
  { principal: "10000", rate: "7", years: "30", monthly: "1000" },
  // Small amounts
  { principal: "1000", rate: "5", years: "10" },
  { principal: "5000", rate: "5", years: "10" },
  { principal: "5000", rate: "7", years: "10" },
];

function compoundSlug(c: CompoundFill): string {
  const base = `compound-${c.principal}-${c.years}y-${c.rate}pct`;
  return c.monthly ? `${base}-monthly-${c.monthly}` : base;
}

function compoundTitle(c: CompoundFill): string {
  if (c.title) return c.title;
  const principal = Number(c.principal).toLocaleString();
  const monthly = c.monthly ? ` with $${Number(c.monthly).toLocaleString()}/month` : "";
  return `$${principal} at ${c.rate}% for ${c.years} years${monthly}`;
}

function compoundDescription(c: CompoundFill): string {
  const principal = Number(c.principal).toLocaleString();
  const monthly = c.monthly ? ` with $${Number(c.monthly).toLocaleString()}/month` : "";
  return `Project the future value of $${principal} invested at ${c.rate}% APR for ${c.years} years${monthly}. Free, instant, browser-based.`;
}

function compoundFutureValueApprox(p: number, r: number, y: number, m?: number): number {
  const annualRate = r / 100;
  const lumpSum = p * Math.pow(1 + annualRate, y);
  const monthlyContrib = m ? m * 12 * (Math.pow(1 + annualRate, y) - 1) / annualRate : 0;
  return lumpSum + monthlyContrib;
}

function compoundFormula(c: CompoundFill): string {
  const p = Number(c.principal);
  const r = Number(c.rate) / 100;
  const y = Number(c.years);
  const m = c.monthly ? Number(c.monthly) : undefined;
  const fv = compoundFutureValueApprox(p, r, y, m);
  return `FV = $${p.toLocaleString()} × (1 + ${c.rate}%)${y}${m ? ` + $${m.toLocaleString()}/mo × 12 × [(1 + ${c.rate}%)${y} − 1] / ${c.rate}%` : ""} = ~$${Math.round(fv).toLocaleString()}`;
}

function compoundSeeAlso(c: CompoundFill, knownSlugs: Set<string>): string[] {
  const out: string[] = [];
  const variants: CompoundFill[] = [
    { principal: c.principal, rate: c.rate, years: "20", title: "" },
    { principal: c.principal, rate: c.rate, years: "30", title: "" },
    { principal: c.principal, rate: "10", years: c.years, title: "" },
  ];
  for (const v of variants) {
    const slug = compoundSlug(v);
    const ref = `${URL_CATEGORY}/${slug}`;
    if (ref !== `${URL_CATEGORY}/${compoundSlug(c)}` && knownSlugs.has(ref) && !out.includes(ref)) {
      out.push(ref);
      if (out.length === 4) return out;
    }
  }
  return out;
}

function compoundFaq(c: CompoundFill): { question: string; answer: string }[] {
  const p = Number(c.principal);
  const r = Number(c.rate) / 100;
  const y = Number(c.years);
  const m = c.monthly ? Number(c.monthly) : undefined;
  const fv = compoundFutureValueApprox(p, r, y, m);
  return [
    {
      question: `How much will $${p.toLocaleString()} grow to in ${y} years at ${c.rate}%?`,
      answer: `Approximately $${Math.round(fv).toLocaleString()}. The exact value is shown in the calculator above. Use the "Initial amount" field to try different principals.`,
    },
    {
      question: `How much interest will I earn?`,
      answer: `Total interest = future value − (initial + total contributions). For $${p.toLocaleString()} over ${y} years at ${c.rate}%, the "Interest earned" figure in the calculator shows the exact number.`,
    },
    {
      question: `Is ${c.rate}% a realistic investment return?`,
      answer: `${c.rate}% is roughly the long-term S&P 500 average. Bond returns are typically lower. Real returns depend on the asset class, fees, and time horizon — past performance doesn't guarantee future results.`,
    },
  ];
}

function compoundFills(): LandingPage[] {
  const knownSlugs = new Set(COMPOUND_FILLS.map((c) => `${URL_CATEGORY}/${compoundSlug(c)}`));
  return COMPOUND_FILLS.map((c) => ({
    canonicalSlug: TOOL_COMPOUND,
    category: URL_CATEGORY,
    slug: compoundSlug(c),
    intent: "compute" as const,
    title: compoundTitle(c),
    description: compoundDescription(c),
    prefill: {
      principal: c.principal,
      rate: c.rate,
      years: c.years,
      ...(c.monthly ? { monthly: c.monthly } : {}),
    },
    content: {
      formula: compoundFormula(c),
      seeAlso: compoundSeeAlso(c, knownSlugs),
    },
    faq: compoundFaq(c),
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Loan EMI: 20 entries. The most-searched EMI queries are by
// principal amount: 100k, 200k, 500k, 1M at 8-12% for 5/10/20 years.
// ─────────────────────────────────────────────────────────────────────

interface LoanFill {
  principal: string;
  rate: string;
  years: string;
  title: string;
}

const LOAN_FILLS: LoanFill[] = [
  { principal: "100000", rate: "8", years: "10", title: "EMI for $100,000 loan at 8% for 10 years" },
  { principal: "100000", rate: "9", years: "10", title: "EMI for $100,000 loan at 9% for 10 years" },
  { principal: "100000", rate: "10", years: "10", title: "EMI for $100,000 loan at 10% for 10 years" },
  { principal: "100000", rate: "10", years: "5", title: "EMI for $100,000 loan at 10% for 5 years" },
  { principal: "200000", rate: "8", years: "10", title: "EMI for $200,000 loan at 8% for 10 years" },
  { principal: "200000", rate: "9", years: "10", title: "EMI for $200,000 loan at 9% for 10 years" },
  { principal: "200000", rate: "10", years: "10", title: "EMI for $200,000 loan at 10% for 10 years" },
  { principal: "200000", rate: "10", years: "20", title: "EMI for $200,000 loan at 10% for 20 years" },
  { principal: "500000", rate: "8", years: "10", title: "EMI for $500,000 loan at 8% for 10 years" },
  { principal: "500000", rate: "9", years: "10", title: "EMI for $500,000 loan at 9% for 10 years" },
  { principal: "500000", rate: "10", years: "20", title: "EMI for $500,000 loan at 10% for 20 years" },
  { principal: "500000", rate: "9", years: "20", title: "EMI for $500,000 loan at 9% for 20 years" },
  { principal: "1000000", rate: "8", years: "10", title: "EMI for $1,000,000 loan at 8% for 10 years" },
  { principal: "1000000", rate: "9", years: "20", title: "EMI for $1,000,000 loan at 9% for 20 years" },
  { principal: "1000000", rate: "10", years: "30", title: "EMI for $1,000,000 loan at 10% for 30 years" },
  { principal: "50000", rate: "8", years: "5", title: "EMI for $50,000 loan at 8% for 5 years" },
  { principal: "50000", rate: "10", years: "5", title: "EMI for $50,000 loan at 10% for 5 years" },
  { principal: "250000", rate: "9", years: "15", title: "EMI for $250,000 loan at 9% for 15 years" },
  { principal: "750000", rate: "7", years: "30", title: "EMI for $750,000 loan at 7% for 30 years" },
  { principal: "300000", rate: "9", years: "15", title: "EMI for $300,000 loan at 9% for 15 years" },
];

function loanSlug(l: LoanFill): string {
  return `loan-${l.principal}-${l.years}y-${l.rate}pct`;
}

function loanDescription(l: LoanFill): string {
  return `Calculate the monthly EMI, total interest, and total payment for a $${Number(l.principal).toLocaleString()} loan at ${l.rate}% APR for ${l.years} years. Free, instant, browser-based.`;
}

function loanFormula(l: LoanFill): string {
  const p = Number(l.principal);
  const r = Number(l.rate) / 100 / 12;
  const n = Number(l.years) * 12;
  if (r === 0) {
    const emi = p / n;
    return `EMI = $${emi.toFixed(2)}/month`;
  }
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return `EMI = [P × r × (1+r)^n] / [(1+r)^n − 1] = $${emi.toFixed(2)}/month`;
}

function loanSeeAlso(l: LoanFill, knownSlugs: Set<string>): string[] {
  const out: string[] = [];
  const variants: LoanFill[] = [
    { principal: l.principal, rate: l.rate, years: "5", title: "" },
    { principal: l.principal, rate: l.rate, years: "10", title: "" },
    { principal: l.principal, rate: "8", years: l.years, title: "" },
  ];
  for (const v of variants) {
    const slug = loanSlug(v);
    const ref = `${URL_CATEGORY}/${slug}`;
    if (ref !== `${URL_CATEGORY}/${loanSlug(l)}` && knownSlugs.has(ref) && !out.includes(ref)) {
      out.push(ref);
      if (out.length === 4) return out;
    }
  }
  return out;
}

function loanFaq(l: LoanFill): { question: string; answer: string }[] {
  const p = Number(l.principal);
  const r = Number(l.rate) / 100 / 12;
  const n = Number(l.years) * 12;
  const emi = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n;
  return [
    {
      question: `What is the EMI for a $${p.toLocaleString()} loan at ${l.rate}% for ${l.years} years?`,
      answer: `Approximately $${Math.round(emi).toLocaleString()}/month. The exact value is shown in the calculator above. Use the "Loan amount" field to try other amounts.`,
    },
    {
      question: `How much total interest do I pay?`,
      answer: `Total interest = EMI × ${n} months − $${p.toLocaleString()}. The "Total interest" figure in the calculator shows the exact number.`,
    },
    {
      question: `Is the EMI reducing-balance or flat?`,
      answer: `Reducing-balance (the standard for home, car, and personal loans). Each month the interest is computed on the outstanding principal, so early payments are mostly interest and later payments are mostly principal.`,
    },
  ];
}

function loanFills(): LandingPage[] {
  const knownSlugs = new Set(LOAN_FILLS.map((l) => `${URL_CATEGORY}/${loanSlug(l)}`));
  return LOAN_FILLS.map((l) => ({
    canonicalSlug: TOOL_LOAN,
    category: URL_CATEGORY,
    slug: loanSlug(l),
    intent: "compute" as const,
    title: l.title,
    description: loanDescription(l),
    prefill: { principal: l.principal, rate: l.rate, years: l.years },
    content: {
      formula: loanFormula(l),
      seeAlso: loanSeeAlso(l, knownSlugs),
    },
    faq: loanFaq(l),
  }));
}

export function buildFinanceLandingPages(): LandingPage[] {
  return [...mortgageFills(), ...compoundFills(), ...loanFills()];
}
