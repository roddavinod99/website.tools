"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, Command, ArrowRight, Zap, ShieldCheck, CheckCircle, Terminal, Globe, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const popularSearches = [
  "JSON Formatter",
  "JWT Decoder",
  "UUID Generator",
  "Regex Tester",
  "Base64 Encoder",
  "Color Converter",
];

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  darkColor: string;
}

const stats: StatItem[] = [
  { label: "Free Tools", value: "128+", icon: <CheckCircle className="h-5 w-5" />, color: "bg-brand-100 text-brand-600", darkColor: "dark:bg-brand-900/30 dark:text-brand-400" },
  { label: "Zero Uploads", value: "0", icon: <ShieldCheck className="h-5 w-5" />, color: "bg-green-100 text-green-600", darkColor: "dark:bg-green-900/30 dark:text-green-400" },
  { label: "Client-Side", value: "100%", icon: <Zap className="h-5 w-5" />, color: "bg-amber-100 text-amber-600", darkColor: "dark:bg-amber-900/30 dark:text-amber-400" },
];

export function Hero({ badgeText, searchPlaceholder, toolCount }: { badgeText: string; searchPlaceholder: string; toolCount: number }) {
  const router = useRouter();
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
        const currentCount = Math.floor(eased * toolCount);
        
        if (counterRef.current) {
          counterRef.current.textContent = currentCount.toLocaleString() + "+";
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else if (counterRef.current) {
          counterRef.current.textContent = toolCount.toLocaleString() + "+";
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isVisible, toolCount]);

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
      <div className="container relative py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-1.5 text-sm text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" aria-hidden="true" />
            {badgeText}
          </div>
          
          {/* Headline */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-surface-900 dark:text-dark-text sm:text-5xl lg:text-6xl xl:text-7xl animate-fade-in-up delay-1 text-balance">
            The internet&apos;s best
            <span className="block text-brand-600 dark:text-brand-400">
              collection of developer tools
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="mt-5 text-lg text-surface-600 dark:text-dark-muted sm:text-xl max-w-2xl mx-auto animate-fade-in-up delay-2 text-pretty">
            Format, validate, encode, decode, generate, and convert. Every tool
            is free, fast, and works entirely in your browser — zero server uploads.
          </p>

          {/* Search */}
          <div className="mt-10 mx-auto max-w-2xl animate-fade-in-up delay-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-surface-400 dark:text-dark-muted" aria-hidden="true" />
              <input
                id="hero-search"
                name="q"
                type="text"
                placeholder={searchPlaceholder}
                onKeyDown={handleKeyDown}
                className="h-14 w-full rounded-xl border border-surface-200 bg-white pl-12 pr-14 text-base text-surface-900 placeholder:text-surface-400 focus-ring dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
                autoFocus
                aria-label="Search tools"
              />
              <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-surface-200 bg-surface-50 px-2 py-1 text-xs text-surface-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted sm:flex">
                <Command className="h-3.5 w-3.5" aria-hidden="true" />
                K
              </kbd>
            </div>
          </div>

          {/* Popular searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-surface-600 dark:text-dark-muted animate-fade-in-up delay-4">
            <span>Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="group rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium transition-all hover:bg-surface-100 hover:border-brand-300 hover:text-brand-600 dark:border-dark-border dark:bg-dark-surface dark:hover:bg-dark-bg dark:hover:border-brand-700 dark:hover:text-brand-400"
              >
                {term}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in-up delay-5">
            <Button size="lg" className="gap-2" onClick={() => router.push("/tools")}>
              Explore Tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/categories")}>
              View Categories
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-8 animate-fade-in-up delay-6">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.color} ${stat.darkColor}`}>
                  {stat.icon}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold text-surface-900 dark:text-dark-text">
                    <span ref={i === 0 ? counterRef : undefined} id="stat-free-tools">{i === 0 ? "0+" : stat.value}</span>
                  </div>
                  <div className="text-xs text-surface-600 dark:text-dark-muted">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Technical badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up delay-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-medium text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
              <Terminal className="h-3 w-3" aria-hidden="true" />
              Client-side only
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-medium text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
              <Globe className="h-3 w-3" aria-hidden="true" />
              No tracking
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-medium text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
              <Layers className="h-3 w-3" aria-hidden="true" />
              Open source
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}