"use client";

import { ReactNode } from "react";
import { Button } from "./button";
import { Copy } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { useState } from "react";

interface FieldGroupProps {
  label: string;
  value: ReactNode;
  helpText?: string;
  error?: string;
  copyable?: boolean;
  copyValue?: string;
  copyLabel?: string;
  className?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function FieldGroup({
  label,
  value,
  helpText,
  error,
  copyable = false,
  copyValue,
  copyLabel,
  className = "",
  children,
  actions,
}: FieldGroupProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyValue) return;
    const ok = await copyText(copyValue);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rounded-lg border p-3 ${error ? "border-result-error bg-red-50 dark:bg-red-900/20" : "border-tool-border bg-tool-surface"} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-result-secondary mb-1">{label}</label>
          <div className="text-result-primary">{value}</div>
          {children}
          {helpText && <p className="mt-1 text-xs text-result-secondary">{helpText}</p>}
          {error && <p className="mt-1 text-xs text-result-error">{error}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          {copyable && copyValue && (
            <Button variant="ghost" size="sm" onClick={handleCopy} aria-label={copyLabel || `Copy ${label}`}>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}