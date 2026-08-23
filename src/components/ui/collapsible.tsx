"use client";

import { ChevronRight } from "lucide-react";
import React from "react";

interface CollapsibleProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Collapsible({ id, title, children, defaultOpen = false, icon, className = "" }: CollapsibleProps) {
  return (
    <details id={id} className={`group rounded-xl border border-tool-border bg-tool-surface ${className}`} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-result-primary">
          {icon && <span className="text-result-secondary">{icon}</span>}
          {title}
        </h2>
        <ChevronRight className="h-4 w-4 flex-shrink-0 text-result-secondary transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>
      <div className="px-4 pb-4 animate-fade-in">{children}</div>
    </details>
  );
}