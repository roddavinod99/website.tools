"use client";

import { ReactNode } from "react";
import { ToolShell, ToolWorkspace, ActionBar, ResultCard, Collapsible, OptionPanel } from "./index";

interface CodecShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
  directionToggle?: ReactNode;
  formatOptions?: ReactNode;
  batchSupport?: ReactNode;
  primaryResult?: {
    label: string;
    value: ReactNode;
    sublabel?: string;
    actions?: ReactNode;
  };
  className?: string;
}

export function CodecShell({
  title,
  description,
  children,
  directionToggle,
  formatOptions,
  batchSupport,
  primaryResult,
  className = "",
}: CodecShellProps) {
  return (
    <ToolShell
      tool={{ name: title || "", category: "Encoders", description: description || "" }}
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
        {directionToggle && (
          <div className="flex justify-center my-2">{directionToggle}</div>
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
        {formatOptions && (
          <OptionPanel title="Format options" defaultOpen={false}>
            {formatOptions}
          </OptionPanel>
        )}
        {batchSupport && (
          <Collapsible id="batch-support" title="Batch processing" defaultOpen={false}>
            {batchSupport}
          </Collapsible>
        )}
        <ActionBar primary={null} secondary={[]} className="mt-4" />
      </ToolWorkspace>
    </ToolShell>
  );
}