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
    color: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    slugs: ["json-formatter", "json-validator", "json-diff", "json-to-csv", "json-to-yaml", "json-to-typescript"],
  },
  {
    title: "Authentication & Tokens",
    icon: KeyRound,
    color: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
    slugs: ["jwt-decoder", "jwt-generator", "totp-generator", "bcrypt-generator", "hmac-generator"],
  },
  {
    title: "Images",
    icon: ImageIcon,
    color: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    slugs: ["image-compressor", "image-resizer", "exif-reader", "favicon-generator", "svg-optimizer"],
  },
  {
    title: "URLs & Web Data",
    icon: Globe,
    color: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    slugs: ["url-encoder", "url-parser", "html-entity", "http-status-codes", "mime-types"],
  },
  {
    title: "Data Conversion",
    icon: Repeat,
    color: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    slugs: ["json-to-csv", "csv-to-json", "json-to-yaml", "toml-converter", "timestamp-converter"],
  },
  {
    title: "Text & Regex",
    icon: FileText,
    color: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    slugs: ["regex-tester", "case-converter", "text-sorter", "word-counter", "slug-generator"],
  },
];

export function TaskSection({ allTools }: { allTools: Tool[] }) {
  const bySlug = new Map(allTools.map((t) => [t.slug, t]));

  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]" aria-labelledby="tasks-heading">
      <div className="container py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Tasks
          </p>
          <h2 id="tasks-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
            Tools for the Way You Work
          </h2>
          <p className="mt-3 text-base text-[var(--color-text-muted)] text-pretty">
            Jump straight into the tools you need for the task at hand.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {taskGroups.map((group) => {
            const Icon = group.icon;
            const tools = group.slugs
              .map((slug) => bySlug.get(slug))
              .filter((t): t is Tool => Boolean(t));
            return (
              <div
                key={group.title}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-md ${group.color}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold text-[var(--color-text)]">
                    {group.title}
                  </h3>
                </div>
                <ul className="mt-4 space-y-1">
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-accent)]"
                      >
                        <span className="truncate">{tool.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-subtle)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
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
