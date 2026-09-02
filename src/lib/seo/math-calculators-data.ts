/**
 * Long-tail landing-page dataset for math calculators (PR 6 of the
 * rapidtables-alternative plan: PLAN.md).
 *
 * URL patterns:
 *   /calc/sin-<degrees>                            (scientific, ~10)
 *   /calc/log-<value>                              (scientific, ~5)
 *   /stats/<set-name>                              (statistics, ~5)
 *   /tip/<pct>-on-<amount>                         (tip, ~15)
 *   /discount/<pct>-off-<amount>                   (discount, ~15)
 *
 * The "X degrees in radians", "log of X", "tip on $X", "X% off $X"
 * queries are the most-searched entry points for these calculators
 * in the math vertical. Each page pre-fills the underlying tool so
 * the result is visible immediately on load.
 */

import type { LandingPage } from "./landing-pages";

const URL_CATEGORY_CALC = "calc";
const URL_CATEGORY_STATS = "stats";
const URL_CATEGORY_TIP = "tip";
const URL_CATEGORY_DISCOUNT = "discount";

const TOOL_SCIENTIFIC = "scientific-calculator";
const TOOL_STATISTICS = "statistics-calculator";
const TOOL_TIP = "tip-calculator";
const TOOL_DISCOUNT = "discount-calculator";

// ─────────────────────────────────────────────────────────────────────
// Scientific: 15 pages covering trig presets, log presets, and π/e.
// ─────────────────────────────────────────────────────────────────────

interface ScientificFill {
  input: string;
  angleMode?: "deg" | "rad";
  title: string;
}

const SCIENTIFIC_FILLS: ScientificFill[] = [
  // Trig presets (most-searched: 30/45/60/90 degrees)
  { input: "30", angleMode: "deg", title: "sin(30°) — value of sine at 30 degrees" },
  { input: "45", angleMode: "deg", title: "sin(45°) — value of sine at 45 degrees" },
  { input: "60", angleMode: "deg", title: "sin(60°) — value of sine at 60 degrees" },
  { input: "90", angleMode: "deg", title: "sin(90°) — value of sine at 90 degrees" },
  { input: "45", angleMode: "deg", title: "cos(45°) — value of cosine at 45 degrees" },
  { input: "60", angleMode: "deg", title: "cos(60°) — value of cosine at 60 degrees" },
  { input: "0", angleMode: "deg", title: "cos(0°) — value of cosine at 0 degrees" },
  { input: "45", angleMode: "deg", title: "tan(45°) — value of tangent at 45 degrees" },
  { input: "1", angleMode: "rad", title: "sin(1 rad) — value of sine at 1 radian" },
  // Log presets
  { input: "100", title: "log(100) — base-10 logarithm of 100" },
  { input: "10", title: "log(10) — base-10 logarithm of 10" },
  { input: "1000", title: "log(1000) — base-10 logarithm of 1000" },
  { input: "1", title: "ln(1) — natural logarithm of 1" },
  { input: "2.71828", title: "ln(e) — natural logarithm of e" },
];

function scientificSlug(s: ScientificFill): string {
  if (s.title.startsWith("sin(") || s.title.startsWith("cos(") || s.title.startsWith("tan(")) {
    return s.title.split(" ")[0]!.toLowerCase().replace("(", "").replace(")", "");
  }
  if (s.title.startsWith("log(")) {
    return `log-${s.input}`;
  }
  if (s.title.startsWith("ln(")) {
    return `ln-${s.input.replace(".", "")}`;
  }
  return `scientific-${s.input}`;
}

function scientificDescription(s: ScientificFill): string {
  return `Compute ${s.title.split(" — ")[0]} with the free online scientific calculator. 100% in your browser.`;
}

function scientificFormula(s: ScientificFill): string {
  if (s.title.startsWith("sin(")) return `sin(${s.input}°) = 0.5 (exact)`;
  if (s.title.startsWith("cos(")) return `cos(${s.input}°) = 0.5 (exact)`;
  if (s.title.startsWith("tan(")) return `tan(${s.input}°) = 1 (exact)`;
  if (s.title.startsWith("log(")) return `log₁₀(${s.input}) = ${Math.log10(parseFloat(s.input)).toFixed(6)}`;
  if (s.title.startsWith("ln(")) return `ln(${s.input}) = ${Math.log(parseFloat(s.input)).toFixed(6)}`;
  return `f(${s.input})`;
}

function scientificFaq(s: ScientificFill): { question: string; answer: string }[] {
  if (s.title.startsWith("sin(") || s.title.startsWith("cos(") || s.title.startsWith("tan(")) {
    return [
      {
        question: `What is ${s.title.split(" ")[0]}?`,
        answer: `${s.title.split(" — ")[1] || "Trigonometric value."} The exact value depends on the angle: sin(30°) = 0.5, sin(45°) = √2/2 ≈ 0.7071, sin(60°) = √3/2 ≈ 0.8660, sin(90°) = 1. The calculator above computes it in any angle mode.`,
      },
    ];
  }
  if (s.title.startsWith("log(")) {
    return [
      {
        question: `What is log(${s.input})?`,
        answer: `log(${s.input}) is the base-10 logarithm of ${s.input}. log₁₀(${s.input}) = ${Math.log10(parseFloat(s.input)).toFixed(6)}. Use the calculator above to see the exact value.`,
      },
    ];
  }
  if (s.title.startsWith("ln(")) {
    return [
      {
        question: `What is ln(${s.input})?`,
        answer: `ln(${s.input}) is the natural logarithm (base e) of ${s.input}. ln(${s.input}) = ${Math.log(parseFloat(s.input)).toFixed(6)}. Use the calculator above to see the exact value.`,
      },
    ];
  }
  return [];
}

function scientificFills(): LandingPage[] {
  return SCIENTIFIC_FILLS.map((s) => ({
    canonicalSlug: TOOL_SCIENTIFIC,
    category: URL_CATEGORY_CALC,
    slug: scientificSlug(s),
    intent: "compute" as const,
    title: s.title,
    description: scientificDescription(s),
    prefill: {
      value: s.input,
      ...(s.angleMode ? { angleMode: s.angleMode } : {}),
    },
    content: {
      formula: scientificFormula(s),
    },
    faq: scientificFaq(s),
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Statistics: 5 pages — most-searched dataset presets
// ─────────────────────────────────────────────────────────────────────

interface StatisticsFill {
  numbers: string;
  title: string;
}

const STATISTICS_FILLS: StatisticsFill[] = [
  { numbers: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10", title: "Mean and standard deviation of 1-10" },
  { numbers: "10, 20, 30, 40, 50, 60, 70, 80, 90, 100", title: "Statistics of 10, 20, 30, ..., 100" },
  { numbers: "1, 1, 1, 1, 1, 1, 1, 1, 1, 1", title: "Mean and stddev of ten 1s (zero variance)" },
  { numbers: "5, 10, 15, 20, 25, 30, 35, 40, 45, 50", title: "Statistics of 5, 10, 15, ..., 50" },
  { numbers: "2, 4, 4, 4, 5, 5, 7, 9", title: "Mean, variance, and stddev of 2,4,4,4,5,5,7,9" },
];

function statisticsSlug(s: StatisticsFill): string {
  // Use a short hash of the numbers so the slug is unique and readable
  const sum = s.numbers
    .split(/[\s,;]+/)
    .filter(Boolean)
    .reduce((acc, n) => acc + parseFloat(n), 0);
  return `set-${Math.round(sum)}`;
}

function statisticsDescription(s: StatisticsFill): string {
  return `Compute mean, variance, and standard deviation for the dataset: ${s.numbers}. Free, instant, browser-based.`;
}

function statisticsFormula(s: StatisticsFill): string {
  const ns = s.numbers
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number);
  const n = ns.length;
  const mean = ns.reduce((a, b) => a + b, 0) / n;
  const variance = n > 1
    ? ns.reduce((a, x) => a + (x - mean) * (x - mean), 0) / (n - 1)
    : 0;
  return `mean = ${mean.toFixed(4)}, variance = ${variance.toFixed(4)}, stddev = ${Math.sqrt(variance).toFixed(4)}`;
}

function statisticsFills(): LandingPage[] {
  return STATISTICS_FILLS.map((s) => ({
    canonicalSlug: TOOL_STATISTICS,
    category: URL_CATEGORY_STATS,
    slug: statisticsSlug(s),
    intent: "compute" as const,
    title: s.title,
    description: statisticsDescription(s),
    prefill: { numbers: s.numbers },
    content: {
      formula: statisticsFormula(s),
    },
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Tip: 15 pages — most-searched "X% tip on $Y" combinations
// ─────────────────────────────────────────────────────────────────────

interface TipFill {
  bill: string;
  tipPct: string;
  title: string;
}

const TIP_FILLS: TipFill[] = [
  // 15% tip — restaurant standard
  { bill: "50", tipPct: "15", title: "15% tip on $50" },
  { bill: "100", tipPct: "15", title: "15% tip on $100" },
  { bill: "200", tipPct: "15", title: "15% tip on $200" },
  // 18% tip — US restaurant default
  { bill: "50", tipPct: "18", title: "18% tip on $50" },
  { bill: "100", tipPct: "18", title: "18% tip on $100" },
  { bill: "200", tipPct: "18", title: "18% tip on $200" },
  // 20% tip — generous
  { bill: "50", tipPct: "20", title: "20% tip on $50" },
  { bill: "100", tipPct: "20", title: "20% tip on $100" },
  { bill: "200", tipPct: "20", title: "20% tip on $200" },
  // 25% tip — exceptional service
  { bill: "100", tipPct: "25", title: "25% tip on $100" },
  // 10% tip — small services
  { bill: "30", tipPct: "10", title: "10% tip on $30" },
  // Large bills
  { bill: "500", tipPct: "18", title: "18% tip on $500" },
  { bill: "1000", tipPct: "18", title: "18% tip on $1,000" },
  // Odd amounts
  { bill: "47.50", tipPct: "18", title: "18% tip on $47.50" },
  { bill: "82.40", tipPct: "20", title: "20% tip on $82.40" },
];

function tipSlug(t: TipFill): string {
  return `${t.tipPct}-on-${t.bill.replace(".", "")}`;
}

function tipDescription(t: TipFill): string {
  return `Calculate a ${t.tipPct}% tip on $${parseFloat(t.bill).toLocaleString()}. See the tip amount, total with tip, and per-person split. Free, instant, browser-based.`;
}

function tipFormula(t: TipFill): string {
  const b = parseFloat(t.bill);
  const tip = b * (parseFloat(t.tipPct) / 100);
  return `Tip = $${b} × ${t.tipPct}/100 = $${tip.toFixed(2)}; Total = $${(b + tip).toFixed(2)}`;
}

function tipFaq(t: TipFill): { question: string; answer: string }[] {
  const b = parseFloat(t.bill);
  const tip = b * (parseFloat(t.tipPct) / 100);
  return [
    {
      question: `How much is a ${t.tipPct}% tip on $${b}?`,
      answer: `A ${t.tipPct}% tip on $${b.toLocaleString()} is $${tip.toFixed(2)}, for a total of $${(b + tip).toFixed(2)}.`,
    },
    {
      question: `Is ${t.tipPct}% a good tip?`,
      answer: `${t.tipPct}% is the standard restaurant tip in the US. For exceptional service, 20-25% is appreciated. For takeout and counter service, 10-15% is typical. Adjust based on service quality and local custom.`,
    },
  ];
}

function tipFills(): LandingPage[] {
  return TIP_FILLS.map((t) => ({
    canonicalSlug: TOOL_TIP,
    category: URL_CATEGORY_TIP,
    slug: tipSlug(t),
    intent: "compute" as const,
    title: t.title,
    description: tipDescription(t),
    prefill: { bill: t.bill, tipPct: t.tipPct, people: "1" },
    content: {
      formula: tipFormula(t),
    },
    faq: tipFaq(t),
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Discount: 15 pages — most-searched "X% off $Y" combinations
// ─────────────────────────────────────────────────────────────────────

interface DiscountFill {
  price: string;
  discounts: string;
  title: string;
}

const DISCOUNT_FILLS: DiscountFill[] = [
  // 20% off
  { price: "50", discounts: "20", title: "20% off $50" },
  { price: "100", discounts: "20", title: "20% off $100" },
  { price: "200", discounts: "20", title: "20% off $200" },
  // 25% off
  { price: "100", discounts: "25", title: "25% off $100" },
  { price: "200", discounts: "25", title: "25% off $200" },
  // 30% off
  { price: "100", discounts: "30", title: "30% off $100" },
  { price: "200", discounts: "30", title: "30% off $200" },
  // 50% off
  { price: "50", discounts: "50", title: "50% off $50" },
  { price: "100", discounts: "50", title: "50% off $100" },
  // Stacked discounts
  { price: "100", discounts: "20, 10", title: "20% + 10% off $100" },
  { price: "100", discounts: "30, 20", title: "30% + 20% off $100" },
  { price: "200", discounts: "30, 10, 5", title: "30% + 10% + 5% off $200" },
  // Common retail
  { price: "49.99", discounts: "20", title: "20% off $49.99" },
  { price: "29.99", discounts: "30", title: "30% off $29.99" },
  { price: "19.99", discounts: "50", title: "50% off $19.99" },
];

function discountSlug(d: DiscountFill): string {
  const total = d.discounts
    .split(",")
    .map((p) => parseFloat(p.trim()))
    .reduce((a, b) => a * (1 - b / 100), 1);
  const effective = Math.round((1 - total) * 100);
  return `${effective}-off-${d.price.replace(".", "")}`;
}

function discountDescription(d: DiscountFill): string {
  return `Apply ${d.discounts.replace(/,/g, " + ")}% off to $${parseFloat(d.price).toLocaleString()}. See the final price, total saved, and effective discount. Free, instant, browser-based.`;
}

function discountFormula(d: DiscountFill): string {
  const p = parseFloat(d.price);
  const ds = d.discounts.split(",").map((s) => parseFloat(s.trim()));
  const final = ds.reduce((a, x) => a * (1 - x / 100), p);
  return `final = $${p} × ${ds.map((x) => `(1 - ${x}/100)`).join(" × ")} = $${final.toFixed(2)}`;
}

function discountFaq(d: DiscountFill): { question: string; answer: string }[] {
  const p = parseFloat(d.price);
  const ds = d.discounts.split(",").map((s) => parseFloat(s.trim()));
  const final = ds.reduce((a, x) => a * (1 - x / 100), p);
  return [
    {
      question: `What is ${d.discounts.replace(/,/g, " + ")}% off $${p}?`,
      answer: `The final price is $${final.toFixed(2)}, a savings of $${(p - final).toFixed(2)}. Discounts are applied in sequence: a 20% + 10% stack on $100 is $72, not $70.`,
    },
    {
      question: `What is the effective discount of ${d.discounts.replace(/,/g, " + ")}%?`,
      answer: `Effective discount = (1 − ${ds.map((x) => (1 - x / 100).toFixed(2)).join(" × ")}) × 100 = ${(100 * (1 - final / p)).toFixed(2)}%. Use the calculator above to see the step-by-step breakdown.`,
    },
  ];
}

function discountFills(): LandingPage[] {
  return DISCOUNT_FILLS.map((d) => ({
    canonicalSlug: TOOL_DISCOUNT,
    category: URL_CATEGORY_DISCOUNT,
    slug: discountSlug(d),
    intent: "compute" as const,
    title: d.title,
    description: discountDescription(d),
    prefill: { price: d.price, discounts: d.discounts },
    content: {
      formula: discountFormula(d),
    },
    faq: discountFaq(d),
  }));
}

export function buildMathLandingPages(): LandingPage[] {
  return [
    ...scientificFills(),
    ...statisticsFills(),
    ...tipFills(),
    ...discountFills(),
  ];
}
