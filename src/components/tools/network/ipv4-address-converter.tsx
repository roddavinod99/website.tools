"use client";

import { useState } from "react";

type FormatType = "dotted" | "integer" | "hex" | "binary";

interface ConversionResult {
  inputFormat: FormatType;
  originalInput: string;
  ip: string;
  long: number;
  hex: string;
  binary: string;
  dotted: string;
}

function ipToLong(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map(p => parseInt(p, 10));
  if (nums.some((n, i) => isNaN(n) || n < 0 || n > 255 || String(n) !== parts[i])) return null;
  return (nums[0] << 24 | nums[1] << 16 | nums[2] << 8 | nums[3]) >>> 0;
}

function longToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function hexToIp(hex: string): string | null {
  const clean = hex.replace(/^0x/i, "").replace(/[.:]/g, "");
  if (!/^[0-9a-fA-F]{8}$/.test(clean)) return null;
  const n = parseInt(clean, 16);
  if (isNaN(n)) return null;
  return longToIp(n >>> 0);
}

function binaryToIp(binary: string): string | null {
  const clean = binary.replace(/[.\s]/g, "");
  if (!/^[01]{32}$/.test(clean)) return null;
  const n = parseInt(clean, 2);
  return longToIp(n >>> 0);
}

function parseInput(input: string, format: FormatType): ConversionResult | null {
  const trimmed = input.trim();
  let ip: string | null = null;

  switch (format) {
    case "dotted":
      if (ipToLong(trimmed) === null) return null;
      ip = trimmed;
      break;
    case "integer": {
      const n = parseInt(trimmed, 10);
      if (isNaN(n) || n < 0 || n > 4294967295) return null;
      ip = longToIp(n >>> 0);
      break;
    }
    case "hex":
      ip = hexToIp(trimmed);
      if (ip === null) return null;
      break;
    case "binary":
      ip = binaryToIp(trimmed);
      if (ip === null) return null;
      break;
  }

  if (!ip) return null;

  const long = ipToLong(ip);
  if (long === null) return null;

  const hexStr = long.toString(16).toUpperCase().padStart(8, "0");
  const octets = [(long >>> 24) & 0xff, (long >>> 16) & 0xff, (long >>> 8) & 0xff, long & 0xff];

  return {
    inputFormat: format,
    originalInput: trimmed,
    ip,
    long,
    hex: hexStr,
    binary: `${octets.map(o => o.toString(2).padStart(8, "0")).join(".")}`,
    dotted: ip,
  };
}

export function Ipv4AddressConverter() {
  const [input, setInput] = useState("192.168.1.1");
  const [format, setFormat] = useState<FormatType>("dotted");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const convert = () => {
    setError("");
    const r = parseInput(input, format);
    if (!r) {
      setError("Invalid input for the selected format");
      setResult(null);
      return;
    }
    setResult(r);
  };

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopyFeedback(`${label} copied`);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const allFormats: { label: string; format: FormatType; value: string }[] = result ? [
    { label: "Dotted Decimal", format: "dotted", value: result.dotted },
    { label: "Integer (Decimal)", format: "integer", value: result.long.toString() },
    { label: "Hexadecimal", format: "hex", value: result.hex },
    { label: "Hex (with prefix)", format: "hex", value: `0x${result.hex}` },
    { label: "Binary", format: "binary", value: result.binary },
    { label: "32-bit Integer", format: "integer", value: result.long.toString() },
  ] : [];

  const octets = result ? [(result.long >>> 24) & 0xff, (result.long >>> 16) & 0xff, (result.long >>> 8) & 0xff, result.long & 0xff] : [];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Input Format</label>
        <select
          value={format}
          onChange={e => setFormat(e.target.value as FormatType)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        >
          <option value="dotted">Dotted Decimal (192.168.1.1)</option>
          <option value="integer">Integer (3232235777)</option>
          <option value="hex">Hexadecimal (C0A80101)</option>
          <option value="binary">Binary (11000000.10101000.00000001.00000001)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Address</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && convert()}
            placeholder={format === "dotted" ? "192.168.1.1" : format === "integer" ? "3232235777" : format === "hex" ? "C0A80101" : "11000000.10101000.00000001.00000001"}
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <button onClick={convert} className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Convert</button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">{error}</div>
      )}

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allFormats.map(f => (
              <div
                key={f.label}
                className="group relative rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface cursor-pointer"
                onClick={() => copyValue(f.label, f.value)}
              >
                <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted">{f.label}</span>
                <span className="block text-sm font-mono text-surface-900 dark:text-dark-text truncate">{f.value}</span>
                <span className="absolute top-1 right-1 text-[9px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-surface-200 bg-surface-50 px-3 py-3 dark:border-dark-border dark:bg-dark-surface">
            <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-2">Octet Breakdown</span>
            <div className="grid grid-cols-4 gap-2">
              {octets.map((oct, i) => (
                <div key={i} className="text-center">
                  <span className="block text-[10px] text-surface-400 dark:text-dark-muted">Octet {i + 1}</span>
                  <span className="block text-lg font-mono font-semibold text-surface-900 dark:text-dark-text">{oct}</span>
                  <span className="block text-xs font-mono text-surface-500 dark:text-dark-muted">{oct.toString(2).padStart(8, "0")}</span>
                  <span className="block text-[10px] font-mono text-surface-400 dark:text-dark-muted">0x{oct.toString(16).toUpperCase().padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">{copyFeedback}</div>
      )}
    </div>
  );
}
