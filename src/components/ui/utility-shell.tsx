"use client";

import { ReactNode } from "react";
import { ToolShell, ToolWorkspace, ActionBar, Collapsible, StatCard } from "./index";

interface UtilityShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode[];
  stats?: { label: string; value: ReactNode }[];
  advancedOptions?: ReactNode;
  className?: string;
}

export function UtilityShell({
  title,
  description,
  children,
  primaryAction,
  secondaryActions,
  stats,
  advancedOptions,
  className = "",
}: UtilityShellProps) {
  return (
    <ToolShell
      tool={{ name: title || "", category: "Utilities", description: description || "" }}
      className={className}
    >
      <ToolWorkspace>
        {title && (
          <header className="space-y-2">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-dark-text">{title}</h1>
            {description && <p className="text-base text-surface-500 dark:text-dark-muted">{description}</p>}
          </header>
        )}
        {stats && stats.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {stats.map((stat, i) => (
              <StatCard key={i} label={stat.label} value={stat.value} />
            ))}
          </div>
        )}
        <section className="space-y-4">{children}</section>
        {primaryAction && (
          <ActionBar primary={primaryAction} secondary={secondaryActions} className="mt-4" />
        )}
        {advancedOptions && (
          <Collapsible id="advanced-options" title="Advanced options" defaultOpen={false}>
            {advancedOptions}
          </Collapsible>
        )}
      </ToolWorkspace>
    </ToolShell>
  );
}