"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface MoneyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  placeholder?: string;
  hint?: string;
  min?: number;
  className?: string;
}

export function MoneyInput({
  label,
  value,
  onChange,
  prefix = "$",
  placeholder = "0.00",
  hint,
  className,
}: MoneyInputProps) {
  const id = useId();
  const handleChange = (raw: string) => {
    let next = raw.replace(/[^0-9.]/g, "");
    const firstDot = next.indexOf(".");
    if (firstDot !== -1) {
      next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
    }
    if (next.startsWith(".")) next = `0${next}`;
    onChange(next);
  };

  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-surface-700 dark:text-dark-text">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-surface-400 dark:text-dark-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus-ring dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted",
            prefix && "pl-9"
          )}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">{hint}</p>}
    </div>
  );
}