"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { getCurrency } from "@/lib/data/currencies";

interface MoneyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  prefix?: string;
  placeholder?: string;
  hint?: string;
  min?: number;
  className?: string;
  disabled?: boolean;
}

export function MoneyInput({
  label,
  value,
  onChange,
  currency = "USD",
  prefix,
  placeholder,
  hint,
  min,
  className,
  disabled,
}: MoneyInputProps) {
  const id = useId();
  const currencyConfig = getCurrency(currency);
  const symbol = prefix ?? currencyConfig.symbolNative;
  const decimals = currencyConfig.decimals;

  const defaultPlaceholder = decimals === 0 ? "0" : "0".padEnd(decimals + 2, "0").replace("0.", "0.");
  const effectivePlaceholder = placeholder ?? defaultPlaceholder;

  const handleChange = (raw: string) => {
    let next = raw.replace(/[^0-9.]/g, "");
    const firstDot = next.indexOf(".");
    if (firstDot !== -1) {
      next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
    }
    if (next.startsWith(".")) next = `0${next}`;
    if (min !== undefined) {
      const num = parseFloat(next);
      if (!isNaN(num) && num < min) next = String(min);
    }
    onChange(next);
  };

  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-surface-700 dark:text-dark-text">
        {label}
      </label>
      <div className="relative">
        {symbol && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-surface-400 dark:text-dark-muted">
            {symbol}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={effectivePlaceholder}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus-ring dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted",
            disabled && "opacity-50 cursor-not-allowed",
            symbol && "pl-9"
          )}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">{hint}</p>}
    </div>
  );
}