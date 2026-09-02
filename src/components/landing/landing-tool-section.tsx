"use client";

import { useEffect } from "react";
import { ToolInterface } from "@/components/tools/dynamic-tool-loader";
import { TryExamples } from "@/components/ui/try-examples";
import { dispatchLoadExample, dispatchPrefillTool } from "@/lib/load-example";
import type { Tool } from "@/types";

interface LandingToolSectionProps {
  tool: Pick<Tool, "slug" | "name">;
  /** Pre-fill values forwarded into the tool's primary input on mount */
  prefill: Record<string, string>;
  /** Examples the user can one-click into the tool */
  examples?: string[];
}

/**
 * Client island that mounts the canonical tool inside a long-tail
 * /convert/<category>/<slug> landing page.
 *
 * Prefill pattern: the landing-page route hands us a Record<string, string>
 * prefill map (e.g. { value: "1", fromUnit: "m", toUnit: "ft", category: "length" }).
 * We dispatch two events on mount:
 *   1. devstackio:prefill-tool — the full map. Multi-input tools (unit
 *      converter, mortgage, BMI) subscribe to this and apply all keys.
 *   2. devstackio:load-example — the first value. Single-input tools
 *      (JSON formatter, regex tester) keep their existing subscription.
 *
 * Both events are no-ops for tools that don't subscribe. The
 * TryExamples strip from /tools/<slug> pages renders below the tool
 * so the user can pick a different value once the page is loaded.
 */
export function LandingToolSection({ tool, prefill, examples }: LandingToolSectionProps) {
  const firstValue = Object.values(prefill)[0];

  useEffect(() => {
    dispatchPrefillTool(tool.slug, prefill);
    if (firstValue) {
      dispatchLoadExample(tool.slug, firstValue);
    }
  }, [tool.slug, prefill, firstValue]);

  return (
    <div>
      <ToolInterface slug={tool.slug} name={tool.name} />
      {examples && examples.length > 0 && (
        <div className="mt-3">
          <TryExamples
            examples={examples}
            onExampleSelect={(text) => dispatchLoadExample(tool.slug, text)}
          />
        </div>
      )}
    </div>
  );
}
