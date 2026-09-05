import type { Metadata } from "next";
import { Mail, MessageSquare, Bug, BookOpen } from "lucide-react";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with DevStackIO tools.",
  alternates: { canonical: `${siteConfig.url}/support` },
};

const supportOptions = [
  { title: "Documentation", description: "Browse our guides and tutorials", icon: BookOpen, href: "/guides" },
  { title: "Report a Bug", description: "Found something broken?", icon: Bug, href: "/report-bug" },
  { title: "Feature Request", description: "Suggest a new tool or improvement", icon: MessageSquare, href: "/feature-request" },
  { title: "Contact Us", description: "Get in touch with our team", icon: Mail, href: "/contact" },
];

export default function SupportPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          Support
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          How can we help you?
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {supportOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <a
                key={opt.title}
                href={opt.href}
                className="group rounded-lg border border-[var(--color-border)] bg-white p-5 transition-all border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                <h3 className="mt-3 font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] text-[var(--color-text)]">
                  {opt.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{opt.description}</p>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
