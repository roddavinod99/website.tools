"use client";

import { lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Check, MousePointerClick, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tool } from "@/types";

const ToolSearch = lazy(() =>
  import("./tool-search").then((m) => ({ default: m.ToolSearch }))
);

interface HeroProps {
  badgeText: string;
  toolCount: number;
  allTools: Tool[];
}

const trustPoints = [
  { label: "Free to use", icon: Check },
  { label: "No account required", icon: MousePointerClick },
  { label: "Browser-based processing", icon: Lock },
];

export function Hero({ badgeText, toolCount, allTools }: HeroProps) {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden border-b border-surface-200 dark:border-dark-border">
      <div className="container relative py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-1.5 text-sm text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
            <span className="flex h-2 w-2 rounded-full bg-brand-400" aria-hidden="true" />
            {badgeText}
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-surface-900 dark:text-dark-text sm:text-5xl lg:text-6xl text-balance">
            Free Developer Tools for Everyday Work
          </h1>

          <p className="mt-5 text-lg text-surface-600 dark:text-dark-muted sm:text-xl max-w-2xl mx-auto text-pretty">
            Fast, privacy-focused tools for developers. Format, convert, generate,
            validate, encode, decode, and analyze data directly in your browser —
            your data stays in your browser whenever a tool supports client-side
            processing.
          </p>

          <div className="mt-10 mx-auto max-w-2xl animate-fade-in-up">
            <Suspense fallback={
              <div className="h-14 w-full rounded-xl border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface" />
            }>
              <ToolSearch allTools={allTools} />
            </Suspense>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={() => router.push("/tools")}>
              Explore All Tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 w-full sm:w-auto"
              onClick={() => router.push("/search")}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search Tools
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <div className="text-left">
              <div className="text-2xl font-extrabold text-surface-900 dark:text-dark-text">
                {toolCount.toLocaleString()}
              </div>
              <div className="text-xs text-surface-600 dark:text-dark-muted">free developer tools</div>
            </div>
            <span className="hidden h-10 w-px bg-surface-200 dark:border-dark-border sm:block" aria-hidden="true" />
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.label} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-surface-700 dark:text-dark-muted">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}