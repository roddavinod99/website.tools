"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, Command, ArrowRight, Zap, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOOL_COUNT } from "@/lib/constants";

const popularSearches = [
  "JSON Formatter",
  "JWT Decoder",
  "UUID Generator",
  "Regex Tester",
  "Base64 Encoder",
  "Color Converter",
];

export function Hero({ badgeText, searchPlaceholder }: { badgeText: string; searchPlaceholder: string }) {
  const router = useRouter();
  const [toolCount, setToolCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const duration = 1200;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setToolCount(Math.floor(eased * TOOL_COUNT));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setToolCount(TOOL_COUNT);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isVisible]);

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
      <div className="container relative py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white/80 px-4 py-1.5 text-sm text-surface-600 backdrop-blur-sm dark:border-dark-border dark:bg-dark-surface/80 dark:text-dark-muted animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
            {badgeText}
          </div>
          
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-surface-900 dark:text-dark-text sm:text-5xl lg:text-6xl xl:text-7xl animate-fade-in" style={{ animationDelay: "100ms" }}>
            The internet&apos;s best
            <span className="block text-brand-500 dark:text-brand-400">
              collection of tools
            </span>
          </h1>
          
          <p className="mt-4 text-lg text-surface-500 dark:text-dark-muted sm:text-xl animate-fade-in" style={{ animationDelay: "200ms" }}>
            Format, validate, encode, decode, generate, and more. Every tool
            is free, fast, and works entirely in your browser.
          </p>

          <div className="mt-10 mx-auto max-w-2xl animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-surface-400 dark:text-dark-muted" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onKeyDown={handleKeyDown}
                className="h-14 w-full rounded-xl border border-surface-200 bg-white pl-12 pr-14 text-base text-surface-900 shadow-lg placeholder:text-surface-400 focus-ring dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
                autoFocus
              />
              <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted sm:flex">
                <Command className="h-3.5 w-3.5" />
                K
              </kbd>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-surface-500 dark:text-dark-muted animate-fade-in" style={{ animationDelay: "400ms" }}>
            <span>Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="group rounded-full border border-surface-200 bg-white/50 px-3 py-1.5 text-xs font-medium transition-all hover:bg-surface-100 hover:border-brand-300 hover:text-brand-600 dark:border-dark-border dark:bg-dark-surface/50 dark:hover:bg-dark-bg dark:hover:border-brand-700 dark:hover:text-brand-400"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "500ms" }}>
            <Button size="lg" className="gap-2" onClick={() => router.push("/tools")}>
              Explore Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/categories")}>
              View Categories
            </Button>
          </div>

          <div ref={counterRef} className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-8 animate-fade-in" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-surface-900 dark:text-dark-text">
                  {toolCount.toLocaleString()}+
                </div>
                <div className="text-xs text-surface-500 dark:text-dark-muted">Free Tools</div>
              </div>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-dark-border" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-surface-900 dark:text-dark-text">50K+</div>
                <div className="text-xs text-surface-500 dark:text-dark-muted">Monthly Users</div>
              </div>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-dark-border" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-surface-900 dark:text-dark-text">{'<100ms'}</div>
                <div className="text-xs text-surface-500 dark:text-dark-muted">Avg Response</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}