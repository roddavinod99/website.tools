/**
 * Long-tail landing-page dataset for the BMI calculator (PR 3 of the
 * rapidtables-alternative plan: PLAN.md). Pre-fills the canonical
 * /tools/bmi-calculator with the most-searched height/weight pairs.
 *
 * The /health/bmi-<height>cm-<weight>kg URL pattern matches how
 * people actually search:
 *   - "bmi for 180cm 75kg"        → /health/bmi-180cm-75kg
 *   - "bmi 165cm 60kg"            → /health/bmi-165cm-60kg
 *   - "bmi 5'9 154 lb"            → /health/bmi-5ft9-154lb
 *
 * The dataset focuses on the most-searched combinations globally,
 * ordered by global search volume. We pick representative heights
 * (155, 160, 165, 170, 175, 180, 185, 190 cm) and common weights
 * (50-110 kg) to span the WHO classification spectrum.
 */

import type { LandingPage } from "./landing-pages";

const TOOL = "bmi-calculator";
const URL_CATEGORY = "health";

interface BmiPreFill {
  /** Height in cm for the URL slug and description */
  heightCm: number;
  /** Weight in kg for the URL slug and description */
  weightKg: number;
}

const PRE_FILLS: BmiPreFill[] = [
  // 170 cm (most-searched average male height)
  { heightCm: 170, weightKg: 50 },
  { heightCm: 170, weightKg: 55 },
  { heightCm: 170, weightKg: 60 },
  { heightCm: 170, weightKg: 65 },
  { heightCm: 170, weightKg: 70 },
  { heightCm: 170, weightKg: 75 },
  { heightCm: 170, weightKg: 80 },
  { heightCm: 170, weightKg: 85 },
  { heightCm: 170, weightKg: 90 },
  { heightCm: 170, weightKg: 95 },
  { heightCm: 170, weightKg: 100 },
  // 175 cm
  { heightCm: 175, weightKg: 60 },
  { heightCm: 175, weightKg: 65 },
  { heightCm: 175, weightKg: 70 },
  { heightCm: 175, weightKg: 75 },
  { heightCm: 175, weightKg: 80 },
  { heightCm: 175, weightKg: 85 },
  { heightCm: 175, weightKg: 90 },
  { heightCm: 175, weightKg: 95 },
  // 180 cm (most-searched tall-male height)
  { heightCm: 180, weightKg: 65 },
  { heightCm: 180, weightKg: 70 },
  { heightCm: 180, weightKg: 75 },
  { heightCm: 180, weightKg: 80 },
  { heightCm: 180, weightKg: 85 },
  { heightCm: 180, weightKg: 90 },
  { heightCm: 180, weightKg: 95 },
  { heightCm: 180, weightKg: 100 },
  // 165 cm (most-searched average female height)
  { heightCm: 165, weightKg: 50 },
  { heightCm: 165, weightKg: 55 },
  { heightCm: 165, weightKg: 60 },
  { heightCm: 165, weightKg: 65 },
  { heightCm: 165, weightKg: 70 },
  { heightCm: 165, weightKg: 75 },
  { heightCm: 165, weightKg: 80 },
  // 160 cm
  { heightCm: 160, weightKg: 45 },
  { heightCm: 160, weightKg: 50 },
  { heightCm: 160, weightKg: 55 },
  { heightCm: 160, weightKg: 60 },
  { heightCm: 160, weightKg: 65 },
  { heightCm: 160, weightKg: 70 },
  // 185 cm
  { heightCm: 185, weightKg: 70 },
  { heightCm: 185, weightKg: 80 },
  { heightCm: 185, weightKg: 90 },
  { heightCm: 185, weightKg: 100 },
  // 190 cm
  { heightCm: 190, weightKg: 80 },
  { heightCm: 190, weightKg: 90 },
  { heightCm: 190, weightKg: 100 },
  // 155 cm
  { heightCm: 155, weightKg: 45 },
  { heightCm: 155, weightKg: 50 },
  { heightCm: 155, weightKg: 55 },
  { heightCm: 155, weightKg: 60 },
];

function slugify(p: BmiPreFill): string {
  return `bmi-${p.heightCm}cm-${p.weightKg}kg`;
}

function titleFor(p: BmiPreFill): string {
  return `BMI for ${p.heightCm} cm and ${p.weightKg} kg`;
}

function descFor(p: BmiPreFill): string {
  return `Calculate the BMI for a person who is ${p.heightCm} cm tall and weighs ${p.weightKg} kg. Free, instant, browser-based, 100% client-side.`;
}

function formulaFor(p: BmiPreFill): string {
  const bmi = (p.weightKg / Math.pow(p.heightCm / 100, 2)).toFixed(1);
  return `BMI = ${p.weightKg} ÷ (${p.heightCm}/100)² = ${bmi} kg/m²`;
}

function categoryFor(p: BmiPreFill): string {
  const bmi = p.weightKg / Math.pow(p.heightCm / 100, 2);
  if (bmi < 16) return "Severe underweight";
  if (bmi < 17) return "Moderate underweight";
  if (bmi < 18.5) return "Mild underweight";
  if (bmi < 25) return "Normal (healthy) weight";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obese class I (moderate)";
  if (bmi < 40) return "Obese class II (severe)";
  return "Obese class III (very severe)";
}

function seeAlsoFor(p: BmiPreFill, knownSlugs: Set<string>): string[] {
  // Surface 4 sibling BMI pages: same height, two adjacent weights above
  // and below. This gives a useful "what if I weighed 5kg more/less?" net.
  // Skip refs that don't exist in the registry to keep the engine's
  // invariant that every see-also target resolves to a real page.
  const out: string[] = [];
  const weightOffsets = [-10, -5, 5, 10];
  for (const off of weightOffsets) {
    const w = p.weightKg + off;
    const ref = `${URL_CATEGORY}/bmi-${p.heightCm}cm-${w}kg`;
    if (w > 30 && w < 200 && knownSlugs.has(ref) && !out.includes(ref)) {
      out.push(ref);
      if (out.length === 4) return out;
    }
  }
  // Pad with other heights at the same weight
  const heightOffsets = [-10, -5, 5, 10];
  for (const off of heightOffsets) {
    const h = p.heightCm + off;
    const ref = `${URL_CATEGORY}/bmi-${h}cm-${p.weightKg}kg`;
    if (h > 130 && h < 220 && knownSlugs.has(ref) && !out.includes(ref)) {
      out.push(ref);
      if (out.length === 4) return out;
    }
  }
  return out;
}

function faqFor(p: BmiPreFill): { question: string; answer: string }[] {
  const bmi = (p.weightKg / Math.pow(p.heightCm / 100, 2)).toFixed(1);
  return [
    {
      question: `What is the BMI for ${p.heightCm} cm and ${p.weightKg} kg?`,
      answer: `A person who is ${p.heightCm} cm tall and weighs ${p.weightKg} kg has a Body Mass Index of ${bmi} kg/m², which is classified as "${categoryFor(p)}" on the WHO standard scale.`,
    },
    {
      question: `Is a BMI of ${bmi} healthy?`,
      answer: `The WHO classifies adult BMIs as: underweight (<18.5), normal (18.5-24.9), overweight (25-29.9), obese class I (30-34.9), obese class II (35-39.9), and obese class III (≥40). A BMI of ${bmi} for an adult is in the "${categoryFor(p)}" range.`,
    },
    {
      question: `What is the healthy weight range for ${p.heightCm} cm?`,
      answer: `For a ${p.heightCm} cm tall adult, the healthy BMI range (18.5-24.9) corresponds to approximately ${(18.5 * Math.pow(p.heightCm / 100, 2)).toFixed(1)} kg to ${(24.9 * Math.pow(p.heightCm / 100, 2)).toFixed(1)} kg.`,
    },
  ];
}

export function buildBmiLandingPages(): LandingPage[] {
  // Pre-compute the set of slugs we emit so see-also refs only point to
  // pages we actually own (the engine's invariant for indexable URLs).
  const knownSlugs = new Set(PRE_FILLS.map((p) => slugify(p)));
  return PRE_FILLS.map((p) => ({
    canonicalSlug: TOOL,
    category: URL_CATEGORY,
    slug: slugify(p),
    intent: "compute" as const,
    title: titleFor(p),
    description: descFor(p),
    prefill: { unit: "metric", height: String(p.heightCm), weight: String(p.weightKg) },
    content: {
      formula: formulaFor(p),
      seeAlso: seeAlsoFor(p, knownSlugs),
    },
    faq: faqFor(p),
  }));
}
