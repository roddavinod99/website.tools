"use client";

import { useState, useMemo, useCallback } from "react";

interface UnitDef {
  label: string;
  value: string;
  toBase: (n: number) => number;
  fromBase: (n: number) => number;
}

interface CategoryDef {
  label: string;
  units: UnitDef[];
  formula?: string;
}

type CategoryKey = "length" | "mass" | "volume" | "temperature" | "area" | "speed" | "time" | "data" | "pressure" | "energy" | "frequency" | "angle" | "fuelEconomy";

const categories: Record<CategoryKey, CategoryDef> = {
  length: {
    label: "Length", formula: "Multiply / divide by conversion factor",
    units: [
      { label: "Meters", value: "m", toBase: (n) => n, fromBase: (n) => n },
      { label: "Kilometers", value: "km", toBase: (n) => n * 1000, fromBase: (n) => n / 1000 },
      { label: "Miles", value: "mi", toBase: (n) => n * 1609.344, fromBase: (n) => n / 1609.344 },
      { label: "Yards", value: "yd", toBase: (n) => n * 0.9144, fromBase: (n) => n / 0.9144 },
      { label: "Feet", value: "ft", toBase: (n) => n * 0.3048, fromBase: (n) => n / 0.3048 },
      { label: "Inches", value: "in", toBase: (n) => n * 0.0254, fromBase: (n) => n / 0.0254 },
      { label: "Centimeters", value: "cm", toBase: (n) => n * 0.01, fromBase: (n) => n / 0.01 },
      { label: "Millimeters", value: "mm", toBase: (n) => n * 0.001, fromBase: (n) => n / 0.001 },
      { label: "Micrometers", value: "µm", toBase: (n) => n * 1e-6, fromBase: (n) => n / 1e-6 },
      { label: "Nanometers", value: "nm", toBase: (n) => n * 1e-9, fromBase: (n) => n / 1e-9 },
      { label: "Nautical Miles", value: "nmi", toBase: (n) => n * 1852, fromBase: (n) => n / 1852 },
      { label: "Light Years", value: "ly", toBase: (n) => n * 9.461e15, fromBase: (n) => n / 9.461e15 },
    ],
  },
  mass: {
    label: "Mass / Weight", formula: "Multiply / divide by conversion factor",
    units: [
      { label: "Kilograms", value: "kg", toBase: (n) => n, fromBase: (n) => n },
      { label: "Grams", value: "g", toBase: (n) => n / 1000, fromBase: (n) => n * 1000 },
      { label: "Milligrams", value: "mg", toBase: (n) => n / 1e6, fromBase: (n) => n * 1e6 },
      { label: "Metric Tons", value: "t", toBase: (n) => n * 1000, fromBase: (n) => n / 1000 },
      { label: "Pounds", value: "lb", toBase: (n) => n * 0.453592, fromBase: (n) => n / 0.453592 },
      { label: "Ounces", value: "oz", toBase: (n) => n * 0.0283495, fromBase: (n) => n / 0.0283495 },
      { label: "Stones", value: "st", toBase: (n) => n * 6.35029, fromBase: (n) => n / 6.35029 },
    ],
  },
  volume: {
    label: "Volume", formula: "Multiply / divide by conversion factor",
    units: [
      { label: "Liters", value: "l", toBase: (n) => n, fromBase: (n) => n },
      { label: "Milliliters", value: "ml", toBase: (n) => n / 1000, fromBase: (n) => n * 1000 },
      { label: "Cubic Meters", value: "m3", toBase: (n) => n * 1000, fromBase: (n) => n / 1000 },
      { label: "Gallons (US)", value: "gal", toBase: (n) => n * 3.78541, fromBase: (n) => n / 3.78541 },
      { label: "Quarts (US)", value: "qt", toBase: (n) => n * 0.946353, fromBase: (n) => n / 0.946353 },
      { label: "Cups (US)", value: "cup", toBase: (n) => n * 0.236588, fromBase: (n) => n / 0.236588 },
      { label: "Fluid Ounces (US)", value: "floz", toBase: (n) => n * 0.0295735, fromBase: (n) => n / 0.0295735 },
      { label: "Teaspoons", value: "tsp", toBase: (n) => n * 0.00492892, fromBase: (n) => n / 0.00492892 },
      { label: "Tablespoons", value: "tbsp", toBase: (n) => n * 0.0147868, fromBase: (n) => n / 0.0147868 },
    ],
  },
  temperature: {
    label: "Temperature", formula: "°C = (°F - 32) × 5/9",
    units: [
      { label: "Celsius", value: "c", toBase: (n) => n, fromBase: (n) => n },
      { label: "Fahrenheit", value: "f", toBase: (n) => (n - 32) * 5 / 9, fromBase: (n) => n * 9 / 5 + 32 },
      { label: "Kelvin", value: "k", toBase: (n) => n - 273.15, fromBase: (n) => n + 273.15 },
    ],
  },
  area: {
    label: "Area", formula: "Multiply / divide by conversion factor",
    units: [
      { label: "Square Meters", value: "m2", toBase: (n) => n, fromBase: (n) => n },
      { label: "Square Kilometers", value: "km2", toBase: (n) => n * 1e6, fromBase: (n) => n / 1e6 },
      { label: "Square Miles", value: "mi2", toBase: (n) => n * 2.58999e6, fromBase: (n) => n / 2.58999e6 },
      { label: "Square Yards", value: "yd2", toBase: (n) => n * 0.836127, fromBase: (n) => n / 0.836127 },
      { label: "Square Feet", value: "ft2", toBase: (n) => n * 0.092903, fromBase: (n) => n / 0.092903 },
      { label: "Acres", value: "ac", toBase: (n) => n * 4046.86, fromBase: (n) => n / 4046.86 },
      { label: "Hectares", value: "ha", toBase: (n) => n * 10000, fromBase: (n) => n / 10000 },
    ],
  },
  speed: {
    label: "Speed", formula: "1 m/s = 3.6 km/h",
    units: [
      { label: "Meters/second", value: "ms", toBase: (n) => n, fromBase: (n) => n },
      { label: "km/h", value: "kmh", toBase: (n) => n / 3.6, fromBase: (n) => n * 3.6 },
      { label: "mph", value: "mph", toBase: (n) => n * 0.44704, fromBase: (n) => n / 0.44704 },
      { label: "Knots", value: "kn", toBase: (n) => n * 0.514444, fromBase: (n) => n / 0.514444 },
      { label: "Mach (20°C)", value: "mach", toBase: (n) => n * 343, fromBase: (n) => n / 343 },
    ],
  },
  time: {
    label: "Time", formula: "Multiply / divide by conversion factor",
    units: [
      { label: "Seconds", value: "s", toBase: (n) => n, fromBase: (n) => n },
      { label: "Milliseconds", value: "ms", toBase: (n) => n / 1000, fromBase: (n) => n * 1000 },
      { label: "Microseconds", value: "µs", toBase: (n) => n / 1e6, fromBase: (n) => n * 1e6 },
      { label: "Nanoseconds", value: "ns", toBase: (n) => n / 1e9, fromBase: (n) => n * 1e9 },
      { label: "Minutes", value: "min", toBase: (n) => n * 60, fromBase: (n) => n / 60 },
      { label: "Hours", value: "h", toBase: (n) => n * 3600, fromBase: (n) => n / 3600 },
      { label: "Days", value: "d", toBase: (n) => n * 86400, fromBase: (n) => n / 86400 },
      { label: "Weeks", value: "wk", toBase: (n) => n * 604800, fromBase: (n) => n / 604800 },
    ],
  },
  data: {
    label: "Data Storage", formula: "1 KB = 1024 Bytes",
    units: [
      { label: "Bytes", value: "b", toBase: (n) => n, fromBase: (n) => n },
      { label: "Kilobytes", value: "kb", toBase: (n) => n * 1024, fromBase: (n) => n / 1024 },
      { label: "Megabytes", value: "mb", toBase: (n) => n * 1024 * 1024, fromBase: (n) => n / (1024 * 1024) },
      { label: "Gigabytes", value: "gb", toBase: (n) => n * 1024 * 1024 * 1024, fromBase: (n) => n / (1024 * 1024 * 1024) },
      { label: "Terabytes", value: "tb", toBase: (n) => n * 1024 * 1024 * 1024 * 1024, fromBase: (n) => n / (1024 * 1024 * 1024 * 1024) },
      { label: "Petabytes", value: "pb", toBase: (n) => n * 1024 ** 5, fromBase: (n) => n / 1024 ** 5 },
      { label: "Bits", value: "bit", toBase: (n) => n / 8, fromBase: (n) => n * 8 },
    ],
  },
  pressure: {
    label: "Pressure", formula: "1 atm = 101325 Pa",
    units: [
      { label: "Pascals", value: "pa", toBase: (n) => n, fromBase: (n) => n },
      { label: "Hectopascals", value: "hpa", toBase: (n) => n * 100, fromBase: (n) => n / 100 },
      { label: "Kilopascals", value: "kpa", toBase: (n) => n * 1000, fromBase: (n) => n / 1000 },
      { label: "Bar", value: "bar", toBase: (n) => n * 100000, fromBase: (n) => n / 100000 },
      { label: "PSI", value: "psi", toBase: (n) => n * 6894.76, fromBase: (n) => n / 6894.76 },
      { label: "Atmospheres", value: "atm", toBase: (n) => n * 101325, fromBase: (n) => n / 101325 },
      { label: "mmHg (Torr)", value: "torr", toBase: (n) => n * 133.322, fromBase: (n) => n / 133.322 },
    ],
  },
  energy: {
    label: "Energy", formula: "1 J = 0.239 cal",
    units: [
      { label: "Joules", value: "j", toBase: (n) => n, fromBase: (n) => n },
      { label: "Kilojoules", value: "kj", toBase: (n) => n * 1000, fromBase: (n) => n / 1000 },
      { label: "Calories", value: "cal", toBase: (n) => n * 4.184, fromBase: (n) => n / 4.184 },
      { label: "Kilocalories", value: "kcal", toBase: (n) => n * 4184, fromBase: (n) => n / 4184 },
      { label: "Watt-hours", value: "wh", toBase: (n) => n * 3600, fromBase: (n) => n / 3600 },
      { label: "Kilowatt-hours", value: "kwh", toBase: (n) => n * 3.6e6, fromBase: (n) => n / 3.6e6 },
      { label: "Electronvolts", value: "ev", toBase: (n) => n * 1.602e-19, fromBase: (n) => n / 1.602e-19 },
      { label: "BTU", value: "btu", toBase: (n) => n * 1055.06, fromBase: (n) => n / 1055.06 },
    ],
  },
  frequency: {
    label: "Frequency", formula: "1 Hz = 1 cycle/s",
    units: [
      { label: "Hertz", value: "hz", toBase: (n) => n, fromBase: (n) => n },
      { label: "Kilohertz", value: "khz", toBase: (n) => n * 1000, fromBase: (n) => n / 1000 },
      { label: "Megahertz", value: "mhz", toBase: (n) => n * 1e6, fromBase: (n) => n / 1e6 },
      { label: "Gigahertz", value: "ghz", toBase: (n) => n * 1e9, fromBase: (n) => n / 1e9 },
    ],
  },
  angle: {
    label: "Angle", formula: "180° = π rad",
    units: [
      { label: "Degrees", value: "deg", toBase: (n) => n, fromBase: (n) => n },
      { label: "Radians", value: "rad", toBase: (n) => n * 180 / Math.PI, fromBase: (n) => n * Math.PI / 180 },
      { label: "Gradians", value: "grad", toBase: (n) => n * 0.9, fromBase: (n) => n / 0.9 },
      { label: "Arcminutes", value: "arcmin", toBase: (n) => n / 60, fromBase: (n) => n * 60 },
      { label: "Arcseconds", value: "arcsec", toBase: (n) => n / 3600, fromBase: (n) => n * 3600 },
    ],
  },
  fuelEconomy: {
    label: "Fuel Economy", formula: "mpg = 235.215 / L/100km",
    units: [
      { label: "L/100km", value: "l100", toBase: (n) => n, fromBase: (n) => n },
      { label: "mpg (US)", value: "mpg", toBase: (n) => 235.215 / n, fromBase: (n) => 235.215 / n },
      { label: "mpg (UK)", value: "mpguk", toBase: (n) => 282.481 / n, fromBase: (n) => 282.481 / n },
      { label: "km/L", value: "kml", toBase: (n) => 100 / n, fromBase: (n) => 100 / n },
    ],
  },
};

const STORAGE_KEY = "unit-converter-favorites";

function loadFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveFavorites(favs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export function UnitConverter() {
  const [category, setCategory] = useState<CategoryKey>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [value, setValue] = useState("1");
  const [sciNotation, setSciNotation] = useState(false);
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [, setCopied] = useState("");

  const current = categories[category];

  // Reset from/to on category change
  const handleCategoryChange = (cat: CategoryKey) => {
    setCategory(cat);
    setFromUnit(categories[cat].units[0]!.value);
    setToUnit(categories[cat].units[1]?.value ?? categories[cat].units[0]!.value);
    setBatchResults([]);
  };

  const fromDef = current.units.find((u) => u.value === fromUnit);
  const toDef = current.units.find((u) => u.value === toUnit);

  const result = useMemo(() => {
    if (!value || !fromDef || !toDef) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    const base = fromDef.toBase(num);
    const raw = toDef.fromBase(base);
    if (sciNotation) return raw.toExponential(6);
    if (category === "temperature") return raw.toFixed(2);
    if (Math.abs(raw) < 0.001 || Math.abs(raw) > 1e9) return raw.toExponential(6);
    return raw.toPrecision(10).replace(/\.?0+$/, "");
  }, [value, fromDef, toDef, sciNotation, category]);

  const resultNum = useMemo(() => {
    if (!value || !fromDef || !toDef) return 0;
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return toDef.fromBase(fromDef.toBase(num));
  }, [value, fromDef, toDef]);

  const swap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [toUnit, fromUnit]);

  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied("result");
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const handleBatch = useCallback(() => {
    const lines = batchInput.trim().split("\n").filter(Boolean);
    if (!fromDef || !toDef) return;
    const results = lines.map((line) => {
      const n = parseFloat(line.trim());
      if (isNaN(n)) return `Invalid: ${line}`;
      const base = fromDef.toBase(n);
      const raw = toDef.fromBase(base);
      return `${n} ${fromUnit} = ${raw.toPrecision(10).replace(/\.?0+$/, "")} ${toUnit}`;
    });
    setBatchResults(results);
  }, [batchInput, fromDef, toDef, fromUnit, toUnit]);

  const toggleFavorite = useCallback(() => {
    const key = `${category}:${fromUnit}>${toUnit}`;
    const exists = favorites.includes(key);
    const updated = exists ? favorites.filter((f) => f !== key) : [...favorites, key];
    setFavorites(updated);
    saveFavorites(updated);
  }, [category, fromUnit, toUnit, favorites]);

  const isFavorite = favorites.includes(`${category}:${fromUnit}>${toUnit}`);

  const formulaText = useMemo(() => {
    if (!fromDef || !toDef) return "";
    if (category === "temperature") {
      if (fromUnit === "c" && toUnit === "f") return "°F = (°C × 9/5) + 32";
      if (fromUnit === "f" && toUnit === "c") return "°C = (°F - 32) × 5/9";
      if (fromUnit === "c" && toUnit === "k") return "K = °C + 273.15";
      if (fromUnit === "k" && toUnit === "c") return "°C = K - 273.15";
    }
    if (category === "fuelEconomy") {
      return current.formula || "";
    }
    return `${toDef.label} = ${value} ${fromDef.label} × (${fromDef.value} → base → ${toDef.value})`;
  }, [category, fromUnit, toUnit, fromDef, toDef, value, current.formula]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as CategoryKey)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          >
            {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">From</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          >
            {current.units.map((u) => <option key={u.value} value={u.value}>{u.label} ({u.value})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">To</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          >
            {current.units.map((u) => <option key={u.value} value={u.value}>{u.label} ({u.value})</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Value</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value..."
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          />
        </div>
        <button
          onClick={swap}
          title="Swap units"
          className="rounded-lg border border-surface-200 px-3 py-2 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
        >
          ⇄
        </button>
        <button
          onClick={toggleFavorite}
          className={`rounded-lg px-3 py-2 text-sm transition-colors ${isFavorite ? "bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700" : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={sciNotation} onChange={(e) => setSciNotation(e.target.checked)} className="accent-brand-500" />
          Scientific Notation
        </label>
        {favorites.length > 0 && (
          <div className="text-xs text-surface-400 dark:text-dark-muted">
            {favorites.length} favorite{favorites.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {result && (
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Result</label>
          <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-700 dark:bg-brand-900/20">
            <code className="flex-1 text-lg font-bold font-mono text-surface-900 dark:text-dark-text select-all">
              {result} {toUnit}
            </code>
            <button onClick={() => copy(result + " " + toUnit)} className="text-xs text-brand-500 hover:text-brand-600 transition-colors">Copy</button>
          </div>
          <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">
            {value} {fromUnit} = {resultNum.toPrecision(10).replace(/\.?0+$/, "")} {toUnit}
          </p>
          <p className="mt-0.5 text-xs text-surface-400 dark:text-dark-muted italic">{formulaText}</p>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
          <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Favorite Conversions</p>
          <div className="flex flex-wrap gap-1">
            {favorites.map((fav) => {
              const [cat, units] = fav.split(":");
              const [fromF, toF] = units!.split(">");
              return (
                <button
                  key={fav}
                  onClick={() => { setCategory(cat as CategoryKey); setFromUnit(fromF!); setToUnit(toF!); }}
                  className="rounded-full bg-surface-100 px-2.5 py-0.5 text-xs text-surface-700 hover:bg-surface-200 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-border transition-colors"
                >
                  {cat}: {fromF} → {toF}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-surface-200 pt-4 dark:border-dark-border">
        <p className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Batch Convert</p>
        <textarea
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
          placeholder="Paste values, one per line&#10;e.g.&#10;1&#10;2.5&#10;100"
          rows={3}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
        />
        <button onClick={handleBatch} className="mt-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
          Convert Batch
        </button>
        {batchResults.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
            {batchResults.map((r, i) => (
              <div key={i} className="rounded border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-mono text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
