"use client";

import Link from "next/link";
import { Bookmark, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExternalLink, Zap, Star, ArrowRight } from "lucide-react";
import { usePinnedTools } from "@/lib/personalize";

export type ToolCardVariant = "default" | "compact" | "featured" | "related" | "home";
export type ToolCardSize = "sm" | "md" | "lg";

export interface ToolData {
  id: string;
  name: string;
  description: string;
  category: string;
  slug: string;
  popularity: number;
  featured?: boolean;
  trending?: boolean;
  new?: boolean;
  icon?: string;
  features?: string[];
}

interface ToolCardProps {
  tool: ToolData;
  variant?: ToolCardVariant;
  size?: ToolCardSize;
  className?: string;
  showPopularity?: boolean;
  showCategory?: boolean;
  showPin?: boolean;
  onClick?: () => void;
}

const sizeClasses: Record<ToolCardSize, { padding: string; title: string; desc: string; gap: string }> = {
  sm: { padding: "p-3", title: "text-sm font-semibold", desc: "text-xs", gap: "gap-2" },
  md: { padding: "p-4", title: "font-semibold text-surface-900 dark:text-dark-text", desc: "text-sm text-surface-500 dark:text-dark-muted", gap: "gap-3" },
  lg: { padding: "p-5", title: "text-lg font-semibold text-surface-900 dark:text-dark-text", desc: "text-base text-surface-500 dark:text-dark-muted", gap: "gap-4" },
};

const variantClasses: Record<ToolCardVariant, string> = {
  default: "group rounded-xl border border-surface-200 bg-white shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface",
  compact: "group rounded-lg border border-surface-200 bg-white transition-all duration-150 hover:border-brand-300 dark:border-dark-border dark:bg-dark-surface",
  featured: "group relative rounded-2xl border border-surface-200 bg-white p-5 shadow-lg transition-all duration-150 hover:shadow-xl dark:border-dark-border dark:bg-dark-surface",
  related: "group rounded-xl border border-surface-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface",
  home: "group relative rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface",
};

export function ToolCard({ 
  tool, 
  variant = "default", 
  size = "md", 
  className, 
  showPopularity = true, 
  showCategory = true,
  showPin = true,
  onClick,
}: ToolCardProps) {
  const sizes = sizeClasses[size];
  const isFeatured = variant === "featured";
  const isHome = variant === "home";
  const variantBase = variantClasses[variant];
  const { isPinned, toggle } = usePinnedTools();
  const pinned = isPinned(tool.slug);

  // For featured variant, padding is already in variant class, don't double-apply
  const paddingClass = variant === "featured" ? "" : sizes.padding;
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handlePin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(tool.slug);
  };

  return (
    <Link
      href={`/tools/${tool.slug}`}
      onClick={handleClick}
      className={cn(
        "flex flex-col",
        variantBase,
        paddingClass,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex items-center gap-2", sizes.gap)}>
          {showCategory && (
            <span className="shrink-0 rounded-full bg-[var(--selection-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
              {tool.category}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {tool.new && (
              <span className="rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                New
              </span>
            )}
            {tool.trending && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                Hot
              </span>
            )}
            {tool.featured && !isFeatured && (
              <span className="flex items-center gap-0.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                <Star className="h-2.5 w-2.5" aria-hidden="true" />
                Featured
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {showPin && (
            <button
              type="button"
              onClick={handlePin}
              aria-label={pinned ? `Unpin ${tool.name} from your favorites` : `Pin ${tool.name} to your favorites`}
              aria-pressed={pinned}
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                pinned
                  ? "border-purple-300 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:border-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                  : "border-surface-200 bg-white text-surface-400 hover:border-purple-300 hover:text-purple-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted"
              )}
            >
              {pinned ? <Check className="h-3 w-3" aria-hidden="true" /> : <Bookmark className="h-3 w-3" aria-hidden="true" />}
            </button>
          )}
          {showPopularity && tool.popularity >= 90 && (
            <span className="shrink-0 rounded-full bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium text-surface-600 dark:bg-dark-border dark:text-dark-muted">
              Most used
            </span>
          )}
        </div>
      </div>
      
      <h3 className={cn("mt-2 truncate", sizes.title)}>
        {tool.name}
        {isFeatured && <ExternalLink className="inline-block h-3.5 w-3.5 ml-1 text-surface-400 group-hover:text-brand-500 transition-colors" aria-hidden="true" />}
        {isHome && <ArrowRight className="inline-block h-3.5 w-3.5 ml-1 text-surface-400 group-hover:text-brand-500 transition-colors opacity-0 group-hover:opacity-100" aria-hidden="true" />}
      </h3>
      
      <p className={cn("mt-1 line-clamp-2", sizes.desc)}>
        {tool.description}
      </p>

      {tool.features && tool.features.length > 0 && size !== "sm" && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tool.features.slice(0, variant === "home" ? 4 : 3).map((feature) => (
            <li
              key={feature}
              className="rounded-full border border-surface-200 bg-surface-50 px-2 py-0.5 text-[10px] font-medium text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted"
            >
              {feature}
            </li>
          ))}
          {tool.features.length > (variant === "home" ? 4 : 3) && (
            <li className="rounded-full border border-dashed border-surface-300 px-2 py-0.5 text-[10px] font-medium text-surface-400 dark:border-dark-border dark:text-dark-muted">
              +{tool.features.length - (variant === "home" ? 4 : 3)} more
            </li>
          )}
        </ul>
      )}

      {isFeatured && (
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-surface-200 dark:border-dark-border">
          <span className="text-xs text-surface-400 dark:text-dark-muted">
            Part of DevStackIO platform
          </span>
          <span className="text-xs font-medium text-brand-500 dark:text-brand-400">
            Explore tool →
          </span>
        </div>
      )}
    </Link>
  );
}