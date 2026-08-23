"use client";

import { ReactNode } from "react";
import { ToolShell, ToolWorkspace, ActionBar, ResultCard, Collapsible, DataTable } from "./index";

type Row = Record<string, unknown>;

interface CalculatorShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
  primaryResult?: {
    label: string;
    value: ReactNode;
    sublabel?: string;
    actions?: ReactNode;
  };
  breakdown?: {
    columns: { key: string; header: string; render?: (row: Row) => ReactNode }[];
    data: Row[];
    keyExtractor: (row: Row) => string;
  };
  assumptions?: ReactNode;
  exportAction?: ReactNode;
  className?: string;
}

export function CalculatorShell({
  title,
  description,
  children,
  primaryResult,
  breakdown,
  assumptions,
  exportAction,
  className = "",
}: CalculatorShellProps) {
  return (
    <ToolShell
      tool={{ name: title || "", category: "Finance", description: description || "" }}
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
        {primaryResult && (
          <ResultCard
            label={primaryResult.label}
            value={primaryResult.value}
            sublabel={primaryResult.sublabel}
            actions={primaryResult.actions}
            className="mt-4"
          />
        )}
        {breakdown && (
          <Collapsible id="breakdown" title="Breakdown" defaultOpen={true}>
            <DataTable
              columns={breakdown.columns}
              data={breakdown.data}
              keyExtractor={breakdown.keyExtractor}
              searchable={false}
              sortable={false}
            />
          </Collapsible>
        )}
        {assumptions && (
          <Collapsible id="assumptions" title="Assumptions" defaultOpen={false}>
            {assumptions}
          </Collapsible>
        )}
        <ActionBar
          primary={exportAction}
          secondary={[]}
          className="mt-4"
        />
      </ToolWorkspace>
    </ToolShell>
  );
}