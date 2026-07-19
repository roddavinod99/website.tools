"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, Code, Brain, Image, FileText, Type, Shield, Network, Search,
  Cloud, Terminal, Wallet, Zap, ArrowLeftRight, Wand, CircleCheck,
  FileCode, PanelRightOpen, Calculator, GraduationCap, Wrench, 
  type LucideIcon 
} from "lucide-react";

interface CategoryCardProps {
  name: string;
  description: string;
  slug: string;
  toolCount: number;
  icon?: string | LucideIcon;
  color?: string;
  className?: string;
  variant?: "default" | "compact" | "home";
}

const variantStyles = {
  default: "group rounded-xl border border-surface-200 bg-white p-6 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface",
  compact: "group rounded-lg border border-surface-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md dark:border-dark-border dark:bg-dark-surface",
  home: "group flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface",
};

const colorDefaults: Record<string, string> = {
  "Encoders": "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  "Formatters": "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  "Generators": "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  "Converters": "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  "Security Tools": "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  "Image Tools": "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  "Utilities": "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const iconMap: Record<string, LucideIcon> = {
  Code, Brain, Image, FileText, Type, Shield, Network, Search,
  Cloud, Terminal, Wallet, Zap, ArrowLeftRight, Wand, CircleCheck,
  FileCode, PanelRightOpen, Calculator, GraduationCap, Wrench,
};

export function CategoryCard({ 
  name, 
  description, 
  slug, 
  toolCount, 
  icon, 
  color,
  className,
  variant = "default",
}: CategoryCardProps) {
  const Icon = (typeof icon === "string" ? iconMap[icon] : icon) || ArrowRight;
  const bgColor = color || colorDefaults[name] || "bg-surface-100 text-surface-600 dark:bg-dark-bg dark:text-dark-muted";

  if (variant === "home") {
    return (
      <Link
        href={`/categories/${slug}`}
        className={cn(variantStyles.home, className)}
      >
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", bgColor)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-900 dark:text-dark-text truncate">
            {name}
          </p>
          <p className="text-xs text-surface-500 dark:text-dark-muted truncate">
            {toolCount} tools
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/categories/${slug}`}
        className={cn(variantStyles.compact, className)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", bgColor)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400 truncate">
              {name}
            </h3>
            <p className="text-xs text-surface-500 dark:text-dark-muted truncate">
              {description}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-surface-400 dark:text-dark-muted">
          {toolCount} tools
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={`/categories/${slug}`}
      className={cn(variantStyles.default, className)}
    >
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", bgColor)}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
        {name}
      </h3>
      <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
        {description}
      </p>
      <p className="mt-2 text-xs text-surface-400 dark:text-dark-muted">
        {toolCount} tools
      </p>
    </Link>
  );
}