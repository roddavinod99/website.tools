"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Clock, Calendar, ArrowRight, BookOpen } from "lucide-react";

interface GuideData {
  title: string;
  description: string;
  slug: string;
  date?: string;
  readTime?: string;
  category?: string;
  author?: string;
}

interface GuideCardProps {
  guide: GuideData;
  variant?: "default" | "compact" | "featured";
  className?: string;
  showMeta?: boolean;
}

const variantStyles = {
  default: "group block rounded-xl border border-surface-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface",
  compact: "group block rounded-lg border border-surface-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface",
  featured: "group relative rounded-2xl border border-surface-200 bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:border-dark-border dark:bg-dark-surface",
};

export function GuideCard({ 
  guide, 
  variant = "default", 
  className, 
  showMeta = true,
}: GuideCardProps) {
  const isFeatured = variant === "featured";

  return (
    <Link
      href={guide.slug.startsWith("/") ? guide.slug : `/guides/${guide.slug}`}
      className={cn(variantStyles[variant], className)}
    >
      {showMeta && (guide.date || guide.readTime) && (
        <div className="flex items-center gap-3 text-xs text-surface-400 dark:text-dark-muted">
          {guide.date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {guide.date}
            </span>
          )}
          {guide.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {guide.readTime} read
            </span>
          )}
          {guide.category && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              {guide.category}
            </span>
          )}
        </div>
      )}

      <h2 className={cn(
        "mt-2 font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400",
        variant === "featured" ? "text-2xl" : variant === "compact" ? "text-base" : "text-xl"
      )}>
        {guide.title}
      </h2>

      <p className={cn(
        "mt-2 line-clamp-2 text-surface-500 dark:text-dark-muted",
        variant === "featured" ? "text-lg" : variant === "compact" ? "text-sm" : "text-sm"
      )}>
        {guide.description}
      </p>

      {isFeatured && (
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-surface-200 dark:border-dark-border">
          <span className="text-sm text-surface-400 dark:text-dark-muted">
            {guide.author ? `By ${guide.author}` : "DevStackIO"}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-brand-500 dark:text-brand-400">
            Read more
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      )}
    </Link>
  );
}