"use client";

import { useState } from "react";

type Mode = "x-of-y" | "of-x" | "change" | "add" | "subtract";

const MODES: { key: Mode; label: string; desc: string }[] = [
  { key: "x-of-y", label: "X is what % of Y", desc: "Find what percentage X is of Y" },
  { key: "of-x", label: "What is X% of Y", desc: "Calculate a percentage of a value" },
  { key: "change", label: "Percentage change", desc: "Change from X to Y" },
  { key: "add", label: "Add X% to Y", desc: "Increase Y by X percent" },
  { key: "subtract", label: "Subtract X% from Y", desc: "Decrease Y by X percent" },
];

interface Result {
  value: string;
  formula: string;
}

function calculate(mode: Mode, a: string, b: string): Result | null {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (isNaN(x) || isNaN(y)) return null;

  switch (mode) {
    case "x-of-y": {
      if (y === 0) return { value: "—", formula: "Cannot divide by zero" };
      const result = (x / y) * 100;
      return { value: `${result.toFixed(4)}%`, formula: `${x} / ${y} × 100 = ${result.toFixed(4)}%` };
    }
    case "of-x": {
      const result = (x / 100) * y;
      return { value: result.toFixed(4), formula: `${x}% × ${y} = ${result.toFixed(4)}` };
    }
    case "change": {
      if (x === 0) return { value: "—", formula: "Cannot divide by zero" };
      const result = ((y - x) / Math.abs(x)) * 100;
      const sign = result >= 0 ? "+" : "";
      return { value: `${sign}${result.toFixed(4)}%`, formula: `(${y} - ${x}) / |${x}| × 100 = ${sign}${result.toFixed(4)}%` };
    }
    case "add": {
      const result = y * (1 + x / 100);
      return { value: result.toFixed(4), formula: `${y} × (1 + ${x}/100) = ${result.toFixed(4)}` };
    }
    case "subtract": {
      const result = y * (1 - x / 100);
      return { value: result.toFixed(4), formula: `${y} × (1 - ${x}/100) = ${result.toFixed(4)}` };
    }
  }
}

function getInputLabels(mode: Mode): { a: string; b: string } {
  switch (mode) {
    case "x-of-y": return { a: "X (value)", b: "Y (total)" };
    case "of-x": return { a: "X (percentage %)", b: "Y (value)" };
    case "change": return { a: "X (original)", b: "Y (new)" };
    case "add": return { a: "X (percentage %)", b: "Y (value)" };
    case "subtract": return { a: "X (percentage %)", b: "Y (value)" };
  }
}

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("x-of-y");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [copied, setCopied] = useState(false);

  const labels = getInputLabels(mode);
  const result = calculate(mode, a, b);

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-2">
          Calculation Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setA(""); setB(""); }}
              title={m.desc}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                mode === m.key
                  ? "bg-brand-500 text-white"
                  : "border border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            {labels.a}
          </label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="0"
            step="any"
            className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            {labels.b}
          </label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="0"
            step="any"
            className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
        </div>
      </div>

      {result && (
        <div
          className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-dark-border dark:bg-dark-surface cursor-pointer"
          onClick={copyResult}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-1">
            Result
          </p>
          <p className="text-xl font-bold font-mono text-surface-900 dark:text-dark-text">
            {result.value}
          </p>
          <p className="text-xs text-surface-500 dark:text-dark-muted mt-1 font-mono">
            {result.formula}
          </p>
          <p className="text-[9px] text-brand-400 mt-1">
            {copied ? "Copied!" : "click to copy"}
          </p>
        </div>
      )}

      {!result && (
        <p className="text-xs text-surface-500 dark:text-dark-muted text-center py-4">
          Enter values to see the percentage calculation.
        </p>
      )}

      <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
        <p className="text-xs text-surface-500 dark:text-dark-muted">
          <span className="font-medium text-surface-700 dark:text-dark-text">Quick reference:</span>{" "}
          50 is 25% of 200 · 25% of 200 is 50 · Change from 200 to 250 is +25% · 200 + 25% = 250 · 200 - 25% = 150
        </p>
      </div>
    </div>
  );
}
