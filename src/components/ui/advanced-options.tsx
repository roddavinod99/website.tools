"use client";

import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedOptionsProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
  triggerLabel?: string;
}

export function AdvancedOptions({
  children,
  title = "Advanced options",
  defaultOpen = false,
  triggerLabel,
}: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-surface-200 dark:border-dark-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium text-surface-700 hover:bg-surface-50 dark:text-dark-text dark:hover:bg-dark-surface transition-colors",
          isOpen && "bg-surface-50 dark:bg-dark-surface/50"
        )}
        aria-expanded={isOpen}
        aria-controls="advanced-options-panel"
      >
        <span className="flex items-center gap-2">
          <Settings className="h-4 w-4 flex-shrink-0 text-surface-500 dark:text-dark-muted" aria-hidden="true" />
          {triggerLabel || title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 text-surface-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id="advanced-options-panel"
        role="region"
        aria-label={title}
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 pt-2 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

interface OptionGroupProps {
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function OptionGroup({ title, children, description }: OptionGroupProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold text-surface-600 dark:text-dark-muted uppercase tracking-wide">
        {title}
      </legend>
      {description && <p className="text-xs text-surface-500 dark:text-dark-muted">{description}</p>}
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

interface OptionRowProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function OptionRow({ children, columns = 1 }: OptionRowProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3", gridClasses[columns])}>
      {children}
    </div>
  );
}