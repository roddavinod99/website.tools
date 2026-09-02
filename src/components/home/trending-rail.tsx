import Link from "next/link";
import {
  ArrowRight, Flame, TrendingUp,
  Braces, Key, Database, FingerprintPattern, QrCode, Lock, Sparkles,
  Wand, Hash, ImageMinus, Clock, Crop, FileCode, Globe, Link as LinkIcon,
  Monitor, Network, Search, SearchCode, Shield, Table, FileText,
  type LucideIcon,
} from "lucide-react";
import { ToolLink } from "@/components/ui/tool-link";
import type { Tool } from "@/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Braces, Key, Database, FingerprintPattern, QrCode, Lock, Sparkles,
  Wand, Hash, ImageMinus, Clock, Crop, FileCode, Globe, LinkIcon, Monitor,
  Network, Search, SearchCode, Shield, Table, FileText,
};

/**
 * TrendingRail
 *
 * Server-rendered "Trending now" rail for the home page. Surfaces the
 * `trending: true` subset of the registry (4 tools today). The visual
 * shape mirrors FeaturedTools so the two rails read as a single
 * discoverability block above the first ad.
 */
export function TrendingRail({ trendingTools }: { trendingTools: Tool[] }) {
  if (trendingTools.length === 0) return null;

  return (
    <section className="border-t border-surface-200 bg-surface-50/30 dark:border-dark-border dark:bg-dark-surface/30">
      <div className="container py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
                Trending now
              </h2>
              <p className="mt-1 text-surface-600 dark:text-dark-muted">
                What developers are reaching for this week
              </p>
            </div>
          </div>
          <Link
            href="/tools?sort=popular"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all popular
            <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingTools.slice(0, 4).map((tool) => {
            const Icon = ICON_MAP[tool.icon] ?? TrendingUp;
            return (
              <ToolLink
                key={tool.id}
                slug={tool.slug}
                className="group relative flex flex-col rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Flame className="h-2.5 w-2.5" aria-hidden="true" />
                    Trending
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-surface-900 dark:text-dark-text group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="mt-1 flex-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                  {tool.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-surface-600 dark:text-dark-muted">
                    {tool.category}
                  </span>
                </div>
              </ToolLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
