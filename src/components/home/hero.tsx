"use client";

import { useRouter } from "next/navigation";
import { Search, Command, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const popularSearches = [
  "JSON Formatter",
  "JWT Decoder",
  "UUID Generator",
  "Regex Tester",
];

export function Hero() {
  const router = useRouter();

  const handleSearch = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch((e.target as HTMLInputElement).value);
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-surface-200 dark:border-dark-border">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-900/20" />
      <div className="container relative py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-1.5 text-sm text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
            <span className="flex h-2 w-2 rounded-full bg-brand-400" />
            70 free tools. No login required.
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-surface-900 dark:text-dark-text sm:text-5xl lg:text-6xl">
            The internet&apos;s best
            <span className="block text-brand-500 dark:text-brand-400">
              collection of tools
            </span>
          </h1>
          <p className="mt-4 text-lg text-surface-500 dark:text-dark-muted sm:text-xl">
            Format, validate, encode, decode, generate, and more. Every tool
            is free, fast, and works entirely in your browser.
          </p>
          <div className="mt-8 mx-auto max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400 dark:text-dark-muted" />
              <input
                type="text"
                placeholder="Search 70 tools..."
                onKeyDown={handleKeyDown}
                className="h-12 w-full rounded-xl border border-surface-200 bg-white pl-10 pr-12 text-sm text-surface-900 shadow-sm placeholder:text-surface-400 focus-ring dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
              />
              <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 text-xs text-surface-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted sm:flex">
                <Command className="h-3 w-3" />
                K
              </kbd>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-surface-500 dark:text-dark-muted">
            <span>Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="rounded-md border border-surface-200 px-2.5 py-1 text-xs transition-colors hover:bg-surface-100 dark:border-dark-border dark:hover:bg-dark-surface"
              >
                {term}
              </button>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2" onClick={() => router.push("/tools")}>
              Explore Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/categories")}>
              View Categories
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
