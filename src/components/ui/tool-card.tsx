"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExternalLink, Zap, Star } from "lucide-react";

export type ToolCardVariant = "default" | "compact" | "featured" | "related";
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
}

interface ToolCardProps {
  tool: ToolData;
  variant?: ToolCardVariant;
  size?: ToolCardSize;
  className?: string;
  showPopularity?: boolean;
  showCategory?: boolean;
  onClick?: () => void;
}

const sizeClasses: Record<ToolCardSize, { padding: string; title: string; desc: string; gap: string }> = {
  sm: { padding: "p-3", title: "text-sm font-semibold", desc: "text-xs", gap: "gap-2" },
  md: { padding: "p-5", title: "font-semibold text-surface-900 dark:text-dark-text", desc: "text-sm text-surface-500 dark:text-dark-muted", gap: "gap-3" },
  lg: { padding: "p-6", title: "text-lg font-semibold text-surface-900 dark:text-dark-text", desc: "text-base text-surface-500 dark:text-dark-muted", gap: "gap-4" },
};

const variantClasses: Record<ToolCardVariant, string> = {
  default: "group rounded-xl border border-surface-200 bg-white shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface",
  compact: "group rounded-lg border border-surface-200 bg-white transition-all duration-150 hover:border-brand-300 dark:border-dark-border dark:bg-dark-surface",
  featured: "group relative rounded-2xl border border-surface-200 bg-white p-6 shadow-lg transition-all duration-150 hover:shadow-xl dark:border-dark-border dark:bg-dark-surface",
  related: "group rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface",
};

export function ToolCard({ 
  tool, 
  variant = "default", 
  size = "md", 
  className, 
  showPopularity = true, 
  showCategory = true,
  onClick,
}: ToolCardProps) {
  const sizes = sizeClasses[size];
  const isFeatured = variant === "featured";
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      href={`/tools/${tool.slug}`}
      onClick={handleClick}
      className={cn(
        "flex flex-col",
        variantClasses[variant],
        sizes.padding,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex items-center gap-2", sizes.gap)}>
          {showCategory && (
            <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              {tool.category}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {tool.new && (
              <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                New
              </span>
            )}
            {tool.trending && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Zap className="h-2.5 w-2.5" />
                Hot
              </span>
            )}
            {tool.featured && !isFeatured && (
              <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Star className="h-2.5 w-2.5" />
                Featured
              </span>
            )}
          </div>
        </div>
        {showPopularity && (
          <span className="shrink-0 text-xs text-surface-400 dark:text-dark-muted">
            {tool.popularity}%
          </span>
        )}
      </div>
      
      <h3 className={cn("mt-2 truncate", sizes.title)}>
        {tool.name}
        {isFeatured && <ExternalLink className="inline-block h-3.5 w-3.5 ml-1 text-surface-400 group-hover:text-brand-500" />}
      </h3>
      
      <p className={cn("mt-1 line-clamp-2", sizes.desc)}>
        {tool.description}
      </p>

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