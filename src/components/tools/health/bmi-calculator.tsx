"use client";

import { useState, useCallback, useMemo } from "react";
import { usePrefillTool } from "@/lib/load-example";

type Unit = "metric" | "imperial";

interface BmiRange {
  label: string;
  shortLabel: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  description: string;
}

const BMI_RANGES: BmiRange[] = [
  {
    label: "Severe underweight",
    shortLabel: "Severe UW",
    min: 0,
    max: 16,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    description: "Severely underweight. Consult a healthcare professional.",
  },
  {
    label: "Moderate underweight",
    shortLabel: "Mod. UW",
    min: 16,
    max: 17,
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    description: "Moderately underweight. A balanced diet may help.",
  },
  {
    label: "Mild underweight",
    shortLabel: "Mild UW",
    min: 17,
    max: 18.5,
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    description: "Mildly underweight. Maintain a healthy, balanced diet.",
  },
  {
    label: "Normal (healthy) weight",
    shortLabel: "Normal",
    min: 18.5,
    max: 25,
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    description: "Healthy weight range for most adults. Keep up the good work.",
  },
  {
    label: "Overweight",
    shortLabel: "Overweight",
    min: 25,
    max: 30,
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    description: "Overweight. Regular exercise and a balanced diet can help.",
  },
  {
    label: "Obese class I (moderate)",
    shortLabel: "Obese I",
    min: 30,
    max: 35,
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    description: "Moderate obesity. Consider lifestyle changes; consult a clinician.",
  },
  {
    label: "Obese class II (severe)",
    shortLabel: "Obese II",
    min: 35,
    max: 40,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    description: "Severe obesity. Medical guidance is recommended.",
  },
  {
    label: "Obese class III (very severe)",
    shortLabel: "Obese III",
    min: 40,
    max: Infinity,
    color: "text-red-800 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    description: "Very severe obesity. Please consult a healthcare professional.",
  },
];

function rangeForBmi(bmi: number): BmiRange {
  for (const r of BMI_RANGES) {
    if (bmi >= r.min && bmi < r.max) return r;
  }
  return BMI_RANGES[BMI_RANGES.length - 1]!;
}

function idealWeightRange(heightCm: number): { min: number; max: number; unit: "kg" | "lb" } {
  // Healthy BMI range is 18.5-24.9
  const minKg = 18.5 * (heightCm / 100) ** 2;
  const maxKg = 24.9 * (heightCm / 100) ** 2;
  return { min: minKg, max: maxKg, unit: "kg" };
}

function bmiPrime(bmi: number): number {
  // BMI Prime: simple ratio of actual BMI to upper limit of normal BMI (25)
  return bmi / 25;
}

function bmiCategoryShort(bmi: number): string {
  const r = rangeForBmi(bmi);
  return r.label;
}

export function BMICalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [copied, setCopied] = useState(false);

  // Long-tail landing pages (PR 3 of the rapidtables-alternative plan:
  // PLAN.md) prefill the calculator with { unit, height, weight } so
  // e.g. /health/bmi-180cm-75kg shows the BMI computed for a
  // 180cm/75kg person immediately on load.
  usePrefillTool("bmi-calculator", (prefill) => {
    if (prefill.unit === "metric" || prefill.unit === "imperial") {
      setUnit(prefill.unit);
    }
    if (prefill.height) setHeight(prefill.height);
    if (prefill.weight) setWeight(prefill.weight);
  });

  // Coerce inputs to numbers in canonical metric units
  const { heightMeters, weightKg, error } = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      return { heightMeters: 0, weightKg: 0, error: null as string | null };
    }
    let m: number;
    let kg: number;
    if (unit === "metric") {
      // Heuristic: if height > 3, assume centimeters; otherwise meters
      m = h > 3 ? h / 100 : h;
      kg = w;
    } else {
      // Imperial: height in inches, weight in pounds
      m = h * 0.0254;
      kg = w * 0.453592;
    }
    if (m < 0.5 || m > 3.0) {
      return { heightMeters: 0, weightKg: 0, error: "Height is outside the realistic range (0.5-3.0 m)" };
    }
    if (kg < 20 || kg > 500) {
      return { heightMeters: 0, weightKg: 0, error: "Weight is outside the realistic range (20-500 kg)" };
    }
    return { heightMeters: m, weightKg: kg, error: null };
  }, [height, weight, unit]);

  const bmi = heightMeters > 0 ? weightKg / (heightMeters * heightMeters) : null;
  const range = bmi !== null ? rangeForBmi(bmi) : null;
  const ideal = heightMeters > 0 ? idealWeightRange(heightMeters * 100) : null;
  const prime = bmi !== null ? bmiPrime(bmi) : null;

  // BMI is displayed at 1 decimal place per WHO convention
  const bmiDisplay = bmi !== null ? bmi.toFixed(1) : "—";

  const copyResult = useCallback(async () => {
    if (bmi === null) return;
    const text = `BMI ${bmiDisplay} — ${bmiCategoryShort(bmi)} (${unit === "metric" ? `${height} cm, ${weight} kg` : `${height} in, ${weight} lb`})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [bmi, bmiDisplay, height, weight, unit]);

  const swap = useCallback(() => {
    if (unit === "metric") {
      // Convert metric to imperial
      const h = parseFloat(height);
      const w = parseFloat(weight);
      if (!isNaN(h) && !isNaN(w) && h > 0 && w > 0) {
        const m = h > 3 ? h / 100 : h;
        setHeight((m / 0.0254).toFixed(1));
        setWeight((w / 0.453592).toFixed(1));
      }
      setUnit("imperial");
    } else {
      // Convert imperial to metric
      const h = parseFloat(height);
      const w = parseFloat(weight);
      if (!isNaN(h) && !isNaN(w) && h > 0 && w > 0) {
        const m = h * 0.0254;
        const cm = m * 100;
        setHeight(cm > 3 ? cm.toFixed(1) : cm.toFixed(2));
        setWeight((w * 0.453592).toFixed(1));
      }
      setUnit("metric");
    }
  }, [unit, height, weight]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-surface-200 bg-white p-1 text-sm dark:border-dark-border dark:bg-dark-surface">
          <button
            type="button"
            onClick={() => setUnit("metric")}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              unit === "metric"
                ? "bg-brand-500 text-white"
                : "text-surface-700 hover:bg-surface-50 dark:text-dark-text dark:hover:bg-dark-bg"
            }`}
            aria-pressed={unit === "metric"}
          >
            Metric (cm/kg)
          </button>
          <button
            type="button"
            onClick={() => setUnit("imperial")}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              unit === "imperial"
                ? "bg-brand-500 text-white"
                : "text-surface-700 hover:bg-surface-50 dark:text-dark-text dark:hover:bg-dark-bg"
            }`}
            aria-pressed={unit === "imperial"}
          >
            Imperial (in/lb)
          </button>
        </div>
        <button
          type="button"
          onClick={swap}
          className="rounded-lg border border-surface-200 px-3 py-1.5 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
        >
          Swap units
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            Height ({unit === "metric" ? "cm" : "in"})
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={unit === "metric" ? "175" : "69"}
            step="any"
            min="0"
            data-testid="bmi-height"
            className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            Weight ({unit === "metric" ? "kg" : "lb"})
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === "metric" ? "70" : "154"}
            step="any"
            min="0"
            data-testid="bmi-weight"
            className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">
          Or paste &quot;height, weight&quot; (e.g. &quot;180, 75&quot;)
        </label>
        <input
          type="text"
          placeholder="180, 75"
          data-testid="bmi-quick-input"
          onChange={(e) => {
            // Parse "h, w" or "h w" or "h/w" formats
            const raw = e.target.value.trim();
            if (!raw) return;
            const parts = raw.split(/[,\s/]+/).filter(Boolean);
            if (parts.length === 2) {
              const [h, w] = parts;
              if (h && !isNaN(parseFloat(h))) setHeight(h);
              if (w && !isNaN(parseFloat(w))) setWeight(w);
            }
          }}
          className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 font-mono text-xs text-surface-600 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {bmi !== null && range && (
        <div
          data-testid="tool-output"
          onClick={copyResult}
          className={`cursor-pointer rounded-lg border p-4 ${range.bgColor} transition-shadow hover:shadow-md`}
        >
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-surface-500 dark:text-dark-muted">
              Your BMI
            </p>
            <p className="text-[10px] text-brand-500">{copied ? "Copied!" : "click to copy"}</p>
          </div>
          <p className="mt-1 text-4xl font-bold text-surface-900 dark:text-dark-text">
            {bmiDisplay}
          </p>
          <p className={`mt-1 text-sm font-medium ${range.color}`}>{range.label}</p>
          <p className="mt-2 text-xs text-surface-600 dark:text-dark-muted">
            {range.description}
          </p>
        </div>
      )}

      {!bmi && !error && (
        <p className="text-xs text-surface-500 dark:text-dark-muted text-center py-4">
          Enter your height and weight to calculate your BMI.
        </p>
      )}

      {bmi !== null && ideal && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-[10px] font-medium uppercase tracking-wider text-surface-500 dark:text-dark-muted">
              BMI Prime
            </p>
            <p className="mt-1 text-lg font-bold font-mono text-surface-900 dark:text-dark-text">
              {prime !== null ? prime.toFixed(2) : "—"}
            </p>
            <p className="text-[10px] text-surface-500 dark:text-dark-muted">
              Ratio of BMI to upper normal (25)
            </p>
          </div>
          <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-[10px] font-medium uppercase tracking-wider text-surface-500 dark:text-dark-muted">
              Healthy weight range
            </p>
            <p className="mt-1 text-lg font-bold font-mono text-surface-900 dark:text-dark-text">
              {ideal.min.toFixed(1)}–{ideal.max.toFixed(1)} kg
            </p>
            <p className="text-[10px] text-surface-500 dark:text-dark-muted">
              BMI 18.5–24.9 at your height
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-[10px] font-medium uppercase tracking-wider text-surface-500 dark:text-dark-muted mb-2">
          WHO BMI classification
        </p>
        <div className="grid grid-cols-2 gap-1 text-[11px] sm:grid-cols-4">
          {BMI_RANGES.filter((r) => r.max !== Infinity || r === BMI_RANGES[BMI_RANGES.length - 1]).map((r) => {
            const isActive = range?.label === r.label;
            return (
              <div
                key={r.label}
                className={`rounded border px-2 py-1 ${
                  isActive
                    ? "border-brand-500 bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "border-surface-200 text-surface-500 dark:border-dark-border dark:text-dark-muted"
                }`}
              >
                <span className="font-mono">{r.min}–{r.max === Infinity ? "+" : r.max}</span>
                <span className="ml-1">{r.shortLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
