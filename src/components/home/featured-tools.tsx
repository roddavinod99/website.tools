"use client";

import Link from "next/link";
import {
  Braces, Key, Database, FingerprintPattern, QrCode, Lock, Sparkles,
  Wand, Hash, ImageMinus, Clock, Crop, FileCode, Globe, Link as LinkIcon, Monitor,
  Network, Search, SearchCode, Shield, Table, ArrowRight, type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToolLink } from "@/components/ui/tool-link";
import type { Tool } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Braces, Key, Database, FingerprintPattern, QrCode, Lock, Sparkles,
  Wand, Hash, ImageMinus, Clock, Crop, FileCode, Globe, LinkIcon, Monitor,
  Network, Search, SearchCode, Shield, Table,
};

export function FeaturedTools({
  featuredTools,
}: {
  featuredTools: Tool[];
  featuresBySlug?: Record<string, string[]>;
}) {
  const topFeatured = featuredTools.slice(0, 8);

  return (
    <section className="border-t border-[var(--color-border)]" aria-labelledby="featured-heading">
      <div className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              Featured
            </p>
            <h2 id="featured-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
              Start with the Most Popular
            </h2>
            <p className="mt-2 text-base text-[var(--color-text-muted)] text-pretty">
              The tools developers reach for most
            </p>
          </div>
          <Link
            href="/tools"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            View all tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topFeatured.map((tool) => {
            const Icon = iconMap[tool.icon] || Braces;
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
                  <ArrowRight className="h-4 w-4 text-[var(--color-text-subtle)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
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
                  {tool.new && <Badge variant="new">New</Badge>}
                  {tool.trending && <Badge variant="warning">Trending</Badge>}
                </div>
              </ToolLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
