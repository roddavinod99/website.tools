"use client";

import { ReactNode } from "react";
import { Badge } from "./badge";
import { ToolCapabilityBadges } from "./tool-capability-badges";

interface ToolHeaderProps {
  tool: {
    name: string;
    category: string;
    description: string;
    featured?: boolean;
    trending?: boolean;
    new?: boolean;
  };
  actions?: ReactNode;
  capabilities?: {
    worker: boolean;
    wasm: boolean;
    copy: boolean;
    download: boolean;
    validation: boolean;
    fileUpload: boolean;
    dragDrop: boolean;
    realTime: boolean;
    multipleInputs: boolean;
    comparison: boolean;
    syntaxHighlighting: boolean;
    tabs: boolean;
  };
}

export function ToolHeader({ tool, actions, capabilities }: ToolHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          {tool.category}
        </span>
        {tool.trending && <Badge variant="warning">Trending</Badge>}
        {tool.new && <Badge variant="new">New</Badge>}
        {tool.featured && <Badge variant="default">Featured</Badge>}
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
        {tool.name}
      </h1>
      <p className="text-base text-[var(--color-text-muted)] max-w-3xl">
        {tool.description}
      </p>
      {capabilities && (
        <div className="mt-3">
          <ToolCapabilityBadges capabilities={capabilities} />
        </div>
      )}
      {actions && <div className="mt-3">{actions}</div>}
    </header>
  );
}