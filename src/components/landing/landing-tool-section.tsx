"use client";

import { useEffect } from "react";
import { ToolInterface } from "@/components/tools/dynamic-tool-loader";
import { TryExamples } from "@/components/ui/try-examples";
import { dispatchLoadExample } from "@/lib/load-example";
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
 * Prefill pattern: most tools wire `useLoadExample(slug, (text) => ...)`
 * in v1.6.0; the simplest portable prefill is to dispatch a
 * `devstackio:load-example` event with the value of the first prefill
 * key on mount. Tools that don't subscribe are unaffected. PR 2 will
 * extend this for tools that need multiple prefill keys (e.g. unit
 * converter needs `value` + `fromUnit` + `toUnit`).
 *
 * The same TryExamples strip from /tools/<slug> pages renders below
 * the tool so the user can pick a different value once the page is loaded.
 */
export function LandingToolSection({ tool, prefill, examples }: LandingToolSectionProps) {
  const firstValue = Object.values(prefill)[0];

  useEffect(() => {
    if (firstValue) {
      dispatchLoadExample(tool.slug, firstValue);
    }
  }, [tool.slug, firstValue]);

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
