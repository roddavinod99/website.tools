"use client";

import { useState } from "react";
import { ReactNode } from "react";
import { Button } from "./button";
import { Copy } from "lucide-react";
import { copyText } from "@/lib/clipboard";

interface ResultCardProps {
  label: string;
  value: ReactNode;
  sublabel?: string;
  timestamp?: string;
  actions?: ReactNode;
  className?: string;
  copyValue?: string;
  copyLabel?: string;
}

export function ResultCard({
  label,
  value,
  sublabel,
  timestamp,
  actions,
  className = "",
  copyValue,
  copyLabel,
}: ResultCardProps) {
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
    <div
      className={`rounded-xl border border-tool-border bg-tool-surface p-5 shadow-[var(--tool-card-shadow)] ${className}`}
      data-testid="tool-output"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-result-secondary">
            {label}
          </p>
          <p className="mt-1 text-xl font-semibold text-result-primary">{value}</p>
          {sublabel && (
            <p className="mt-1 text-sm text-result-secondary">{sublabel}</p>
          )}
          {timestamp && (
            <p className="mt-2 text-xs text-result-secondary">
              Rates as of {timestamp}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {copyValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              aria-label={copyLabel || `Copy ${label}`}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </Button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}