"use client";

import { lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Check, Lock, Zap, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tool } from "@/types";

const ToolSearch = lazy(() =>
  import("./tool-search").then((m) => ({ default: m.ToolSearch }))
);

const trustPoints = [
  { label: "165+ tools", icon: Check },
  { label: "Free", icon: Check },
  { label: "Client-side", icon: Lock },
  { label: "No account", icon: User },
  { label: "Privacy first", icon: Shield },
  { label: "Fast", icon: Zap },
];

export function Hero({ badgeText, allTools }: { badgeText: string; allTools: Tool[] }) {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden border-b border-surface-200 dark:border-dark-border">
      <div className="container relative py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-1.5 text-sm text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
            <span className="flex h-2 w-2 rounded-full bg-brand-400" aria-hidden="true" />
            {badgeText}
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-surface-900 dark:text-dark-text sm:text-5xl lg:text-6xl text-balance">
            Free Developer Tools for Everyday Work
          </h1>

          <p className="mt-3 text-lg text-surface-600 dark:text-dark-muted sm:text-xl max-w-2xl mx-auto text-pretty">
            Format, convert, generate, validate, encode, decode, and analyze — all in your browser.
          </p>

          <div className="mt-8 mx-auto max-w-2xl animate-fade-in-up">
            <Suspense fallback={
              <div className="h-14 w-full rounded-xl border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface" />
            }>
              <ToolSearch allTools={allTools} />
            </Suspense>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.label} className="flex items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="font-medium">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}