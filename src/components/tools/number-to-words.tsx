"use client";

import { useState, useMemo, useCallback } from "react";

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const SCALES_INTL = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion",
  "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion", "Undecillion", "Duodecillion",
  "Tredecillion", "Quattuordecillion", "Quindecillion", "Sedecillion", "Septendecillion",
  "Octodecillion", "Novendecillion", "Vigintillion"];

const SCALES_INDIAN = ["", "Thousand", "Lakh", "Crore", "Arab", "Kharab", "Neel", "Padma", "Shankh"];

const CURRENCIES: Record<string, { name: string; plural: string; symbol: string; centName: string; centPlural: string }> = {
  USD: { name: "Dollar", plural: "Dollars", symbol: "$", centName: "Cent", centPlural: "Cents" },
  EUR: { name: "Euro", plural: "Euros", symbol: "€", centName: "Cent", centPlural: "Cents" },
  GBP: { name: "Pound", plural: "Pounds", symbol: "£", centName: "Penny", centPlural: "Pence" },
  INR: { name: "Rupee", plural: "Rupees", symbol: "₹", centName: "Paisa", centPlural: "Paise" },
  JPY: { name: "Yen", plural: "Yen", symbol: "¥", centName: "Sen", centPlural: "Sen" },
};

function convertHundreds(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  if (h > 0) parts.push(ONES[h] + " Hundred");
  const r = n % 100;
  if (r > 0) {
    if (r < 20) parts.push(ONES[r]);
    else parts.push(TENS[Math.floor(r / 10)] + (r % 10 > 0 ? "-" + ONES[r % 10].toLowerCase() : ""));
  }
  return parts.join(" ");
}

function numberToWordsIntl(numStr: string): string {
  if (numStr === "0") return "Zero";
  const n = BigInt(numStr);
  if (n === BigInt(0)) return "Zero";
  const negative = n < BigInt(0);
  let abs = negative ? -n : n;
  const groups: string[] = [];
  let idx = 0;
  while (abs > BigInt(0)) {
    const chunk = Number(abs % BigInt(1000));
    if (chunk > 0) {
      const words = convertHundreds(chunk);
      const scale = SCALES_INTL[idx];
      groups.unshift(words + (scale ? " " + scale : ""));
    }
    abs = abs / BigInt(1000);
    idx++;
  }
  return (negative ? "Negative " : "") + groups.join(" ");
}

function numberToWordsIndian(numStr: string): string {
  if (numStr === "0") return "Zero";
  const n = BigInt(numStr);
  if (n === BigInt(0)) return "Zero";
  const negative = n < BigInt(0);
  let abs = negative ? -n : n;
  const groups: string[] = [];

  const lastThree = Number(abs % BigInt(1000));
  abs = abs / BigInt(1000);

  if (lastThree > 0) groups.unshift(convertHundreds(lastThree));
  let idx = 1;
  while (abs > BigInt(0)) {
    const chunk = Number(abs % BigInt(100));
    if (chunk > 0) {
      const words = convertHundreds(chunk).replace(/^.*?(\w+)$/, chunk < 20 ? ONES[chunk] : TENS[Math.floor(chunk / 10)] + (chunk % 10 > 0 ? "-" + ONES[chunk % 10].toLowerCase() : ""));
      const scale = SCALES_INDIAN[idx];
      groups.unshift(words + " " + scale);
    }
    abs = abs / BigInt(100);
    idx++;
  }
  return (negative ? "Negative " : "") + groups.join(" ");
}

function toOrdinalWords(num: bigint): string {
  const words = numberToWordsIntl(num.toString());
  if (words === "Zero") return "Zeroth";
  const last = words.split(" ").pop()!;
  const ordMap: Record<string, string> = {
    "One": "First", "Two": "Second", "Three": "Third", "Four": "Fourth", "Five": "Fifth",
    "Six": "Sixth", "Seven": "Seventh", "Eight": "Eighth", "Nine": "Ninth", "Ten": "Tenth",
    "Eleven": "Eleventh", "Twelve": "Twelfth", "Thirteen": "Thirteenth", "Fourteen": "Fourteenth",
    "Fifteen": "Fifteenth", "Sixteen": "Sixteenth", "Seventeen": "Seventeenth", "Eighteen": "Eighteenth",
    "Nineteen": "Nineteenth", "Twenty": "Twentieth", "Thirty": "Thirtieth", "Forty": "Fortieth",
    "Fifty": "Fiftieth", "Sixty": "Sixtieth", "Seventy": "Seventieth", "Eighty": "Eightieth",
    "Ninety": "Ninetieth", "Hundred": "Hundredth", "Thousand": "Thousandth", "Million": "Millionth",
    "Billion": "Billionth", "Trillion": "Trillionth",
  };
  const ordLast = ordMap[last] || last + "th";
  return words.slice(0, -last.length) + ordLast;
}

function toRoman(num: bigint): string {
  if (num <= BigInt(0) || num > BigInt(3999)) return "—";
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const roms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let n = Number(num);
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]!) { result += roms[i]; n -= vals[i]!; }
  }
  return result;
}

function formatWithCommas(s: string): string {
  const [intPart, decPart] = s.split(".");
  if (!intPart) return s;
  const neg = intPart.startsWith("-");
  const abs = neg ? intPart.slice(1) : intPart;
  const formatted = abs.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + formatted + (decPart ? "." + decPart : "");
}

export function NumberToWords() {
  const [input, setInput] = useState("1234567.89");
  const [currency, setCurrency] = useState("USD");
  const [showIndian, setShowIndian] = useState(true);
  const [copied, setCopied] = useState("");

  const parsed = useMemo(() => {
    const s = input.trim().replace(/,/g, "");
    if (!s) return null;
    const sciMatch = s.match(/^(-?\d+(?:\.\d+)?)[eE]\s*([+-]?\d+)$/);
    if (sciMatch) {
      const num = parseFloat(sciMatch[1]!) * Math.pow(10, parseFloat(sciMatch[2]!));
      if (isNaN(num) || !isFinite(num)) return null;
      const str = num.toFixed(10).replace(/\.?0+$/, "");
      return { str, num: BigInt(Math.floor(num)), decimal: str.includes(".") ? str.split(".")[1]! : "" };
    }
    const num = parseFloat(s);
    if (isNaN(num) || !isFinite(num)) return null;
    const parts = s.split(".");
    const intPart = parts[0]!.replace(/^-?0*/, "") || "0";
    const decPart = parts[1] || "";
    return { str: s, num: BigInt(intPart), decimal: decPart };
  }, [input]);

  const intlWords = useMemo(() => {
    if (!parsed) return "";
    return numberToWordsIntl(parsed.str.split(".")[0]!);
  }, [parsed]);

  const indianWords = useMemo(() => {
    if (!parsed) return "";
    return numberToWordsIndian(parsed.str.split(".")[0]!);
  }, [parsed]);

  const ordinalWords = useMemo(() => {
    if (!parsed) return "";
    return toOrdinalWords(parsed.num);
  }, [parsed]);

  const romanNumeral = useMemo(() => {
    if (!parsed) return "—";
    return toRoman(parsed.num);
  }, [parsed]);

  const currencyWords = useMemo(() => {
    if (!parsed) return "";
    const curr = CURRENCIES[currency];
    if (!curr) return "";
    const intStr = parsed.str.split(".")[0]!;
    const mainWords = numberToWordsIntl(intStr);
    const whole = mainWords + " " + (intStr === "1" || intStr === "-1" ? curr.name : curr.plural);
    if (parsed.decimal) {
      const centNum = parseInt(parsed.decimal.padEnd(2, "0").slice(0, 2));
      if (centNum > 0) {
        const centWords = numberToWordsIntl(centNum.toString());
        return whole + " and " + centWords + " " + (centNum === 1 ? curr.centName : curr.centPlural);
      }
    }
    return whole;
  }, [parsed, currency]);

  const scientificNotation = useMemo(() => {
    if (!parsed) return "";
    const n = parseFloat(parsed.str);
    if (isNaN(n)) return "";
    return n.toExponential(6);
  }, [parsed]);

  const largeBreakdown = useMemo(() => {
    if (!parsed || parsed.num === BigInt(0)) return [];
    const n = parsed.num < BigInt(0) ? -parsed.num : parsed.num;
    const breakdown: { label: string; value: string }[] = [];
    for (let i = SCALES_INTL.length - 1; i >= 0; i--) {
      const divisor = BigInt(1000) ** BigInt(i);
      if (n >= divisor) {
        const count = Number(n / divisor);
        if (count > 0 && count < 1000) {
          breakdown.push({ label: SCALES_INTL[i]!, value: count.toString() });
        }
      }
    }
    return breakdown;
  }, [parsed]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const results = useMemo(() => {
    if (!parsed) return [];
    return [
      { label: "English Words (International)", value: intlWords, key: "intl" },
      { label: "English Words (Indian)", value: showIndian ? indianWords : "—", key: "indian" },
      { label: "Ordinal", value: ordinalWords, key: "ordinal" },
      { label: "Currency", value: currencyWords, key: "currency" },
      { label: "Scientific Notation", value: scientificNotation, key: "sci" },
      { label: "Roman Numerals", value: romanNumeral, key: "roman" },
    ].filter((r) => r.value && r.value !== "—");
  }, [parsed, intlWords, indianWords, showIndian, ordinalWords, currencyWords, scientificNotation, romanNumeral]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
          Number Input <span className="text-xs text-surface-400 dark:text-dark-muted">(supports scientific notation like 1.5e6)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="1234567, 1.5e6, -42.50..."
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <button
            onClick={() => setInput("")}
            className="rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-surface-700 dark:text-dark-text">Currency:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          >
            {Object.keys(CURRENCIES).map((c) => <option key={c} value={c}>{c} ({CURRENCIES[c].symbol})</option>)}
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-dark-text">
          <input type="checkbox" checked={showIndian} onChange={(e) => setShowIndian(e.target.checked)} className="accent-brand-500" />
          Indian Numbering
        </label>
      </div>

      {!parsed && input.trim() && (
        <p className="text-sm text-red-500">Invalid number. Enter an integer, decimal, or scientific notation (e.g., 1.5e6).</p>
      )}

      {parsed && (
        <>
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500 dark:text-dark-muted">Parsed Value</span>
              <code className="text-sm font-mono text-surface-900 dark:text-dark-text select-all">
                {formatWithCommas(parsed.str)}
                {parsed.num < BigInt(0) ? " (negative)" : ""}
                {parsed.decimal ? ` (${parsed.decimal.length} decimal places)` : ""}
              </code>
            </div>
          </div>

          <div className="space-y-2">
            {results.map((r) => (
              <div
                key={r.key}
                className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface"
              >
                <span className="text-sm text-surface-500 dark:text-dark-muted w-44 shrink-0">{r.label}</span>
                <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text overflow-auto max-h-12 select-all">
                  {r.value}
                </code>
                <button
                  onClick={() => handleCopy(r.value, r.key)}
                  className="ml-2 text-xs text-brand-500 hover:text-brand-600 transition-colors min-w-[3rem] text-right"
                >
                  {copied === r.key ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Integer Part", value: parsed.num.toString() },
              { label: "Decimal Part", value: parsed.decimal || "None" },
              { label: "Digit Count", value: (parsed.num < BigInt(0) ? -parsed.num : parsed.num).toString().length.toString() },
              { label: "Is Negative", value: parsed.num < BigInt(0) ? "Yes" : "No" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-surface-200 bg-white p-3 text-center dark:border-dark-border dark:bg-dark-surface">
                <p className="text-lg font-bold text-brand-500 truncate">{s.value}</p>
                <p className="text-xs text-surface-500 dark:text-dark-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {largeBreakdown.length > 0 && (
            <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Large Number Breakdown</p>
              <div className="flex flex-wrap gap-1">
                {largeBreakdown.map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-0.5 text-xs text-surface-700 dark:bg-dark-surface dark:text-dark-text">
                    {b.value} {b.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!input.trim() && (
        <div className="text-center text-sm text-surface-400 dark:text-dark-muted py-8">
          Enter a number to convert it to words
        </div>
      )}
    </div>
  );
}
