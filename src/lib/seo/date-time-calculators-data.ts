/**
 * Long-tail landing-page dataset for the Age Calculator and Date
 * Calculator (PR 4 of the rapidtables-alternative plan: PLAN.md).
 *
 * Two URL patterns:
 *   /age/from-YYYY-MM-DD                       (age-calculator)
 *   /date/days-between-YYYY-MM-DD-and-YYYY-MM-DD (date-calculator)
 *   /date/YYYY-MM-DD-plus-NN-days              (date-calculator)
 *   /date/YYYY-MM-DD-minus-NN-days             (date-calculator)
 *
 * The "age if born on" query is one of the highest-volume personal
 * queries globally (e.g. "age if born in 1990"). The "days between
 * YYYY-MM-DD and YYYY-MM-DD" query drives the bulk of date-calculator
 * traffic. Both feed into the landing-page engine from PR 1.
 */

import type { LandingPage } from "./landing-pages";

const TOOL = "age-calculator";
const URL_CATEGORY_AGE = "age";
const TOOL_DATE = "date-calculator";
const URL_CATEGORY_DATE = "date";

// ─────────────────────────────────────────────────────────────────────
// Age Calculator pre-fills: "age if born on <date>" — the most
// searched personal-calculator query. We span 1970-2010 (40 dates)
// to cover the prime working-age + Gen X + Millennial + Gen Z
// audiences who Google this question.
// ─────────────────────────────────────────────────────────────────────

const AGE_FILLS: { date: string }[] = [
  // Gen X
  { date: "1970-01-01" },
  { date: "1970-05-15" },
  { date: "1970-12-31" },
  { date: "1975-03-20" },
  { date: "1975-08-10" },
  { date: "1979-01-15" },
  // Millennials
  { date: "1980-05-15" },
  { date: "1980-11-22" },
  { date: "1982-01-01" },
  { date: "1984-07-04" },
  { date: "1985-12-25" },
  { date: "1986-09-09" },
  { date: "1988-02-29" },  // leap year edge case
  { date: "1990-01-01" },
  { date: "1990-05-15" },
  { date: "1990-08-20" },
  { date: "1990-12-31" },
  { date: "1992-06-15" },
  { date: "1994-04-12" },
  { date: "1995-11-30" },
  { date: "1996-02-29" },  // leap year edge case
  { date: "1997-09-10" },
  { date: "1998-05-04" },
  { date: "1999-12-31" },
  // Gen Z
  { date: "2000-01-01" },
  { date: "2000-09-09" },
  { date: "2001-09-11" },
  { date: "2002-08-15" },
  { date: "2003-06-22" },
  { date: "2004-02-29" },  // leap year edge case
  { date: "2005-07-18" },
  { date: "2006-04-10" },
  { date: "2007-11-30" },
  { date: "2008-02-29" },  // leap year edge case
  { date: "2009-06-15" },
  { date: "2010-01-15" },
  { date: "2010-07-04" },
  { date: "2010-12-31" },
];

function ageSlug(d: string): string {
  return `from-${d}`;
}

function ageTitle(d: string): string {
  const date = new Date(d + "T00:00:00");
  return `Age if born on ${date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
}

function ageDescription(d: string): string {
  return `Calculate the exact age for a person born on ${d}. Years, months, days, hours, minutes, plus zodiac and next birthday. Free, instant, browser-based.`;
}

function ageFormula(d: string, atIso: string): string {
  const birth = new Date(d + "T00:00:00");
  const at = new Date(atIso + "T00:00:00");
  let years = at.getFullYear() - birth.getFullYear();
  let months = at.getMonth() - birth.getMonth();
  let days = at.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    const lastMonth = new Date(at.getFullYear(), at.getMonth(), 0);
    days += lastMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) years = 0;
  return `Age = ${years} years, ${months} months, ${days} days (as of ${atIso})`;
}

function ageSeeAlso(d: string, knownSlugs: Set<string>): string[] {
  const date = new Date(d + "T00:00:00");
  const out: string[] = [];
  // Surface nearby dates (1 day, 1 week, 1 month, 1 year away).
  // Only include refs that exist in the registry so the engine's
  // seeAlso-resolves invariant holds.
  for (const off of [1, 7, 30, 365]) {
    const nd = new Date(date);
    nd.setDate(nd.getDate() + off);
    const ref = `${URL_CATEGORY_AGE}/from-${nd.toISOString().slice(0, 10)}`;
    if (knownSlugs.has(ref) && !out.includes(ref)) {
      out.push(ref);
      if (out.length === 4) return out;
    }
  }
  return out;
}

function ageFaq(d: string): { question: string; answer: string }[] {
  return [
    {
      question: `How old am I if I was born on ${d}?`,
      answer: `Enter ${d} as your date of birth on the calculator above to see your exact age in years, months, days, hours, and minutes — plus your zodiac sign, generation, and the day of the week you were born.`,
    },
    {
      question: `What day of the week was ${d}?`,
      answer: `Enter ${d} on the calculator above. The "Born on" card shows the day of the week.`,
    },
    {
      question: `How many days have I been alive if born on ${d}?`,
      answer: `The calculator shows total days, total hours, and total minutes since ${d}. The "Age" card has the exact counts.`,
    },
  ];
}

function agePreFills(): LandingPage[] {
  // Use a fixed "at" date so the formula text is reproducible across
  // builds. We use the build-time date so the title remains accurate
  // for a window of ~24h. For a static date, pick today's UTC date.
  const atIso = new Date().toISOString().slice(0, 10);
  // Pre-compute the set of slugs we emit so see-also refs only point to
  // pages we actually own (the engine's invariant for indexable URLs).
  const knownSlugs = new Set(AGE_FILLS.map(({ date }) => `${URL_CATEGORY_AGE}/${ageSlug(date)}`));
  return AGE_FILLS.map(({ date }) => ({
    canonicalSlug: TOOL,
    category: URL_CATEGORY_AGE,
    slug: ageSlug(date),
    intent: "compute" as const,
    title: ageTitle(date),
    description: ageDescription(date),
    prefill: { birthdate: date, atDate: atIso },
    content: {
      formula: ageFormula(date, atIso),
      seeAlso: ageSeeAlso(date, knownSlugs),
    },
    faq: ageFaq(date),
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Date Calculator pre-fills: "days between X and Y" + "X days from Y".
// We span a mix of common queries:
//   - "days between YYYY-MM-DD and YYYY-MM-DD" (10 entries)
//   - "X days from YYYY-MM-DD" (5 entries)
//   - "X days before YYYY-MM-DD" (5 entries)
// ─────────────────────────────────────────────────────────────────────

interface DateFill {
  kind: "between" | "plus" | "minus";
  dateA: string;
  dateB?: string;
  amount?: number;
  unit?: string;
  title: string;
}

const DATE_FILLS: DateFill[] = [
  // Most-searched "days between" pairs
  { kind: "between", dateA: "2026-01-01", dateB: "2026-09-02", title: "Days between January 1 and September 2, 2026" },
  { kind: "between", dateA: "2025-01-01", dateB: "2026-01-01", title: "Days between 2025-01-01 and 2026-01-01 (1 year)" },
  { kind: "between", dateA: "2026-01-01", dateB: "2026-12-31", title: "Days between January 1 and December 31, 2026" },
  { kind: "between", dateA: "2024-01-01", dateB: "2026-09-02", title: "Days between 2024-01-01 and 2026-09-02" },
  { kind: "between", dateA: "2025-09-02", dateB: "2026-09-02", title: "Days between 2025-09-02 and 2026-09-02 (1 year)" },
  { kind: "between", dateA: "2026-06-01", dateB: "2026-09-02", title: "Days between June 1 and September 2, 2026" },
  { kind: "between", dateA: "2026-03-01", dateB: "2026-09-02", title: "Days between March 1 and September 2, 2026" },
  { kind: "between", dateA: "2026-09-02", dateB: "2027-09-02", title: "Days between 2026-09-02 and 2027-09-02 (1 year)" },
  { kind: "between", dateA: "2020-01-01", dateB: "2026-09-02", title: "Days between 2020-01-01 and 2026-09-02" },
  { kind: "between", dateA: "2010-01-01", dateB: "2026-09-02", title: "Days between 2010-01-01 and 2026-09-02 (16 years)" },
  // Plus queries
  { kind: "plus", dateA: "2026-09-02", amount: 30, unit: "days", title: "30 days from September 2, 2026" },
  { kind: "plus", dateA: "2026-09-02", amount: 90, unit: "days", title: "90 days from September 2, 2026" },
  { kind: "plus", dateA: "2026-09-02", amount: 180, unit: "days", title: "180 days from September 2, 2026" },
  { kind: "plus", dateA: "2026-09-02", amount: 6, unit: "months", title: "6 months from September 2, 2026" },
  { kind: "plus", dateA: "2026-09-02", amount: 1, unit: "years", title: "1 year from September 2, 2026" },
  // Minus queries
  { kind: "minus", dateA: "2026-09-02", amount: 30, unit: "days", title: "30 days before September 2, 2026" },
  { kind: "minus", dateA: "2026-09-02", amount: 90, unit: "days", title: "90 days before September 2, 2026" },
  { kind: "minus", dateA: "2026-09-02", amount: 6, unit: "months", title: "6 months before September 2, 2026" },
  { kind: "minus", dateA: "2026-09-02", amount: 1, unit: "years", title: "1 year before September 2, 2026" },
  { kind: "minus", dateA: "2026-09-02", amount: 7, unit: "days", title: "7 days before September 2, 2026" },
];

function dateSlug(f: DateFill): string {
  if (f.kind === "between") {
    return `days-between-${f.dateA}-and-${f.dateB}`;
  }
  if (f.kind === "plus") {
    return `${f.dateA}-plus-${f.amount}-${f.unit}`;
  }
  return `${f.dateA}-minus-${f.amount}-${f.unit}`;
}

function datePreFill(f: DateFill): Record<string, string> {
  if (f.kind === "between") {
    return {
      mode: "difference",
      startDate: f.dateA,
      dateA: f.dateA,
      dateB: f.dateB!,
    };
  }
  if (f.kind === "plus") {
    return {
      mode: "arithmetic",
      startDate: f.dateA,
      op: "add",
      amount: String(f.amount),
      unit: f.unit!,
    };
  }
  return {
    mode: "arithmetic",
    startDate: f.dateA,
    op: "subtract",
    amount: String(f.amount),
    unit: f.unit!,
  };
}

function dateDescription(f: DateFill): string {
  if (f.kind === "between") {
    return `Calculate the exact number of days between ${f.dateA} and ${f.dateB}. Free, instant, browser-based.`;
  }
  if (f.kind === "plus") {
    return `Calculate the date ${f.amount} ${f.unit} after ${f.dateA}. Free, instant, browser-based.`;
  }
  return `Calculate the date ${f.amount} ${f.unit} before ${f.dateA}. Free, instant, browser-based.`;
}

function dateFormula(f: DateFill): string {
  if (f.kind === "between") {
    const a = new Date(f.dateA + "T00:00:00");
    const b = new Date(f.dateB! + "T00:00:00");
    const days = Math.round((b.getTime() - a.getTime()) / 86400000);
    return `Days = (${f.dateB!} − ${f.dateA}) / 1 day = ${days} days`;
  }
  if (f.kind === "plus") {
    return `${f.dateA} + ${f.amount} ${f.unit} = result date`;
  }
  return `${f.dateA} − ${f.amount} ${f.unit} = result date`;
}

function dateFaq(f: DateFill): { question: string; answer: string }[] {
  if (f.kind === "between") {
    return [
      {
        question: `How many days are between ${f.dateA} and ${f.dateB}?`,
        answer: `Use the calculator above — the "Date Difference" mode is pre-filled with ${f.dateA} and ${f.dateB}. The result shows the exact days, plus a years/months/days breakdown.`,
      },
      {
        question: `How many weeks is that?`,
        answer: `Divide the total days by 7. The calculator's difference result also shows months and years.`,
      },
    ];
  }
  if (f.kind === "plus") {
    return [
      {
        question: `What is ${f.amount} ${f.unit} after ${f.dateA}?`,
        answer: `The calculator above computes the date ${f.amount} ${f.unit} after ${f.dateA}. Use the "Add / Subtract" mode to try other amounts.`,
      },
    ];
  }
  return [
    {
      question: `What is ${f.amount} ${f.unit} before ${f.dateA}?`,
      answer: `The calculator above computes the date ${f.amount} ${f.unit} before ${f.dateA}. Use the "Add / Subtract" mode to try other amounts.`,
    },
  ];
}

function datePreFills(): LandingPage[] {
  return DATE_FILLS.map((f) => ({
    canonicalSlug: TOOL_DATE,
    category: URL_CATEGORY_DATE,
    slug: dateSlug(f),
    intent: f.kind === "between" ? "compute" as const : "convert" as const,
    title: f.title,
    description: dateDescription(f),
    prefill: datePreFill(f),
    content: {
      formula: dateFormula(f),
    },
    faq: dateFaq(f),
  }));
}

export function buildDateTimeLandingPages(): LandingPage[] {
  return [...agePreFills(), ...datePreFills()];
}
