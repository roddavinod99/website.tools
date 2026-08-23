"use client";

import { ReactNode } from "react";
import { ToolHeader } from "./tool-header";
import { ToolWorkspace } from "./tool-workspace";

interface ToolShellProps {
  tool: {
    name: string;
    category: string;
    description: string;
    featured?: boolean;
    trending?: boolean;
    new?: boolean;
  };
  children: ReactNode;
  headerActions?: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export function ToolShell({
  tool,
  children,
  headerActions,
  sidebar,
  className = "",
}: ToolShellProps) {
  return (
    <div className={`container py-6 md:py-8 lg:py-10 ${className}`}>
      <ToolHeader tool={tool} actions={headerActions} />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 mt-8">
        <div className="max-w-3xl">
          <ToolWorkspace>{children}</ToolWorkspace>
        </div>
        {sidebar && (
          <aside className="mt-8 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
}