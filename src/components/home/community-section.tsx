import Link from "next/link";
import { Lightbulb, Bug, MessageSquare, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

const communityLinks = [
  {
    title: "Suggest a Tool",
    description: "Have an idea? Let us know what tool you need.",
    icon: Lightbulb,
    href: "/suggest",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    title: "Request a Feature",
    description: "Help shape the future of DevStackIO.",
    icon: Vote,
    href: "/feature-request",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    title: "Report a Bug",
    description: "Found something broken? Let us fix it.",
    icon: Bug,
    href: "/report-bug",
    color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
  {
    title: "Share Feedback",
    description: "We'd love to hear your thoughts.",
    icon: MessageSquare,
    href: "/feedback",
    color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
];

export function CommunitySection() {
  return (
    <section className="border-t border-surface-200 bg-surface-50 dark:border-dark-border dark:bg-dark-surface">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
            Community Driven
          </h2>
          <p className="mt-2 text-surface-500 dark:text-dark-muted">
            Help us build the tools you need
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {communityLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="group rounded-xl border border-surface-200 bg-white p-6 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-bg"
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", link.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted">
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
