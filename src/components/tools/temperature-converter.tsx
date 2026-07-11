"use client";

import { useState, useCallback } from "react";

function celsiusToFahrenheit(c: number): number { return c * 9 / 5 + 32; }
function celsiusToKelvin(c: number): number { return c + 273.15; }
function celsiusToRankine(c: number): number { return (c + 273.15) * 9 / 5; }
function celsiusToDelisle(c: number): number { return (100 - c) * 3 / 2; }
function celsiusToNewton(c: number): number { return c * 33 / 100; }
function celsiusToReaumur(c: number): number { return c * 4 / 5; }
function celsiusToRomer(c: number): number { return c * 21 / 40 + 7.5; }

function fahrenheitToCelsius(f: number): number { return (f - 32) * 5 / 9; }
function kelvinToCelsius(k: number): number { return k - 273.15; }
function rankineToCelsius(r: number): number { return (r - 491.67) * 5 / 9; }
function delisleToCelsius(d: number): number { return 100 - d * 2 / 3; }
function newtonToCelsius(n: number): number { return n * 100 / 33; }
function reaumurToCelsius(r: number): number { return r * 5 / 4; }
function romerToCelsius(r: number): number { return (r - 7.5) * 40 / 21; }

type TempUnit = "c" | "f" | "k" | "r" | "d" | "n" | "re" | "ro";
const ALL_UNITS: { unit: TempUnit; label: string; symbol: string }[] = [
  { unit: "c", label: "Celsius", symbol: "°C" },
  { unit: "f", label: "Fahrenheit", symbol: "°F" },
  { unit: "k", label: "Kelvin", symbol: "K" },
  { unit: "r", label: "Rankine", symbol: "°R" },
  { unit: "d", label: "Delisle", symbol: "°De" },
  { unit: "n", label: "Newton", symbol: "°N" },
  { unit: "re", label: "Réaumur", symbol: "°Ré" },
  { unit: "ro", label: "Rømer", symbol: "°Rø" },
];

function toCelsius(unit: TempUnit, value: number): number {
  switch (unit) {
    case "c": return value;
    case "f": return fahrenheitToCelsius(value);
    case "k": return kelvinToCelsius(value);
    case "r": return rankineToCelsius(value);
    case "d": return delisleToCelsius(value);
    case "n": return newtonToCelsius(value);
    case "re": return reaumurToCelsius(value);
    case "ro": return romerToCelsius(value);
  }
}

function fromCelsius(unit: TempUnit, celsius: number): number {
  switch (unit) {
    case "c": return celsius;
    case "f": return celsiusToFahrenheit(celsius);
    case "k": return celsiusToKelvin(celsius);
    case "r": return celsiusToRankine(celsius);
    case "d": return celsiusToDelisle(celsius);
    case "n": return celsiusToNewton(celsius);
    case "re": return celsiusToReaumur(celsius);
    case "ro": return celsiusToRomer(celsius);
  }
}

function getTemperatureDescription(celsius: number): { label: string; color: string } {
  if (celsius <= -30) return { label: "Extreme Cold", color: "text-blue-700 dark:text-blue-300" };
  if (celsius <= 0) return { label: "Freezing", color: "text-blue-600 dark:text-blue-400" };
  if (celsius <= 10) return { label: "Cold", color: "text-cyan-600 dark:text-cyan-400" };
  if (celsius <= 20) return { label: "Cool", color: "text-teal-600 dark:text-teal-400" };
  if (celsius <= 25) return { label: "Comfortable", color: "text-green-600 dark:text-green-400" };
  if (celsius <= 30) return { label: "Warm", color: "text-yellow-600 dark:text-yellow-400" };
  if (celsius <= 35) return { label: "Hot", color: "text-orange-600 dark:text-orange-400" };
  if (celsius <= 40) return { label: "Very Hot", color: "text-red-600 dark:text-red-400" };
  return { label: "Extreme Heat", color: "text-red-700 dark:text-red-300" };
}

const PRESETS: { label: string; celsius: number }[] = [
  { label: "Absolute Zero", celsius: -273.15 },
  { label: "Water Freezes", celsius: 0 },
  { label: "Room Temp", celsius: 20 },
  { label: "Body Temp", celsius: 37 },
  { label: "Water Boils", celsius: 100 },
];

export function TemperatureConverter() {
  const [activeUnit, setActiveUnit] = useState<TempUnit>("c");
  const [values, setValues] = useState<Record<TempUnit, string>>({
    c: "20", f: "68", k: "293.15", r: "527.67", d: "120", n: "6.6", re: "16", ro: "18",
  });
  const [copiedUnit, setCopiedUnit] = useState("");

  const updateFrom = useCallback((unit: TempUnit, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      const empty: Record<TempUnit, string> = { c: "", f: "", k: "", r: "", d: "", n: "", re: "", ro: "" };
      setValues(empty);
      return;
    }
    const celsius = toCelsius(unit, num);
    const newValues: Record<TempUnit, string> = { c: "", f: "", k: "", r: "", d: "", n: "", re: "", ro: "" };
    for (const u of ALL_UNITS) {
      newValues[u.unit] = u.unit === unit ? value : fromCelsius(u.unit, celsius).toFixed(4).replace(/\.?0+$/, "");
    }
    setValues(newValues);
  }, []);

  const handleInput = (unit: TempUnit, value: string) => {
    setActiveUnit(unit);
    updateFrom(unit, value);
  };

  const applyPreset = (celsiusValue: number) => {
    setActiveUnit("c");
    updateFrom("c", String(celsiusValue));
  };

  const copyValue = async (unit: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedUnit(unit);
    setTimeout(() => setCopiedUnit(""), 3000);
  };

  const currentCelsius = parseFloat(values.c);
  const description = !isNaN(currentCelsius) ? getTemperatureDescription(currentCelsius) : null;

  const getBarHeight = () => {
    if (isNaN(currentCelsius)) return 50;
    const min = -273.15;
    const max = 100;
    const clamped = Math.max(min, Math.min(max, currentCelsius));
    return ((clamped - min) / (max - min)) * 100;
  };

  const getBarColor = () => {
    if (isNaN(currentCelsius)) return "bg-surface-300";
    if (currentCelsius <= 0) return "bg-blue-400";
    if (currentCelsius <= 20) return "bg-teal-400";
    if (currentCelsius <= 35) return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ALL_UNITS.map((f) => (
          <div key={f.unit}>
            <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
              {f.label} ({f.symbol})
            </label>
            <div className="relative">
              <input
                type="number"
                value={values[f.unit]}
                onChange={(e) => handleInput(f.unit, e.target.value)}
                onFocus={() => setActiveUnit(f.unit)}
                step="any"
                placeholder="0"
                className={`w-full rounded-lg border bg-white p-3 pr-10 font-mono text-sm dark:bg-dark-bg dark:text-dark-text transition-colors ${
                  activeUnit === f.unit
                    ? "border-brand-400 ring-2 ring-brand-400/20 dark:border-brand-500"
                    : "border-surface-200 dark:border-dark-border"
                }`}
              />
              <button
                onClick={() => copyValue(f.unit, values[f.unit])}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-brand-500 hover:text-brand-600"
              >
                {copiedUnit === f.unit ? "✓" : "copy"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.celsius)}
            className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
          >
            {p.label} ({p.celsius}°C)
          </button>
        ))}
      </div>

      {description && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-32 rounded-full border-2 border-surface-200 dark:border-dark-border overflow-hidden relative bg-surface-100 dark:bg-dark-surface">
            <div
              className={`absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-300 ${getBarColor()}`}
              style={{ height: `${getBarHeight()}%` }}
            />
          </div>
          <div>
            <p className={`text-sm font-medium ${description.color}`}>{description.label}</p>
            <p className="text-xs text-surface-500 dark:text-dark-muted">
              {values.c}°C = {values.f}°F = {values.k}K = {values.r}°R = {values.d}°De = {values.n}°N = {values.re}°Ré = {values.ro}°Rø
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-xs text-surface-500 dark:text-dark-muted">
          <span className="font-medium text-surface-700 dark:text-dark-text">Formulas:</span>{" "}
          °F = °C×9/5+32 · K = °C+273.15 · °R = (°C+273.15)×9/5 · °De = (100-°C)×3/2 · °N = °C×33/100 · °Ré = °C×4/5 · °Rø = °C×21/40+7.5
        </p>
      </div>
    </div>
  );
}
