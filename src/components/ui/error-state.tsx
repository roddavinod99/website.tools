"use client";

import { Button } from "./button";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  retry?: () => void;
  helpLink?: { label: string; href: string };
  dismiss?: () => void;
  className?: string;
}

export function ErrorState({ message, retry, helpLink, dismiss, className = "" }: ErrorStateProps) {
  return (
    <div className={`rounded-xl border border-result-error bg-red-50 dark:bg-red-900/20 p-4 ${className}`} role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-result-error mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-medium text-result-error">{message}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {retry && (
              <Button variant="outline" size="sm" onClick={retry}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                Retry
              </Button>
            )}
            {helpLink && (
              <a href={helpLink.href} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline">
                {helpLink.label}
              </a>
            )}
            {dismiss && (
              <button onClick={dismiss} className="text-sm text-result-secondary hover:text-result-primary">
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}