"use client";

import { useState, useCallback, useMemo } from "react";

interface IBANResult {
  valid: boolean;
  country: string;
  countryCode: string;
  checkDigits: string;
  bban: string;
  format: string;
  length: number;
  expectedLength: number;
}

const IBAN_FORMATS: { country: string; code: string; length: number; pattern: RegExp; example: string }[] = [
  { country: "Albania", code: "AL", length: 28, pattern: /^AL\d{2}\d{8}[A-Z0-9]{16}$/, example: "AL47 2121 1009 0000 0002 3569 8741" },
  { country: "Andorra", code: "AD", length: 24, pattern: /^AD\d{2}\d{4}[A-Z0-9]{12}$/, example: "AD12 0001 2030 2003 5910 0100" },
  { country: "Austria", code: "AT", length: 20, pattern: /^AT\d{2}\d{16}$/, example: "AT61 1904 3002 3457 3201" },
  { country: "Belgium", code: "BE", length: 16, pattern: /^BE\d{2}\d{12}$/, example: "BE68 5390 0754 7034" },
  { country: "Bulgaria", code: "BG", length: 22, pattern: /^BG\d{2}[A-Z]{4}\d{6}[A-Z0-9]{8}$/, example: "BG80 BNBG 9661 1020 3456 78" },
  { country: "Croatia", code: "HR", length: 21, pattern: /^HR\d{2}\d{17}$/, example: "HR12 1001 0051 8630 0016 01" },
  { country: "Cyprus", code: "CY", length: 28, pattern: /^CY\d{2}\d{8}[A-Z0-9]{16}$/, example: "CY17 0020 0128 0000 0012 0052 7600" },
  { country: "Czech Republic", code: "CZ", length: 24, pattern: /^CZ\d{2}\d{20}$/, example: "CZ65 0800 0000 1920 0014 5399" },
  { country: "Denmark", code: "DK", length: 18, pattern: /^DK\d{2}\d{14}$/, example: "DK50 0040 0440 1162 43" },
  { country: "Estonia", code: "EE", length: 20, pattern: /^EE\d{2}\d{16}$/, example: "EE38 2200 2210 2014 5685" },
  { country: "Finland", code: "FI", length: 18, pattern: /^FI\d{2}\d{14}$/, example: "FI21 1234 5600 0007 85" },
  { country: "France", code: "FR", length: 27, pattern: /^FR\d{2}\d{10}[A-Z0-9]{11}$/, example: "FR14 2004 1010 0505 0001 3M02 606" },
  { country: "Germany", code: "DE", length: 22, pattern: /^DE\d{2}\d{18}$/, example: "DE89 3704 0044 0532 0130 00" },
  { country: "Gibraltar", code: "GI", length: 23, pattern: /^GI\d{2}[A-Z]{4}[A-Z0-9]{15}$/, example: "GI75 NWBK 6019 1312 2662 015" },
  { country: "Greece", code: "GR", length: 27, pattern: /^GR\d{2}\d{7}[A-Z0-9]{16}$/, example: "GR16 0110 1250 0000 0001 2300 695" },
  { country: "Hungary", code: "HU", length: 28, pattern: /^HU\d{2}\d{24}$/, example: "HU42 1177 3016 1111 1018 0000 0000" },
  { country: "Iceland", code: "IS", length: 26, pattern: /^IS\d{2}\d{22}$/, example: "IS14 0159 2600 7654 5510 7374 44" },
  { country: "Ireland", code: "IE", length: 22, pattern: /^IE\d{2}[A-Z]{4}\d{14}$/, example: "IE29 AIBK 9311 5212 3456 78" },
  { country: "Italy", code: "IT", length: 27, pattern: /^IT\d{2}[A-Z]\d{10}[A-Z0-9]{12}$/, example: "IT60 X054 2811 1010 0000 0123 456" },
  { country: "Latvia", code: "LV", length: 21, pattern: /^LV\d{2}[A-Z]{4}[A-Z0-9]{13}$/, example: "LV80 BANK 0000 4351 9500 1" },
  { country: "Liechtenstein", code: "LI", length: 21, pattern: /^LI\d{2}\d{5}[A-Z0-9]{12}$/, example: "LI21 0881 0000 2324 013A A" },
  { country: "Lithuania", code: "LT", length: 20, pattern: /^LT\d{2}\d{16}$/, example: "LT12 1000 0111 0100 1000" },
  { country: "Luxembourg", code: "LU", length: 20, pattern: /^LU\d{2}\d{3}[A-Z0-9]{13}$/, example: "LU28 0019 4006 4475 0000" },
  { country: "Malta", code: "MT", length: 31, pattern: /^MT\d{2}[A-Z]{4}\d{5}[A-Z0-9]{18}$/, example: "MT84 MALT 0110 0001 2345 STLZ 11S1 827" },
  { country: "Monaco", code: "MC", length: 27, pattern: /^MC\d{2}\d{10}[A-Z0-9]{11}$/, example: "MC58 1348 8880 7092 4390 1562 5499" },
  { country: "Netherlands", code: "NL", length: 18, pattern: /^NL\d{2}[A-Z]{4}\d{10}$/, example: "NL91 ABNA 0417 1643 00" },
  { country: "Norway", code: "NO", length: 15, pattern: /^NO\d{2}\d{11}$/, example: "NO93 8601 1117 947" },
  { country: "Poland", code: "PL", length: 28, pattern: /^PL\d{2}\d{24}$/, example: "PL61 1090 1014 0000 0712 1981 2874 887" },
  { country: "Portugal", code: "PT", length: 25, pattern: /^PT\d{2}\d{21}$/, example: "PT50 0002 0123 1234 5678 9015 4" },
  { country: "Romania", code: "RO", length: 24, pattern: /^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/, example: "RO49 AAAA 1B31 0075 9384 0000" },
  { country: "San Marino", code: "SM", length: 27, pattern: /^SM\d{2}[A-Z]\d{10}[A-Z0-9]{12}$/, example: "SM76 U032 2509 8000 0000 2701 00" },
  { country: "Slovakia", code: "SK", length: 24, pattern: /^SK\d{2}\d{20}$/, example: "SK31 7990 0000 0012 3456 7890" },
  { country: "Slovenia", code: "SI", length: 19, pattern: /^SI\d{2}\d{15}$/, example: "SI56 2633 0001 2039 086" },
  { country: "Spain", code: "ES", length: 24, pattern: /^ES\d{2}\d{20}$/, example: "ES91 2100 0418 4502 0005 1332" },
  { country: "Sweden", code: "SE", length: 24, pattern: /^SE\d{2}\d{20}$/, example: "SE45 5000 0000 0583 9825 7466" },
  { country: "Switzerland", code: "CH", length: 21, pattern: /^CH\d{2}\d{5}[A-Z0-9]{12}$/, example: "CH93 0076 2011 6238 5295 7" },
  { country: "Turkey", code: "TR", length: 26, pattern: /^TR\d{2}\d{5}[A-Z0-9]{17}$/, example: "TR33 0006 1005 1978 6457 8413 26" },
  { country: "United Kingdom", code: "GB", length: 22, pattern: /^GB\d{2}[A-Z]{4}\d{14}$/, example: "GB29 NWBK 6016 1331 9268 19" },
];

function mod97(iban: string): number {
  let remainder = iban.replace(/\s/g, "");
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9);
    remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(block.length);
  }
  return parseInt(remainder, 10) % 97;
}

function parseIBAN(input: string): IBANResult {
  const cleaned = input.replace(/\s/g, "").toUpperCase();
  const countryCode = cleaned.slice(0, 2);
  const checkDigits = cleaned.slice(2, 4);
  const bban = cleaned.slice(4);

  const format = IBAN_FORMATS.find((f) => f.code === countryCode);
  const expectedLength = format?.length || 0;

  if (!format) {
    return { valid: false, country: "Unknown", countryCode, checkDigits, bban, format: "Unknown format", length: cleaned.length, expectedLength: 0 };
  }

  const isValidLength = cleaned.length === expectedLength;
  const isValidPattern = format.pattern.test(cleaned);
  const rearranged = bban + countryCode + checkDigits;
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => (ch.charCodeAt(0) - 55).toString());
  const checkValid = mod97(numeric) === 1;

  return {
    valid: isValidLength && isValidPattern && checkValid,
    country: format.country,
    countryCode,
    checkDigits,
    bban,
    format: format.example,
    length: cleaned.length,
    expectedLength,
  };
}

export function IBANValidator() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return parseIBAN(input.trim());
  }, [input]);

  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">IBAN</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. DE89 3704 0044 0532 0130 00"
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      {result && (
        <div className="space-y-3">
          <div className={`rounded-lg border p-3 ${result.valid ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${result.valid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                {result.valid ? "Valid IBAN" : "Invalid IBAN"}
              </p>
              {result.valid && (
                <button
                  onClick={() => copy(input.replace(/\s/g, "").toUpperCase())}
                  className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
                >
                  {copied ? "Copied!" : "Copy IBAN"}
                </button>
              )}
            </div>
            {!result.valid && result.length > 0 && result.expectedLength > 0 && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Expected length: {result.expectedLength}, Got: {result.length}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {[
              { label: "Country", value: `${result.country} (${result.countryCode})` },
              { label: "Check Digits", value: result.checkDigits },
              { label: "BBAN", value: result.bban },
              { label: "IBAN Length", value: `${result.length} / ${result.expectedLength}` },
              { label: "Example Format", value: result.format },
            ].map((field) => (
              <div key={field.label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-white px-3 py-2 dark:border-dark-border dark:bg-dark-bg">
                <div>
                  <p className="text-xs text-surface-500 dark:text-dark-muted">{field.label}</p>
                  <p className="text-sm font-mono text-surface-900 dark:text-dark-text">{field.value}</p>
                </div>
                <button
                  onClick={() => copy(field.value)}
                  className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Supported Countries</label>
        <div className="max-h-48 overflow-y-auto rounded-lg border border-surface-200 bg-surface-50 p-2 dark:border-dark-border dark:bg-dark-surface">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {IBAN_FORMATS.map((f) => (
              <button
                key={f.code}
                onClick={() => setInput(f.example)}
                className="rounded bg-white dark:bg-dark-bg border border-surface-200 dark:border-dark-border px-2 py-1 text-xs text-left hover:bg-brand-50 dark:hover:bg-dark-bg transition-colors"
              >
                <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">{f.code}</span>
                <span className="text-surface-600 dark:text-dark-muted ml-1">{f.country}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        IBAN validation uses Mod-97 checksum algorithm. All processing is done client-side.
      </p>
    </div>
  );
}
