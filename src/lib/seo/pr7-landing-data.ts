/**
 * Long-tail landing-page dataset for PR 7 of the rapidtables-
 * alternative plan (PLAN.md): inflation, VAT, wire-gauge, and
 * voltage-drop landing pages.
 *
 * Total: ~150 URLs across 4 tools.
 */

import type { LandingPage } from "./landing-pages";

const URL_CATEGORY_INFLATION = "inflation";
const URL_CATEGORY_VAT = "vat";
const URL_CATEGORY_WIRE = "wire";
const URL_CATEGORY_VOLTAGE = "wire/voltage-drop";

const TOOL_INFLATION = "inflation";
const TOOL_VAT = "vat-gst";
const TOOL_WIRE = "wire-gauge-calculator";
const TOOL_VOLTAGE = "voltage-drop-calculator";

// ─────────────────────────────────────────────────────────────────────
// Inflation: 30 pages. The most-searched pattern is "X dollars in
// Y years" — how much will today's money be worth?
// ─────────────────────────────────────────────────────────────────────

interface InflationFill {
  amount: string;
  rate: string;
  years: string;
  title: string;
}

const INFLATION_FILLS: InflationFill[] = [
  // $1 in 10 years at common inflation rates
  { amount: "100", rate: "3", years: "10", title: "Inflation: $100 in 10 years at 3%" },
  { amount: "100", rate: "3", years: "20", title: "Inflation: $100 in 20 years at 3%" },
  { amount: "100", rate: "3", years: "30", title: "Inflation: $100 in 30 years at 3%" },
  { amount: "100", rate: "5", years: "10", title: "Inflation: $100 in 10 years at 5%" },
  { amount: "100", rate: "7", years: "10", title: "Inflation: $100 in 10 years at 7%" },
  { amount: "100", rate: "10", years: "10", title: "Inflation: $100 in 10 years at 10%" },
  // Common amounts at 3% (US long-term average)
  { amount: "1000", rate: "3", years: "10", title: "Inflation: $1,000 in 10 years at 3%" },
  { amount: "1000", rate: "3", years: "20", title: "Inflation: $1,000 in 20 years at 3%" },
  { amount: "1000", rate: "3", years: "30", title: "Inflation: $1,000 in 30 years at 3%" },
  { amount: "10000", rate: "3", years: "10", title: "Inflation: $10,000 in 10 years at 3%" },
  { amount: "10000", rate: "3", years: "20", title: "Inflation: $10,000 in 20 years at 3%" },
  { amount: "10000", rate: "3", years: "30", title: "Inflation: $10,000 in 30 years at 3%" },
  { amount: "100000", rate: "3", years: "30", title: "Inflation: $100,000 in 30 years at 3%" },
  { amount: "1000000", rate: "3", years: "30", title: "Inflation: $1,000,000 in 30 years at 3%" },
  // 5% (high-inflation scenarios)
  { amount: "1000", rate: "5", years: "10", title: "Inflation: $1,000 in 10 years at 5%" },
  { amount: "1000", rate: "5", years: "20", title: "Inflation: $1,000 in 20 years at 5%" },
  { amount: "10000", rate: "5", years: "10", title: "Inflation: $10,000 in 10 years at 5%" },
  { amount: "100000", rate: "5", years: "30", title: "Inflation: $100,000 in 30 years at 5%" },
  // 7% (high-inflation / emerging markets)
  { amount: "1000", rate: "7", years: "10", title: "Inflation: $1,000 in 10 years at 7%" },
  { amount: "1000", rate: "7", years: "20", title: "Inflation: $1,000 in 20 years at 7%" },
  { amount: "10000", rate: "7", years: "30", title: "Inflation: $10,000 in 30 years at 7%" },
  // 2% (Fed target)
  { amount: "1000", rate: "2", years: "10", title: "Inflation: $1,000 in 10 years at 2%" },
  { amount: "1000", rate: "2", years: "30", title: "Inflation: $1,000 in 30 years at 2%" },
  // Salary-style
  { amount: "50000", rate: "3", years: "10", title: "Inflation: $50,000 in 10 years at 3%" },
  { amount: "50000", rate: "3", years: "20", title: "Inflation: $50,000 in 20 years at 3%" },
  { amount: "100000", rate: "3", years: "10", title: "Inflation: $100,000 in 10 years at 3%" },
  { amount: "100000", rate: "3", years: "20", title: "Inflation: $100,000 in 20 years at 3%" },
  // 50-year horizon (retirement planning)
  { amount: "100000", rate: "3", years: "50", title: "Inflation: $100,000 in 50 years at 3%" },
  { amount: "1000000", rate: "3", years: "50", title: "Inflation: $1,000,000 in 50 years at 3%" },
];

function inflationSlug(i: InflationFill): string {
  return `${i.amount}-in-${i.years}y-at-${i.rate}pct`;
}

function inflationDescription(i: InflationFill): string {
  return `Future cost of $${Number(i.amount).toLocaleString()} in ${i.years} years at ${i.rate}% inflation. See purchasing power and total cost. Free, browser-based.`;
}

function inflationFormula(i: InflationFill): string {
  const a = Number(i.amount);
  const r = Number(i.rate) / 100;
  const y = Number(i.years);
  const future = a * Math.pow(1 + r, y);
  return `Future value = $${a.toLocaleString()} × (1 + ${i.rate}/100)^${y} = $${future.toFixed(2)}`;
}

function inflationFills(): LandingPage[] {
  return INFLATION_FILLS.map((i) => ({
    canonicalSlug: TOOL_INFLATION,
    category: URL_CATEGORY_INFLATION,
    slug: inflationSlug(i),
    intent: "compute" as const,
    title: inflationTitle(i),
    description: inflationDescription(i),
    prefill: { amount: i.amount, rate: i.rate, years: i.years },
    content: {
      formula: inflationFormula(i),
    },
  }));
}

function inflationTitle(i: InflationFill): string {
  return `$${Number(i.amount).toLocaleString()} in ${i.years} years at ${i.rate}% inflation`;
}

// ─────────────────────────────────────────────────────────────────────
// VAT/GST: 40 pages. The most-searched pattern is "X% VAT on $Y"
// in a specific country. We cover the 10 most-searched countries.
// ─────────────────────────────────────────────────────────────────────

interface VatFill {
  country: string;
  rate: string;
  amount: string;
  title: string;
}

const VAT_FILLS: VatFill[] = [
  // UK 20% — most-searched
  { country: "GB", rate: "20", amount: "100", title: "UK VAT 20% on £100" },
  { country: "GB", rate: "20", amount: "50", title: "UK VAT 20% on £50" },
  { country: "GB", rate: "20", amount: "500", title: "UK VAT 20% on £500" },
  { country: "GB", rate: "20", amount: "1000", title: "UK VAT 20% on £1,000" },
  // Germany 19%
  { country: "DE", rate: "19", amount: "100", title: "German VAT 19% on €100" },
  { country: "DE", rate: "19", amount: "50", title: "German VAT 19% on €50" },
  { country: "DE", rate: "19", amount: "500", title: "German VAT 19% on €500" },
  { country: "DE", rate: "19", amount: "1000", title: "German VAT 19% on €1,000" },
  // France 20%
  { country: "FR", rate: "20", amount: "100", title: "French VAT 20% on €100" },
  { country: "FR", rate: "20", amount: "500", title: "French VAT 20% on €500" },
  { country: "FR", rate: "20", amount: "1000", title: "French VAT 20% on €1,000" },
  // Italy 22%
  { country: "IT", rate: "22", amount: "100", title: "Italian VAT 22% on €100" },
  { country: "IT", rate: "22", amount: "500", title: "Italian VAT 22% on €500" },
  { country: "IT", rate: "22", amount: "1000", title: "Italian VAT 22% on €1,000" },
  // Spain 21%
  { country: "ES", rate: "21", amount: "100", title: "Spanish VAT 21% on €100" },
  { country: "ES", rate: "21", amount: "500", title: "Spanish VAT 21% on €500" },
  { country: "ES", rate: "21", amount: "1000", title: "Spanish VAT 21% on €1,000" },
  // Netherlands 21%
  { country: "NL", rate: "21", amount: "100", title: "Dutch VAT 21% on €100" },
  { country: "NL", rate: "21", amount: "500", title: "Dutch VAT 21% on €500" },
  { country: "NL", rate: "21", amount: "1000", title: "Dutch VAT 21% on €1,000" },
  // India GST 18%
  { country: "IN", rate: "18", amount: "100", title: "India GST 18% on ₹100" },
  { country: "IN", rate: "18", amount: "1000", title: "India GST 18% on ₹1,000" },
  { country: "IN", rate: "18", amount: "10000", title: "India GST 18% on ₹10,000" },
  { country: "IN", rate: "28", amount: "100", title: "India GST 28% on ₹100" },
  { country: "IN", rate: "28", amount: "1000", title: "India GST 28% on ₹1,000" },
  // Australia GST 10%
  { country: "AU", rate: "10", amount: "100", title: "Australian GST 10% on A$100" },
  { country: "AU", rate: "10", amount: "500", title: "Australian GST 10% on A$500" },
  { country: "AU", rate: "10", amount: "1000", title: "Australian GST 10% on A$1,000" },
  // Canada GST 5% (federal) + HST
  { country: "CA", rate: "5", amount: "100", title: "Canada GST 5% on C$100" },
  { country: "CA", rate: "5", amount: "500", title: "Canada GST 5% on C$500" },
  { country: "CA", rate: "5", amount: "1000", title: "Canada GST 5% on C$1,000" },
  { country: "CA", rate: "13", amount: "100", title: "Canada HST 13% on C$100" },
  { country: "CA", rate: "13", amount: "500", title: "Canada HST 13% on C$500" },
  { country: "CA", rate: "15", amount: "100", title: "Canada HST 15% on C$100" },
  { country: "CA", rate: "15", amount: "500", title: "Canada HST 15% on C$500" },
  // Japan 10%
  { country: "JP", rate: "10", amount: "100", title: "Japan consumption tax 10% on ¥100" },
  { country: "JP", rate: "10", amount: "1000", title: "Japan consumption tax 10% on ¥1,000" },
  { country: "JP", rate: "10", amount: "10000", title: "Japan consumption tax 10% on ¥10,000" },
  // New Zealand 15%
  { country: "NZ", rate: "15", amount: "100", title: "New Zealand GST 15% on NZ$100" },
  { country: "NZ", rate: "15", amount: "500", title: "New Zealand GST 15% on NZ$500" },
];

function vatSlug(v: VatFill): string {
  return `${v.country.toLowerCase()}-${v.rate}-on-${v.amount}`;
}

function vatDescription(v: VatFill): string {
  return `Calculate the ${v.rate}% ${v.country} tax on ${v.amount}. See the tax amount, total with tax, and the reverse (tax-exclusive from tax-inclusive). Free, instant, browser-based.`;
}

function vatFills(): LandingPage[] {
  return VAT_FILLS.map((v) => ({
    canonicalSlug: TOOL_VAT,
    category: URL_CATEGORY_VAT,
    slug: vatSlug(v),
    intent: "compute" as const,
    title: v.title,
    description: vatDescription(v),
    prefill: { country: v.country, rate: v.rate, amount: v.amount },
    content: {
      formula: `Tax = ${v.amount} × ${v.rate}/100`,
    },
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Wire gauge: 30 pages covering the most-searched AWG conversions
// and diameter/mm² queries.
// ─────────────────────────────────────────────────────────────────────

interface WireFill {
  mode: "awg-to-mm2" | "mm2-to-awg" | "awg-to-diameter";
  awg?: string;
  area?: string;
  title: string;
}

const WIRE_FILLS: WireFill[] = [
  // AWG → mm² (most common: AWG 8, 10, 12, 14, 16)
  { mode: "awg-to-mm2", awg: "8", title: "AWG 8 to mm²" },
  { mode: "awg-to-mm2", awg: "10", title: "AWG 10 to mm²" },
  { mode: "awg-to-mm2", awg: "12", title: "AWG 12 to mm²" },
  { mode: "awg-to-mm2", awg: "14", title: "AWG 14 to mm²" },
  { mode: "awg-to-mm2", awg: "16", title: "AWG 16 to mm²" },
  { mode: "awg-to-mm2", awg: "18", title: "AWG 18 to mm²" },
  { mode: "awg-to-mm2", awg: "20", title: "AWG 20 to mm²" },
  { mode: "awg-to-mm2", awg: "22", title: "AWG 22 to mm²" },
  { mode: "awg-to-mm2", awg: "24", title: "AWG 24 to mm²" },
  { mode: "awg-to-mm2", awg: "26", title: "AWG 26 to mm²" },
  { mode: "awg-to-mm2", awg: "0000 (4/0)", title: "AWG 4/0 to mm²" },
  { mode: "awg-to-mm2", awg: "0 (1/0)", title: "AWG 1/0 to mm²" },
  // mm² → AWG (most-searched metric sizes)
  { mode: "mm2-to-awg", area: "1.5", title: "1.5 mm² to AWG" },
  { mode: "mm2-to-awg", area: "2.5", title: "2.5 mm² to AWG" },
  { mode: "mm2-to-awg", area: "4", title: "4 mm² to AWG" },
  { mode: "mm2-to-awg", area: "6", title: "6 mm² to AWG" },
  { mode: "mm2-to-awg", area: "10", title: "10 mm² to AWG" },
  { mode: "mm2-to-awg", area: "16", title: "16 mm² to AWG" },
  { mode: "mm2-to-awg", area: "25", title: "25 mm² to AWG" },
  { mode: "mm2-to-awg", area: "35", title: "35 mm² to AWG" },
  { mode: "mm2-to-awg", area: "50", title: "50 mm² to AWG" },
  { mode: "mm2-to-awg", area: "70", title: "70 mm² to AWG" },
  { mode: "mm2-to-awg", area: "95", title: "95 mm² to AWG" },
  { mode: "mm2-to-awg", area: "120", title: "120 mm² to AWG" },
  // AWG → diameter
  { mode: "awg-to-diameter", awg: "12", title: "AWG 12 diameter in mm" },
  { mode: "awg-to-diameter", awg: "10", title: "AWG 10 diameter in mm" },
  { mode: "awg-to-diameter", awg: "8", title: "AWG 8 diameter in mm" },
  { mode: "awg-to-diameter", awg: "14", title: "AWG 14 diameter in mm" },
  { mode: "awg-to-diameter", awg: "16", title: "AWG 16 diameter in mm" },
];

function wireSlug(w: WireFill): string {
  if (w.mode === "mm2-to-awg" && w.area) {
    // mm² values may collide after stripping the decimal (2.5 → 25 same as 25).
    // Replace the decimal with a 'p' to keep uniqueness.
    const slugified = w.area.replace(".", "p");
    return `mm2-${slugified}-to-awg`;
  }
  if (w.mode === "awg-to-mm2" && w.awg) return `awg-${w.awg.replace(" ", "-")}-to-mm2`;
  if (w.mode === "awg-to-diameter" && w.awg) return `awg-${w.awg.replace(" ", "-")}-diameter`;
  return `wire-${w.awg ?? w.area ?? "unknown"}`;
}

function wireDescription(w: WireFill): string {
  return `Convert ${w.title.replace(/ to .*/, "")} using the free online wire gauge calculator. Get the cross-section in mm², diameter, and copper resistance. 100% in your browser.`;
}

function wireFills(): LandingPage[] {
  return WIRE_FILLS.map((w) => ({
    canonicalSlug: TOOL_WIRE,
    category: URL_CATEGORY_WIRE,
    slug: wireSlug(w),
    intent: "compute" as const,
    title: w.title,
    description: wireDescription(w),
    prefill: {
      mode: w.mode,
      ...(w.awg ? { awg: w.awg } : {}),
      ...(w.area ? { area: w.area } : {}),
    },
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Voltage drop: 50 pages. The most-searched pattern is
// "<system> <current>A <length>ft <gauge>AWG" — we cover the
// top combinations.
// ─────────────────────────────────────────────────────────────────────

interface VoltageFill {
  system: "12V" | "24V" | "120V-single" | "240V-single" | "120-240V-3phase";
  current: string;
  length: string;
  gauge: string;
  title: string;
}

const VOLTAGE_FILLS: VoltageFill[] = [
  // 12V / 24V common: solar / battery / RV
  { system: "12V", current: "10", length: "10", gauge: "10", title: "12V 10A 10ft AWG 10 voltage drop" },
  { system: "12V", current: "10", length: "20", gauge: "10", title: "12V 10A 20ft AWG 10 voltage drop" },
  { system: "12V", current: "15", length: "10", gauge: "12", title: "12V 15A 10ft AWG 12 voltage drop" },
  { system: "12V", current: "15", length: "20", gauge: "12", title: "12V 15A 20ft AWG 12 voltage drop" },
  { system: "12V", current: "15", length: "30", gauge: "10", title: "12V 15A 30ft AWG 10 voltage drop" },
  { system: "12V", current: "20", length: "10", gauge: "10", title: "12V 20A 10ft AWG 10 voltage drop" },
  { system: "12V", current: "20", length: "20", gauge: "8", title: "12V 20A 20ft AWG 8 voltage drop" },
  { system: "12V", current: "30", length: "10", gauge: "8", title: "12V 30A 10ft AWG 8 voltage drop" },
  { system: "12V", current: "30", length: "20", gauge: "6", title: "12V 30A 20ft AWG 6 voltage drop" },
  { system: "12V", current: "50", length: "10", gauge: "6", title: "12V 50A 10ft AWG 6 voltage drop" },
  { system: "12V", current: "50", length: "20", gauge: "4", title: "12V 50A 20ft AWG 4 voltage drop" },
  { system: "12V", current: "100", length: "10", gauge: "2", title: "12V 100A 10ft AWG 2 voltage drop" },
  // 24V
  { system: "24V", current: "10", length: "20", gauge: "12", title: "24V 10A 20ft AWG 12 voltage drop" },
  { system: "24V", current: "15", length: "20", gauge: "12", title: "24V 15A 20ft AWG 12 voltage drop" },
  { system: "24V", current: "20", length: "20", gauge: "10", title: "24V 20A 20ft AWG 10 voltage drop" },
  { system: "24V", current: "30", length: "20", gauge: "8", title: "24V 30A 20ft AWG 8 voltage drop" },
  { system: "24V", current: "50", length: "20", gauge: "6", title: "24V 50A 20ft AWG 6 voltage drop" },
  { system: "24V", current: "100", length: "20", gauge: "4", title: "24V 100A 20ft AWG 4 voltage drop" },
  // 120V single phase
  { system: "120V-single", current: "15", length: "50", gauge: "14", title: "120V 15A 50ft AWG 14 voltage drop" },
  { system: "120V-single", current: "15", length: "100", gauge: "14", title: "120V 15A 100ft AWG 14 voltage drop" },
  { system: "120V-single", current: "15", length: "100", gauge: "12", title: "120V 15A 100ft AWG 12 voltage drop" },
  { system: "120V-single", current: "15", length: "200", gauge: "10", title: "120V 15A 200ft AWG 10 voltage drop" },
  { system: "120V-single", current: "20", length: "50", gauge: "12", title: "120V 20A 50ft AWG 12 voltage drop" },
  { system: "120V-single", current: "20", length: "100", gauge: "10", title: "120V 20A 100ft AWG 10 voltage drop" },
  { system: "120V-single", current: "20", length: "200", gauge: "8", title: "120V 20A 200ft AWG 8 voltage drop" },
  { system: "120V-single", current: "30", length: "100", gauge: "8", title: "120V 30A 100ft AWG 8 voltage drop" },
  { system: "120V-single", current: "30", length: "200", gauge: "6", title: "120V 30A 200ft AWG 6 voltage drop" },
  // 240V single phase
  { system: "240V-single", current: "15", length: "100", gauge: "14", title: "240V 15A 100ft AWG 14 voltage drop" },
  { system: "240V-single", current: "20", length: "100", gauge: "12", title: "240V 20A 100ft AWG 12 voltage drop" },
  { system: "240V-single", current: "30", length: "100", gauge: "10", title: "240V 30A 100ft AWG 10 voltage drop" },
  { system: "240V-single", current: "30", length: "200", gauge: "8", title: "240V 30A 200ft AWG 8 voltage drop" },
  { system: "240V-single", current: "50", length: "100", gauge: "8", title: "240V 50A 100ft AWG 8 voltage drop" },
  { system: "240V-single", current: "50", length: "200", gauge: "6", title: "240V 50A 200ft AWG 6 voltage drop" },
  // 240V three phase
  { system: "120-240V-3phase", current: "30", length: "100", gauge: "10", title: "240V 3-phase 30A 100ft AWG 10 voltage drop" },
  { system: "120-240V-3phase", current: "30", length: "200", gauge: "8", title: "240V 3-phase 30A 200ft AWG 8 voltage drop" },
  { system: "120-240V-3phase", current: "50", length: "100", gauge: "8", title: "240V 3-phase 50A 100ft AWG 8 voltage drop" },
  { system: "120-240V-3phase", current: "50", length: "200", gauge: "6", title: "240V 3-phase 50A 200ft AWG 6 voltage drop" },
  { system: "120-240V-3phase", current: "100", length: "100", gauge: "4", title: "240V 3-phase 100A 100ft AWG 4 voltage drop" },
  { system: "120-240V-3phase", current: "100", length: "200", gauge: "2", title: "240V 3-phase 100A 200ft AWG 2 voltage drop" },
  { system: "120-240V-3phase", current: "200", length: "100", gauge: "2", title: "240V 3-phase 200A 100ft AWG 2 voltage drop" },
  { system: "120-240V-3phase", current: "200", length: "200", gauge: "0 (1/0)", title: "240V 3-phase 200A 200ft AWG 1/0 voltage drop" },
  // Long-run 120V
  { system: "120V-single", current: "10", length: "200", gauge: "12", title: "120V 10A 200ft AWG 12 voltage drop" },
  { system: "120V-single", current: "10", length: "300", gauge: "10", title: "120V 10A 300ft AWG 10 voltage drop" },
  { system: "120V-single", current: "15", length: "150", gauge: "12", title: "120V 15A 150ft AWG 12 voltage drop" },
];

function voltageSlug(v: VoltageFill): string {
  return `${v.system}-${v.current}a-${v.length}ft-awg-${v.gauge.replace(" ", "-")}`.toLowerCase();
}

function voltageDescription(v: VoltageFill): string {
  return `Compute the voltage drop for a ${v.system} ${v.current}A load over ${v.length}ft of AWG ${v.gauge} copper wire. Free, instant, browser-based.`;
}

function voltageFills(): LandingPage[] {
  return VOLTAGE_FILLS.map((v) => ({
    canonicalSlug: TOOL_VOLTAGE,
    category: URL_CATEGORY_VOLTAGE,
    slug: voltageSlug(v),
    intent: "compute" as const,
    title: v.title,
    description: voltageDescription(v),
    prefill: {
      system: v.system,
      current: v.current,
      length: v.length,
      gauge: v.gauge,
      material: "copper",
    },
  }));
}

export function buildPr7LandingPages(): LandingPage[] {
  return [
    ...inflationFills(),
    ...vatFills(),
    ...wireFills(),
    ...voltageFills(),
  ];
}
