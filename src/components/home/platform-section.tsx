import Link from "next/link";
import { Boxes, BookOpen, FileCode2, ArrowRight } from "lucide-react";

export function PlatformSection() {
  return (
    <section className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
            More Than Just Online Tools
          </h2>
          <p className="mt-2 text-surface-600 dark:text-dark-muted">
            DevStackIO is building a growing toolkit for developers — from
            browser-based utilities today to deeper developer workflows and
            APIs in the future.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Boxes,
              title: "Free tools today",
              text: "165+ privacy-first utilities you can use right now in your browser.",
            },
            {
              icon: BookOpen,
              title: "Learning resources",
              text: "Guides and best practices that explain the technology behind the tools.",
            },
            {
              icon: FileCode2,
              title: "APIs, next",
              text: "Programmatic access to DevStackIO capabilities is on the roadmap.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-surface-900 dark:text-dark-text">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-surface-600 dark:text-dark-muted">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View our roadmap <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}