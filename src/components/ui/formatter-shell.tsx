"use client";

import { ReactNode } from "react";
import { ToolShell, ToolWorkspace, ResultCard, OptionPanel, StatCard } from "./index";

interface FormatterShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
  primaryResult?: {
    label: string;
    value: ReactNode;
    sublabel?: string;
    actions?: ReactNode;
  };
  stats?: { label: string; value: ReactNode }[];
  options?: ReactNode;
  className?: string;
}

export function FormatterShell({
  title,
  description,
  children,
  primaryResult,
  stats,
  options,
  className = "",
}: FormatterShellProps) {
  return (
    <ToolShell
      tool={{ name: title || "", category: "Formatters", description: description || "" }}
      className={className}
    >
      <ToolWorkspace>
        {title && (
          <header className="space-y-2">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-dark-text">{title}</h1>
            {description && <p className="text-base text-surface-500 dark:text-dark-muted">{description}</p>}
          </header>
        )}
        <section className="space-y-4">{children}</section>
        {stats && stats.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-5 mb-6">
            {stats.map((stat, i) => (
              <StatCard key={i} label={stat.label} value={stat.value} />
            ))}
          </div>
        )}
        {primaryResult && (
          <ResultCard
            label={primaryResult.label}
            value={primaryResult.value}
            sublabel={primaryResult.sublabel}
            actions={primaryResult.actions}
            className="mt-4"
          />
        )}
        {options && (
          <OptionPanel title="Options" defaultOpen={false}>
            {options}
          </OptionPanel>
        )}
      </ToolWorkspace>
    </ToolShell>
  );
}