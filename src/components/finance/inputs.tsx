"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-900 placeholder:text-surface-400 focus-ring dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-muted";

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}

export function Field({ label, children, hint, className }: FieldProps) {
  return (
    <div className={cn("w-full", className)}>
      <span className="mb-1 block text-sm font-medium text-surface-700 dark:text-dark-text">
        {label}
      </span>
      {children}
      {hint && <p className="mt-1 text-xs text-surface-400 dark:text-dark-muted">{hint}</p>}
    </div>
  );
}

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  ariaLabel?: string;
  allowDecimal?: boolean;
}

export function NumberInput({
  value,
  onChange,
  placeholder = "0",
  min,
  max,
  suffix,
  ariaLabel,
  allowDecimal = true,
}: NumberInputProps) {
  const handle = (raw: string) => {
    let next = raw;
    if (allowDecimal) {
      next = raw.replace(/[^0-9.]/g, "");
      const firstDot = next.indexOf(".");
      if (firstDot !== -1) {
        next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
      }
    } else {
      next = raw.replace(/[^0-9]/g, "");
    }
    if (min !== undefined) {
      const num = parseFloat(next);
      if (!isNaN(num) && num < min) next = String(min);
    }
    if (max !== undefined) {
      const num = parseFloat(next);
      if (!isNaN(num) && num > max) next = String(max);
    }
    onChange(next);
  };
  return (
    <div className="relative">
      <input
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        autoComplete="off"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => handle(e.target.value)}
        placeholder={placeholder}
        maxLength={20}
        className={cn(inputBase, "font-mono", suffix && "pr-14")}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-surface-400 dark:text-dark-muted">
          {suffix}
        </span>
      )}
    </div>
  );
}

interface PercentInputProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export function PercentInput({ value, onChange, ariaLabel }: PercentInputProps) {
  const handle = (raw: string) => {
    let next = raw.replace(/[^0-9.]/g, "");
    const firstDot = next.indexOf(".");
    if (firstDot !== -1) {
      next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
    }
    onChange(next);
  };
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => handle(e.target.value)}
        placeholder="5"
        className={cn(inputBase, "font-mono pr-8")}
      />
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-surface-400 dark:text-dark-muted">
        %
      </span>
    </div>
  );
}

interface SelectFieldProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  ariaLabel?: string;
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: SelectFieldProps<T>) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(inputBase, "cursor-pointer")}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}