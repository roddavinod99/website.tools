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
    <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]" aria-labelledby="trending-heading">
      <div className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              Trending now
            </p>
            <h2 id="trending-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
              Trending now
            </h2>
            <p className="mt-2 text-base text-[var(--color-text-muted)] text-pretty">
              What developers are reaching for this week
            </p>
          </div>
          <Link
            href="/tools?sort=popular"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            View all popular
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingTools.slice(0, 4).map((tool) => {
            const Icon = ICON_MAP[tool.icon] ?? TrendingUp;
            return (
              <ToolLink
                key={tool.id}
                slug={tool.slug}
                className="group relative flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-all hover:border-[var(--color-border-strong)] hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-warning)]">
                    <Flame className="h-2.5 w-2.5" aria-hidden="true" />
                    Trending
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  {tool.name}
                </h3>
                <p className="mt-1 flex-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                  {tool.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">
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
