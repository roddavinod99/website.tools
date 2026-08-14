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
  return (
    <section className="border-t border-surface-200 dark:border-dark-border">
      <div className="container py-16 md:py-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
              Featured Tools
            </h2>
            <p className="mt-1 text-surface-600 dark:text-dark-muted">
              Start with the tools developers reach for most
            </p>
          </div>
          <Link
            href="/tools"
            className="hidden sm:inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all tools →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTools.slice(0, 8).map((tool) => {
            const Icon = iconMap[tool.icon] || Braces;
            return (
              <ToolLink
                key={tool.id}
                slug={tool.slug}
                className="group relative flex flex-col rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-dark-muted" aria-hidden="true" />
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
                  {tool.new && <Badge variant="new">New</Badge>}
                </div>
              </ToolLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}