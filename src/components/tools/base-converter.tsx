"use client";

import { useState, useMemo, useCallback } from "react";

const BASE_LABELS: { label: string; value: number }[] = [
  { label: "Binary (base-2)", value: 2 },
  { label: "Octal (base-8)", value: 8 },
  { label: "Decimal (base-10)", value: 10 },
  { label: "Hexadecimal (base-16)", value: 16 },
  { label: "Base-32", value: 32 },
  { label: "Base-36", value: 36 },
  { label: "Base-64", value: 64 },
];

const DEFAULT_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";

function isValidInBase(s: string, base: number): boolean {
  if (!s) return false;
  const chars = DEFAULT_CHARS.slice(0, base);
  return s.split("").every((c) => chars.includes(c));
}

function detectBase(input: string): number | null {
  const s = input.trim();
  if (/^0b[01]+$/i.test(s)) return 2;
  if (/^0o[0-7]+$/i.test(s)) return 8;
  if (/^0x[0-9a-f]+$/i.test(s)) return 16;
  if (/^[01]+$/.test(s) && s.length > 1) return 10;
  return null;
}

function stripPrefix(s: string): string {
  return s.replace(/^0[bBoOxX]/, "");
}

function toCustomBase(num: bigint, base: number): string {
  const ZERO = BigInt(0);
  if (num === ZERO) return "0";
  const chars = DEFAULT_CHARS.slice(0, base);
  let n = num < ZERO ? -num : num;
  let result = "";
  while (n > ZERO) {
    result = chars[Number(n % BigInt(base))] + result;
    n = n / BigInt(base);
  }
  return num < ZERO ? "-" + result : result;
}

function fromCustomBase(s: string, base: number): bigint | null {
  let str = s.trim();
  if (!str) return null;
  let negative = false;
  if (str.startsWith("-")) { negative = true; str = str.slice(1); }
  let result = BigInt(0);
  for (const ch of str) {
    const digit = DEFAULT_CHARS.indexOf(ch);
    if (digit < 0 || digit >= base) return null;
    result = result * BigInt(base) + BigInt(digit);
  }
  return negative ? -result : result;
}

function twosComplement(bits: string, bitLen: number): string {
  if (bits.length > bitLen) return "Overflow";
  const padded = bits.padStart(bitLen, "0");
  if (padded[0] === "0") return padded;
  const inverted = padded.split("").map((b) => b === "0" ? "1" : "0").join("");
  const addOne = (fromCustomBase(inverted, 2) ?? BigInt(0)) + BigInt(1);
  return toCustomBase(addOne, 2).padStart(bitLen, "0");
}

function toAscii(bigint: bigint): string {
  let hex = bigint.toString(16);
  if (hex.length % 2 !== 0) hex = "0" + hex;
  let result = "";
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.slice(i, i + 2), 16);
    if (code >= 32 && code <= 126) result += String.fromCharCode(code);
    else result += ".";
  }
  return result || "\u2014";
}

function formatLarge(num: bigint): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function BaseConverter() {
  const [input, setInput] = useState("255");
  const [fromBase, setFromBase] = useState(10);
  const [customBase, setCustomBase] = useState(2);
  const [showCustom, setShowCustom] = useState(false);
  const [bitLength, setBitLength] = useState(8);
  const [copied, setCopied] = useState("");
  const error = useMemo(() => {
    if (!input.trim()) return "";
    const cleaned = stripPrefix(input.trim());
    if (!isValidInBase(cleaned, fromBase)) return `Invalid character for base-${fromBase}. Allowed: ${DEFAULT_CHARS.slice(0, fromBase)}`;
    const val = fromCustomBase(cleaned, fromBase);
    if (val === null) return "Invalid number";
    return "";
  }, [input, fromBase]);

  const decimalValue = useMemo<bigint | null>(() => {
    if (!input.trim()) return null;
    const cleaned = stripPrefix(input.trim());
    if (!isValidInBase(cleaned, fromBase)) return null;
    const val = fromCustomBase(cleaned, fromBase);
    if (val === null) return null;
    return val;
  }, [input, fromBase]);

  const conversions = useMemo(() => {
    if (decimalValue === null) return [];
    return BASE_LABELS.map((b) => ({
      label: b.label,
      value: b.value,
      result: toCustomBase(decimalValue!, b.value),
    }));
  }, [decimalValue]);

  const customResult = useMemo(() => {
    if (decimalValue === null || customBase < 2 || customBase > 64) return "";
    return toCustomBase(decimalValue, customBase);
  }, [decimalValue, customBase]);

  const binaryStr = useMemo(() => {
    if (decimalValue === null) return "";
    return toCustomBase(decimalValue, 2);
  }, [decimalValue]);

  const twosComp = useMemo(() => {
    if (!binaryStr) return "";
    return twosComplement(binaryStr, bitLength);
  }, [binaryStr, bitLength]);

  const ascii = useMemo(() => {
    if (decimalValue === null) return "\u2014";
    return toAscii(decimalValue < BigInt(0) ? -decimalValue : decimalValue);
  }, [decimalValue]);

  const bitCount = useMemo(() => {
    if (decimalValue === null) return 0;
    if (decimalValue === BigInt(0)) return 1;
    return decimalValue.toString(2).length;
  }, [decimalValue]);

  const steps = useMemo(() => {
    if (decimalValue === null) return [];
    const s: string[] = [];
    s.push(`1. Parse input "${input}" in base-${fromBase}`);
    s.push(`2. Convert to decimal: ${fromCustomBase(stripPrefix(input.trim()), fromBase)?.toString() ?? "?"}`);
    for (const b of BASE_LABELS) {
      const result = toCustomBase(decimalValue, b.value);
      s.push(`3. Convert to ${b.label}: ${result}`);
    }
    return s;
  }, [decimalValue, input, fromBase]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setCopied("");
  }, []);

  const handleDetect = useCallback(() => {
    const detected = detectBase(input);
    if (detected) setFromBase(detected);
  }, [input]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">
            Input (prefix auto-detect: 0b, 0o, 0x)
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={handleDetect}
            placeholder="255, 0xFF, 0b11111111, 0o377..."
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">From Base</label>
          <select
            value={fromBase}
            onChange={(e) => setFromBase(parseInt(e.target.value))}
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          >
            {BASE_LABELS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleClear} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface transition-colors">
          Clear
        </button>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showCustom ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-900/20 dark:border-brand-700 dark:text-brand-400" : "border-surface-200 text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"}`}
        >
          Custom Base
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {decimalValue !== null && (
        <>
          <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500 dark:text-dark-muted">Decimal Value</span>
              <code className="text-sm font-mono text-surface-900 dark:text-dark-text select-all">
                {formatLarge(decimalValue)}
                {decimalValue < BigInt(0) ? " (negative)" : ""}
              </code>
            </div>
          </div>

          <div className="space-y-2">
            {conversions.map((c) => (
              <div
                key={c.value}
                className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface"
              >
                <span className="text-sm text-surface-500 dark:text-dark-muted w-36 shrink-0">{c.label}</span>
                <code className="flex-1 text-sm font-mono text-surface-900 dark:text-dark-text overflow-auto max-h-10 select-all">
                  {c.result}
                </code>
                <button
                  onClick={() => handleCopy(c.result, `base${c.value}`)}
                  disabled={!c.result}
                  className="ml-2 text-xs text-brand-500 hover:text-brand-600 disabled:text-surface-300 dark:disabled:text-dark-muted transition-colors min-w-[3rem] text-right"
                >
                  {copied === `base${c.value}` ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          {showCustom && (
            <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
              <div className="flex gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Custom Base (2-64)</label>
                  <input
                    type="number"
                    min={2}
                    max={64}
                    value={customBase}
                    onChange={(e) => setCustomBase(Math.min(64, Math.max(2, parseInt(e.target.value) || 2)))}
                    className="w-24 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Result (base-{customBase})</label>
                  <code className="block rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm font-mono text-surface-900 select-all dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                    {customResult || "\u2014"}
                  </code>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">Bit Length</p>
              <p className="text-lg font-bold text-brand-500">{bitCount}</p>
            </div>
            <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs text-surface-500 dark:text-dark-muted mb-1">ASCII Interpretation</p>
              <p className="text-sm font-mono text-surface-900 dark:text-dark-text select-all">{ascii}</p>
            </div>
          </div>

          <div className="rounded-lg border border-surface-200 bg-white p-3 dark:border-dark-border dark:bg-dark-surface">
            <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-2">Two&apos;s Complement (signed, {bitLength}-bit)</p>
            <div className="flex gap-2 items-center mb-2">
              <label className="text-xs text-surface-500 dark:text-dark-muted">Bit width:</label>
              <input
                type="number"
                min={4}
                max={64}
                value={bitLength}
                onChange={(e) => setBitLength(Math.min(64, Math.max(4, parseInt(e.target.value) || 8)))}
                className="w-16 rounded border border-surface-200 bg-white px-2 py-1 text-xs font-mono text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
              />
            </div>
            <code className="text-sm font-mono text-surface-900 dark:text-dark-text select-all">{twosComp || "\u2014"}</code>
          </div>

          <div className="border-t border-surface-200 pt-3 dark:border-dark-border">
            <details>
              <summary className="text-sm font-medium text-surface-700 dark:text-dark-text cursor-pointer select-none">
                Conversion Steps
              </summary>
              <div className="mt-2 space-y-1">
                {steps.map((step, i) => (
                  <p key={i} className="text-xs font-mono text-surface-500 dark:text-dark-muted">{step}</p>
                ))}
              </div>
            </details>
          </div>
        </>
      )}

      {!input.trim() && (
        <div className="text-center text-sm text-surface-400 dark:text-dark-muted py-8">
          Enter a number to convert between bases
        </div>
      )}
    </div>
  );
}
