"use client";

import { ReactNode } from "react";
import { ToolShell, ToolWorkspace, ActionBar, Collapsible, OptionPanel } from "./index";

interface ImageShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
  dropzone?: ReactNode;
  preview?: ReactNode;
  options?: ReactNode;
  comparison?: ReactNode;
  downloadVariants?: ReactNode;
  className?: string;
}

export function ImageShell({
  title,
  description,
  children,
  dropzone,
  preview,
  options,
  comparison,
  downloadVariants,
  className = "",
}: ImageShellProps) {
  return (
    <ToolShell
      tool={{ name: title || "", category: "Image Tools", description: description || "" }}
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
        {dropzone && (
          <div className="rounded-lg border-2 border-dashed border-tool-border bg-tool-surface p-8 text-center">
            {dropzone}
          </div>
        )}
        {preview && (
          <div className="rounded-lg border border-tool-border bg-tool-surface p-4">
            <h3 className="text-sm font-medium text-result-secondary mb-2">Preview</h3>
            {preview}
          </div>
        )}
        {comparison && (
          <Collapsible id="comparison" title="Comparison" defaultOpen={true}>
            {comparison}
          </Collapsible>
        )}
        {options && (
          <OptionPanel title="Options" defaultOpen={false}>
            {options}
          </OptionPanel>
        )}
        {downloadVariants && (
          <ActionBar primary={downloadVariants} secondary={[]} className="mt-4" />
        )}
      </ToolWorkspace>
    </ToolShell>
  );
}