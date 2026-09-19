"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NextStepCTAProps {
  suggestions: { tool: string; label: string }[];
  currentTool?: string;
}

/**
 * Placed directly under tool output on success per suggestions.md W2.
 * Fires GA4 event `tool_next_step_click` (suggestions.md:60) — free via
 * analytics-init.js / gtag. Uses URL params for shareable state (decision 3).
 * Styled with design tokens only (spec §10-13).
 */
export function NextStepCTA({ suggestions, currentTool }: NextStepCTAProps) {
  const router = useRouter();
  if (!suggestions.length) return null;

  const onClick = (target: string, label: string) => {
    // GA4 — no paid tool, uses existing gtag from public/analytics-init.js
    // per https://developers.google.com/g/analytics/devguides/collection/ga4/events
    try {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag === "function") {
        gtag("event", "tool_next_step_click", {
          current_tool: currentTool ?? "unknown",
          next_tool: target,
          label,
        });
      }
    } catch {
      // analytics is best-effort; never block navigation
    }
    router.push(`/tools/${target}`);
  };

  return (
    <section
      className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
      aria-labelledby="next-step-heading"
    >
      <h3 id="next-step-heading" className="mb-2 text-sm font-semibold text-[var(--color-text)]">
        Next steps
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <Button
            key={`${s.tool}-${i}`}
            variant="outline"
            size="sm"
            onClick={() => onClick(s.tool, s.label)}
            className="gap-1"
            aria-label={`Open ${s.label}`}
          >
            {s.label}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Button>
        ))}
      </div>
    </section>
  );
}