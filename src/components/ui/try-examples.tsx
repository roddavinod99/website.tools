"use client";

import { Play } from "lucide-react";

interface TryExamplesProps {
  examples: string[];
  onExampleSelect: (example: string) => void;
  label?: string;
  /**
   * True while the lazy tool component is still loading. Buttons render
   * disabled (with an honest label) instead of accepting clicks no
   * subscriber can hear yet.
   */
  disabled?: boolean;
}

export function TryExamples({ examples, onExampleSelect, label = "Try an example", disabled = false }: TryExamplesProps) {
  if (!examples.length) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">{label}:</span>
      {examples.map((ex, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onExampleSelect(ex)}
          disabled={disabled}
          aria-busy={disabled}
          title={disabled ? "Loading tool…" : `Load example ${i + 1}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] dark:bg-[var(--color-surface)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
          aria-label={`Load example ${i + 1}`}
        >
          <Play className="h-3 w-3" aria-hidden="true" />
          Example {i + 1}
        </button>
      ))}
    </div>
  );
}