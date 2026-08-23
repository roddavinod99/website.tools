"use client";

import React, { ReactNode } from "react";

interface ActionBarProps {
  primary?: ReactNode;
  secondary?: ReactNode[];
  className?: string;
}

export function ActionBar({ primary, secondary = [], className = "" }: ActionBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {primary && (
        <div className="flex items-center gap-2">
          {primary}
        </div>
      )}
      {secondary.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {secondary.map((action, i) => (
            <React.Fragment key={i}>{action}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}