import Link from "next/link";
import { Boxes, BookOpen, FileCode2, ArrowRight } from "lucide-react";

export function PlatformSection() {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]" aria-labelledby="platform-heading">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            The platform
          </p>
          <h2 id="platform-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
            More Than Just Online Tools
          </h2>
          <p className="mt-3 text-base text-[var(--color-text-muted)] text-pretty">
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
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            View our roadmap <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
