"use client";

import { useState, useCallback, useMemo } from "react";

interface PhoneInfo {
  valid: boolean;
  raw: string;
  countryCode: string;
  countryName: string;
  areaCode: string;
  nationalNumber: string;
  internationalFormat: string;
  nationalFormat: string;
  e164Format: string;
}

const COUNTRIES: { name: string; code: string; dial: string; pattern: RegExp; example: string; format: (n: string) => { area: string; national: string } }[] = [
  {
    name: "United States", code: "US", dial: "+1",
    pattern: /^(?:\+1)?[\s.-]?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})$/,
    example: "+1 (555) 123-4567",
    format: (n) => ({ area: n.slice(0, 3), national: n.slice(3) }),
  },
  {
    name: "United Kingdom", code: "GB", dial: "+44",
    pattern: /^(?:\+44|0044|0)?[\s.-]?(\d{2,4})[\s.-]?(\d{3,4})[\s.-]?(\d{3,4})$/,
    example: "+44 20 7946 0958",
    format: (n) => ({ area: n.slice(0, 2), national: n.slice(2) }),
  },
  {
    name: "India", code: "IN", dial: "+91",
    pattern: /^(?:\+91|0091|0)?[\s.-]?(\d{5})[\s.-]?(\d{5})$/,
    example: "+91 98765 43210",
    format: (n) => ({ area: n.slice(0, 5), national: n.slice(5) }),
  },
  {
    name: "Germany", code: "DE", dial: "+49",
    pattern: /^(?:\+49|0049|0)?[\s.-]?(\d{2,5})[\s.-]?(\d{4,12})$/,
    example: "+49 30 12345678",
    format: (n) => ({ area: n.slice(0, 3), national: n.slice(3) }),
  },
  {
    name: "France", code: "FR", dial: "+33",
    pattern: /^(?:\+33|0033|0)?[\s.-]?(\d{1})[\s.-]?(\d{2})[\s.-]?(\d{2})[\s.-]?(\d{2})[\s.-]?(\d{2})$/,
    example: "+33 1 23 45 67 89",
    format: (n) => ({ area: n.slice(0, 1), national: n.slice(1) }),
  },
  {
    name: "Japan", code: "JP", dial: "+81",
    pattern: /^(?:\+81|0081|0)?[\s.-]?(\d{1,4})[\s.-]?(\d{1,4})[\s.-]?(\d{4})$/,
    example: "+81 3 1234 5678",
    format: (n) => ({ area: n.slice(0, 2), national: n.slice(2) }),
  },
  {
    name: "Australia", code: "AU", dial: "+61",
    pattern: /^(?:\+61|0061|0)?[\s.-]?(\d{1})[\s.-]?(\d{4})[\s.-]?(\d{4})$/,
    example: "+61 2 1234 5678",
    format: (n) => ({ area: n.slice(0, 1), national: n.slice(1) }),
  },
  {
    name: "Brazil", code: "BR", dial: "+55",
    pattern: /^(?:\+55|0055|0)?[\s.-]?\(?(\d{2})\)?[\s.-]?(\d{5})[\s.-]?(\d{4})$/,
    example: "+55 11 91234 5678",
    format: (n) => ({ area: n.slice(0, 2), national: n.slice(2) }),
  },
  {
    name: "Canada", code: "CA", dial: "+1",
    pattern: /^(?:\+1)?[\s.-]?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})$/,
    example: "+1 (416) 555-1234",
    format: (n) => ({ area: n.slice(0, 3), national: n.slice(3) }),
  },
  {
    name: "China", code: "CN", dial: "+86",
    pattern: /^(?:\+86|0086|0)?[\s.-]?(\d{3})[\s.-]?(\d{4})[\s.-]?(\d{4})$/,
    example: "+86 138 1234 5678",
    format: (n) => ({ area: n.slice(0, 3), national: n.slice(3) }),
  },
  {
    name: "Mexico", code: "MX", dial: "+52",
    pattern: /^(?:\+52|0052)?[\s.-]?(\d{2})[\s.-]?(\d{4})[\s.-]?(\d{4})$/,
    example: "+52 55 1234 5678",
    format: (n) => ({ area: n.slice(0, 2), national: n.slice(2) }),
  },
  {
    name: "South Korea", code: "KR", dial: "+82",
    pattern: /^(?:\+82|0082|0)?[\s.-]?(\d{1,2})[\s.-]?(\d{3,4})[\s.-]?(\d{4})$/,
    example: "+82 2 1234 5678",
    format: (n) => ({ area: n.slice(0, 2), national: n.slice(2) }),
  },
  {
    name: "Italy", code: "IT", dial: "+39",
    pattern: /^(?:\+39|0039|0)?[\s.-]?(\d{2,4})[\s.-]?(\d{4,8})$/,
    example: "+39 06 12345678",
    format: (n) => ({ area: n.slice(0, 3), national: n.slice(3) }),
  },
  {
    name: "Spain", code: "ES", dial: "+34",
    pattern: /^(?:\+34|0034)?[\s.-]?(\d{3})[\s.-]?(\d{3})[\s.-]?(\d{3})$/,
    example: "+34 612 345 678",
    format: (n) => ({ area: n.slice(0, 3), national: n.slice(3) }),
  },
  {
    name: "Netherlands", code: "NL", dial: "+31",
    pattern: /^(?:\+31|0031|0)?[\s.-]?(\d{1,4})[\s.-]?(\d{4,8})$/,
    example: "+31 20 1234567",
    format: (n) => ({ area: n.slice(0, 2), national: n.slice(2) }),
  },
];

function parsePhoneNumber(input: string, countryCode: string): PhoneInfo {
  const cleaned = input.replace(/[^\d+]/g, "");
  const country = COUNTRIES.find((c) => c.code === countryCode);

  if (!country) {
    return {
      valid: false, raw: input, countryCode: "", countryName: "Unknown",
      areaCode: "", nationalNumber: "", internationalFormat: "",
      nationalFormat: "", e164Format: "",
    };
  }

  const match = input.match(country.pattern);
  if (!match) {
    return {
      valid: false, raw: input, countryCode: country.code, countryName: country.name,
      areaCode: "", nationalNumber: "", internationalFormat: "",
      nationalFormat: "", e164Format: "",
    };
  }

  const digits = cleaned.replace(/^\+\d+/, "").replace(/^0+/, "");
  const { area, national } = country.format(digits);
  const e164 = country.dial + digits;

  return {
    valid: true,
    raw: input,
    countryCode: country.code,
    countryName: country.name,
    areaCode: area,
    nationalNumber: digits,
    internationalFormat: country.dial + " " + area + " " + national,
    nationalFormat: "0" + area + " " + national,
    e164Format: e164,
  };
}

export function PhoneNumberParser() {
  const [input, setInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [copiedField, setCopiedField] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return parsePhoneNumber(input.trim(), selectedCountry);
  }, [input, selectedCountry]);

  const copy = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1500);
  }, []);

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountry);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name} ({c.dial})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Phone Number</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedCountryData?.example || "+1 555 123 4567"}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
          />
        </div>
      </div>

      {selectedCountryData && (
        <p className="text-xs text-surface-500 dark:text-dark-muted">
          Example: {selectedCountryData.example}
        </p>
      )}

      {result && (
        <div className="space-y-2">
          <div className={`rounded-lg border p-3 ${result.valid ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
            <p className={`text-sm font-medium ${result.valid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
              {result.valid ? "Valid Phone Number" : "Invalid Phone Number"}
            </p>
          </div>

          {result.valid && (
            <div className="space-y-2">
              {[
                { label: "Country", value: `${result.countryName} (${result.countryCode})` },
                { label: "Country Code", value: result.countryCode },
                { label: "Area Code", value: result.areaCode },
                { label: "National Number", value: result.nationalNumber },
                { label: "International Format", value: result.internationalFormat },
                { label: "National Format", value: result.nationalFormat },
                { label: "E.164 Format", value: result.e164Format },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-white px-3 py-2 dark:border-dark-border dark:bg-dark-bg">
                  <div>
                    <p className="text-xs text-surface-500 dark:text-dark-muted">{field.label}</p>
                    <p className="text-sm font-mono text-surface-900 dark:text-dark-text">{field.value}</p>
                  </div>
                  <button
                    onClick={() => copy(field.value, field.label)}
                    className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
                  >
                    {copiedField === field.label ? "Copied!" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        All parsing is done client-side. Phone numbers are not sent to any server.
      </p>
    </div>
  );
}
