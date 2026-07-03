import Link from "next/link";
import {
  Code, Brain, Image, FileText, Type, Shield, Network, Search,
  Cloud, Terminal, Wallet, Zap, ArrowLeftRight, Wand, CircleCheck,
  FileCode, PanelRightOpen, Calculator, GraduationCap, Wrench, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  Code, Brain, Image, FileText, Type, Shield, Network, Search,
  Cloud, Terminal, Wallet, Zap, ArrowLeftRight, Wand, CircleCheck,
  FileCode, PanelRightOpen, Calculator, GraduationCap, Wrench,
};

const colorMap: Record<string, string> = {
  "Encoders": "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  "Formatters": "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  "Generators": "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  "Converters": "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  "Security Tools": "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  "Image Tools": "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  "Utilities": "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function CategoriesSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
            Browse by Category
          </h2>
          <p className="mt-1 text-surface-500 dark:text-dark-muted">
            Find the right tool for any task
          </p>
        </div>
        <Link
          href="/categories"
          className="hidden sm:inline-flex text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          View all categories &rarr;
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.slice(0, 15).map((cat) => {
          const Icon = iconMap[cat.icon] || Code;
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                colorMap[cat.name] || "bg-surface-100 text-surface-600 dark:bg-dark-bg"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-dark-text">
                  {cat.name}
                </p>
                <p className="text-xs text-surface-500 dark:text-dark-muted">
                  {cat.toolCount} tools
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
