import Link from "next/link";
import { Lightbulb, Bug, MessageSquare, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

const communityLinks = [
  {
    title: "Suggest a Tool",
    description: "Have an idea? Let us know what tool you need.",
    icon: Lightbulb,
    href: "/suggest",
    color: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  },
  {
    title: "Request a Feature",
    description: "Help shape the future of DevStackIO.",
    icon: Vote,
    href: "/feature-request",
    color: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  },
  {
    title: "Report a Bug",
    description: "Found something broken? Let us fix it.",
    icon: Bug,
    href: "/report-bug",
    color: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  },
  {
    title: "Share Feedback",
    description: "We'd love to hear your thoughts.",
    icon: MessageSquare,
    href: "/feedback",
    color: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  },
];

export function CommunitySection() {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]" aria-labelledby="community-heading">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Community
          </p>
          <h2 id="community-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
            Community Driven
          </h2>
          <p className="mt-3 text-base text-[var(--color-text-muted)] text-pretty">
            Help us build the tools you need
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {communityLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 transition-all hover:border-[var(--color-border-strong)] hover:shadow-sm"
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", link.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {link.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
