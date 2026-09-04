"use client";

import { ChevronDown } from "lucide-react";

interface OptionPanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function OptionPanel({ title, children, defaultOpen = false, className = "" }: OptionPanelProps) {
  return (
    <details className={`group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] ${className}`} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)] transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}