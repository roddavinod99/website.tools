"use client";

import { ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-tool-border bg-tool-surface ${className}`}>
      {icon && <div className="text-result-secondary mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-result-primary mb-2">{title}</h3>
      <p className="text-result-secondary max-w-sm mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}