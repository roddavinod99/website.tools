"use client";

import { ReactNode } from "react";
import { ToolShell, ToolWorkspace, ActionBar, ResultCard, Collapsible } from "./index";

interface Finding {
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  remediation?: string;
}

interface SecurityShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
  findings?: Finding[];
  primaryResult?: {
    label: string;
    value: ReactNode;
    sublabel?: string;
  };
  details?: ReactNode;
  className?: string;
}

const severityColors: Record<Finding["severity"], string> = {
  critical: "text-red-600 dark:text-red-400",
  high: "text-orange-600 dark:text-orange-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-blue-600 dark:text-blue-400",
  info: "text-gray-600 dark:text-gray-400",
};

export function SecurityShell({
  title,
  description,
  children,
  findings,
  primaryResult,
  details,
  className = "",
}: SecurityShellProps) {
  return (
    <ToolShell
      tool={{ name: title || "", category: "Security Tools", description: description || "" }}
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
            className="mt-4"
          />
        )}
        {findings && findings.length > 0 && (
          <Collapsible id="findings" title="Findings" defaultOpen={true}>
            <div className="space-y-3">
              {findings.map((f, i) => (
                <div key={i} className="rounded-lg border border-tool-border bg-tool-surface p-4">
                  <div className="flex items-start gap-3">
                    <span className={`font-semibold ${severityColors[f.severity]}`}>{f.severity.toUpperCase()}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-result-primary">{f.title}</h4>
                      <p className="text-sm text-result-secondary mt-1">{f.description}</p>
                      {f.remediation && (
                        <p className="text-sm text-success mt-2"><strong>Remediation:</strong> {f.remediation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Collapsible>
        )}
        {details && (
          <Collapsible id="details" title="Details" defaultOpen={false}>
            {details}
          </Collapsible>
        )}
        <ActionBar primary={null} secondary={[]} className="mt-4" />
      </ToolWorkspace>
    </ToolShell>
  );
}