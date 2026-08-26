"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NextStepCTAProps {
  suggestions: { tool: string; label: string }[];
}

export function NextStepCTA({ suggestions }: NextStepCTAProps) {
  if (!suggestions.length) return null;

  return (
    <section className="mt-4 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface" aria-labelledby="next-step-heading">
      <h3 id="next-step-heading" className="mb-2 text-sm font-semibold text-surface-900 dark:text-dark-text">
        Next steps
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <Button
            key={`${s.tool}-${i}`}
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/tools/${s.tool}`}
            className="gap-1"
          >
            {s.label}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Button>
        ))}
      </div>
    </section>
  );
}