import { Fragment } from "react";
import type { Tool } from "@/types";
import { ToolCard } from "@/components/ui/tool-card";
import { AdBanner } from "@/components/ads";
import { adSlots } from "@/lib/data/ads";
import { featuresBySlug } from "@/lib/data/tool-features";

interface ToolGridSectionProps {
  tools: Tool[];
  midAdSlot?: string;
  variant?: "default" | "compact";
  size?: "sm" | "md" | "lg";
  gridClassName?: string;
  showPopularity?: boolean;
  showCategory?: boolean;
}

export function ToolGridSection({
  tools,
  midAdSlot = adSlots.toolsMid,
  variant = "default",
  size = "md",
  gridClassName = "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  showPopularity = true,
  showCategory = true,
}: ToolGridSectionProps) {
  if (tools.length === 0) {
    return (
      <p className="col-span-full text-center text-[var(--color-text-muted)] py-12">
        No tools to display.
      </p>
    );
  }

  const midIndex = Math.floor(tools.length / 2);

  return (
    <div className={gridClassName}>
      {tools.map((tool, index) => (
        <Fragment key={tool.id}>
          {index === midIndex && midAdSlot && (
            <div className="col-span-full">
              <AdBanner className="my-8" slot={midAdSlot} />
            </div>
          )}
          <ToolCard
            tool={{
              ...tool,
              features: featuresBySlug[tool.slug],
            }}
            variant={variant}
            size={size}
            showPopularity={showPopularity}
            showCategory={showCategory}
          />
        </Fragment>
      ))}
    </div>
  );
}
