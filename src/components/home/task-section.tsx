import Link from "next/link";
import {
  Braces, KeyRound, Image as ImageIcon, Globe, Repeat, FileText,
  ArrowRight, type LucideIcon,
} from "lucide-react";
import type { Tool } from "@/types";

interface TaskGroup {
  title: string;
  icon: LucideIcon;
  color: string;
  slugs: string[];
}

const taskGroups: TaskGroup[] = [
  {
    title: "Work with JSON",
    icon: Braces,
    color: "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400",
    slugs: ["json-formatter", "json-validator", "json-diff", "json-to-csv", "json-to-yaml", "json-to-typescript"],
  },
  {
    title: "Authentication & Tokens",
    icon: KeyRound,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    slugs: ["jwt-decoder", "jwt-generator", "totp-generator", "bcrypt-generator", "hmac-generator"],
  },
  {
    title: "Images",
    icon: ImageIcon,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    slugs: ["image-compressor", "image-resizer", "exif-reader", "favicon-generator", "svg-optimizer"],
  },
  {
    title: "URLs & Web Data",
    icon: Globe,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    slugs: ["url-encoder", "url-parser", "html-entity", "http-status-codes", "mime-types"],
  },
  {
    title: "Data Conversion",
    icon: Repeat,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    slugs: ["json-to-csv", "csv-to-json", "json-to-yaml", "toml-converter", "timestamp-converter"],
  },
  {
    title: "Text & Regex",
    icon: FileText,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    slugs: ["regex-tester", "case-converter", "text-sorter", "word-counter", "slug-generator"],
  },
];

export function TaskSection({ allTools }: { allTools: Tool[] }) {
  const bySlug = new Map(allTools.map((t) => [t.slug, t]));

  return (
    <section className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
      <div className="container py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
            Tools for the Way You Work
          </h2>
          <p className="mt-2 text-surface-600 dark:text-dark-muted">
            Jump straight into the tools you need for the task at hand.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {taskGroups.map((group) => {
            const Icon = group.icon;
            const tools = group.slugs
              .map((slug) => bySlug.get(slug))
              .filter((t): t is Tool => Boolean(t));
            return (
              <div
                key={group.title}
                className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${group.color}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold text-surface-900 dark:text-dark-text">
                    {group.title}
                  </h3>
                </div>
                <ul className="mt-4 space-y-1">
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-surface-600 transition-colors hover:bg-surface-100 hover:text-brand-600 dark:text-dark-muted dark:hover:bg-dark-bg dark:hover:text-brand-400"
                      >
                        <span className="truncate">{tool.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-surface-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-dark-muted" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}