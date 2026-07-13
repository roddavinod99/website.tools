"use client";

import { useState, useCallback, useMemo } from "react";
import parsePhoneNumberFromString, {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

function booleanToHumanReadable(value: boolean | undefined): string {
  return value ? "Yes" : "No";
}

function formatType(type: string | undefined): string {
  if (!type) return "Unknown";
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function PhoneNumberParser() {
  const [rawPhone, setRawPhone] = useState("");
  const [defaultCountry, setDefaultCountry] = useState<CountryCode>("US");
  const [copiedField, setCopiedField] = useState("");

  const countriesOptions = useMemo(
    () =>
      getCountries().map((code) => ({
        label: `${code} (+${getCountryCallingCode(code)})`,
        value: code,
      })),
    []
  );

  const parsed = useMemo(() => {
    if (!rawPhone.trim()) return undefined;
    try {
      return parsePhoneNumberFromString(rawPhone, defaultCountry);
    } catch {
      return undefined;
    }
  }, [rawPhone, defaultCountry]);

  const parsedDetails = useMemo(() => {
    if (!parsed) return undefined;
    return [
      { label: "Country", value: parsed.country || "" },
      { label: "Country calling code", value: parsed.countryCallingCode || "" },
      { label: "Is valid?", value: booleanToHumanReadable(parsed.isValid()) },
      { label: "Is possible?", value: booleanToHumanReadable(parsed.isPossible()) },
      { label: "Type", value: formatType(parsed.getType()) },
      { label: "International format", value: parsed.formatInternational() || "" },
      { label: "National format", value: parsed.formatNational() || "" },
      { label: "E.164 format", value: parsed.format("E.164") || "" },
      { label: "RFC3966 format", value: parsed.format("RFC3966") || "" },
    ].filter((item) => item.value);
  }, [parsed]);

  const copy = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1500);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Default country code:</label>
        <select
          value={defaultCountry}
          onChange={(e) => setDefaultCountry(e.target.value as CountryCode)}
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        >
          {countriesOptions.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Phone number:</label>
        <input
          type="text"
          value={rawPhone}
          onChange={(e) => setRawPhone(e.target.value)}
          placeholder="Enter a phone number"
          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted"
        />
      </div>

      {parsedDetails && (
        <div className="space-y-2">
          {parsedDetails.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-surface-200 bg-white px-3 py-2 dark:border-dark-border dark:bg-dark-bg">
              <div>
                <p className="text-xs text-surface-500 dark:text-dark-muted">{item.label}</p>
                <p className="text-sm font-mono text-surface-900 dark:text-dark-text">{item.value}</p>
              </div>
              <button
                onClick={() => copy(item.value, item.label)}
                className="rounded-lg border border-surface-200 px-3 py-1 text-xs font-medium text-surface-700 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface"
              >
                {copiedField === item.label ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
        All parsing is done client-side. Phone numbers are not sent to any server.
      </p>
    </div>
  );
}
