"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type Direction = "toRoman" | "toNumber";

const ROMAN_MAP: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function intToRoman(num: number): string {
  if (num <= 0 || num > 3999) throw new Error("Number must be between 1 and 3999");
  let result = "";
  for (const [value, symbol] of ROMAN_MAP) {
    while (num >= value) { result += symbol; num -= value; }
  }
  return result;
}

function romanToInt(str: string): number {
  const romanRegex = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  const cleaned = str.trim().toUpperCase();
  if (!cleaned || !romanRegex.test(cleaned)) throw new Error("Invalid Roman numeral");
  const map: Record<string, number> = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
  let result = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const curr = map[cleaned[i]];
    const next = i + 1 < cleaned.length ? map[cleaned[i + 1]] : 0;
    if (curr < next) { result -= curr; } else { result += curr; }
  }
  return result;
}

export function RomanNumeralConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<Direction>("toRoman");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const convert = useCallback(() => {
    setError("");
    if (!input.trim()) { setOutput(""); return; }
    try {
      if (direction === "toRoman") {
        const num = parseInt(input.trim(), 10);
        if (isNaN(num)) throw new Error("Please enter a valid integer");
        setOutput(intToRoman(num));
      } else {
        setOutput(String(romanToInt(input.trim())));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }, [input, direction]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {([["toRoman", "Number → Roman"], ["toNumber", "Roman → Number"]] as [Direction, string][]).map(([d, label]) => (
          <button key={d} onClick={() => { setDirection(d); setOutput(""); setError(""); setInput(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${direction === d ? "bg-brand-500 text-white" : "rounded-lg border border-surface-200 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}>
            {label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-surface-700 dark:text-dark-text mb-1 block">
          {direction === "toRoman" ? "Integer (1–3999)" : "Roman Numeral"}
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={direction === "toRoman" ? "e.g. 1984" : "e.g. MCMLXXXIV"}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 font-mono text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Output</label>
            <button onClick={copy} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono dark:border-dark-border dark:bg-dark-bg dark:text-dark-text overflow-auto max-h-60 select-all">{output}</pre>
        </div>
      )}
    </div>
  );
}
