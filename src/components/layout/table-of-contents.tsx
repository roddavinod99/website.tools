"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, type LucideIcon } from "lucide-react";

export interface TocItem {
  id: string;
  label: string;
  level: number;
  icon?: LucideIcon;
}

interface TableOfContentsProps {
  items: TocItem[];
  activeId: string;
}

export function TableOfContents({ items, activeId }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <button
        className="fixed bottom-6 right-6 md:hidden z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close table of contents" : "Open table of contents"}
        aria-expanded={isOpen}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 md:hidden z-30 max-h-[60vh] overflow-auto rounded-t-2xl border-t border-surface-200 bg-white p-4 shadow-xl dark:border-dark-border dark:bg-dark-surface transition-transform duration-300",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-label="Table of contents"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900 dark:text-dark-text">On this page</h3>
          <button onClick={() => setIsOpen(false)} className="text-surface-400 hover:text-surface-600" aria-label="Close">
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "block px-2 py-1 text-sm transition-colors rounded",
                activeId === item.id
                  ? "text-brand-500 font-medium dark:text-brand-400"
                  : "text-surface-600 hover:text-surface-900 dark:text-dark-muted dark:hover:text-dark-text"
              )}
              style={{ paddingLeft: item.level * 12 }}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(item.id);
                if (target) {
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.pushState(null, "", `#${item.id}`);
                }
                setIsOpen(false);
              }}
            >
              <span className="flex items-center gap-2">
                {item.icon && <item.icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />}
                {item.label}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  icon: Icon,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;
    const handleToggle = () => setIsOpen(details.open);
    details.addEventListener("toggle", handleToggle);
    return () => details.removeEventListener("toggle", handleToggle);
  }, []);

  return (
    <details ref={detailsRef} className={cn("group", className)}>
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-surface-900 dark:text-dark-text">
        <span className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-brand-500" />}
          {title}
        </span>
        <ChevronRight className={cn("h-4 w-4 text-surface-400 transition-transform", isOpen && "rotate-90")} />
      </summary>
      <div className="px-5 pb-4 animate-fade-in">
        {children}
      </div>
    </details>
  );
}

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 z-50 h-1 bg-brand-500 origin-left transition-transform duration-100"
      style={{ transform: `scaleX(${progress / 100})` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}