"use client";

import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className = "" }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-tool-border bg-tool-surface p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-result-secondary">
            {label}
          </p>
          <p className="mt-1 text-xl font-semibold text-result-primary">{value}</p>
          {trend && (
            <p className="mt-1 text-sm" style={{ color: trend.positive ? "var(--result-success)" : "var(--result-error)" }}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && <div className="text-result-secondary">{icon}</div>}
      </div>
    </div>
  );
}