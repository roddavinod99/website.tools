"use client";

import { ReactNode } from "react";

interface ToolWorkspaceProps {
  children: ReactNode;
  className?: string;
}

export function ToolWorkspace({ children, className = "" }: ToolWorkspaceProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {children}
    </div>
  );
}