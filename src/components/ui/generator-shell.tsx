"use client";

import { ReactNode } from "react";
import { ToolShell, ToolWorkspace, ActionBar, OptionPanel } from "./index";

interface GeneratorShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
  configPanel?: ReactNode;
  preview?: ReactNode;
  outputActions?: ReactNode;
  presets?: { label: string; onClick: () => void }[];
  className?: string;
}

export function GeneratorShell({
  title,
  description,
  children,
  configPanel,
  preview,
  outputActions,
  presets,
  className = "",
}: GeneratorShellProps) {
  return (
    <ToolShell
      tool={{ name: title || "", category: "Generators", description: description || "" }}
      className={className}
    >
      <ToolWorkspace>
        {title && (
          <header className="space-y-2">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-dark-text">{title}</h1>
            {description && <p className="text-base text-surface-500 dark:text-dark-muted">{description}</p>}
          </header>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4">
            {children}
            {configPanel && (
              <OptionPanel title="Configuration" defaultOpen={true}>
                {configPanel}
              </OptionPanel>
            )}
            {presets && presets.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-result-secondary">Presets</h3>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p, i) => (
                    <button
                      key={i}
                      onClick={p.onClick}
                      className="rounded border border-tool-border bg-tool-surface px-3 py-1 text-sm text-result-primary hover:bg-tool-border transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
          <section className="space-y-4">
            {preview && (
              <div className="rounded-lg border border-tool-border bg-tool-surface p-4">
                <h3 className="text-sm font-medium text-result-secondary mb-2">Preview</h3>
                {preview}
              </div>
            )}
            {outputActions && (
              <ActionBar primary={outputActions} secondary={[]} />
            )}
          </section>
        </div>
      </ToolWorkspace>
    </ToolShell>
  );
}