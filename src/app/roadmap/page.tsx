import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "DevStackIO product roadmap and upcoming features.",
  alternates: { canonical: `${siteConfig.url}/roadmap` },
};

const roadmapItems = [
  { quarter: "Q3 2026", items: [
    { title: "Interactive tool interfaces", status: "In Progress" as const },
    { title: "User collections", status: "Planned" as const },
    { title: "Recently used tools", status: "Planned" as const },
  ]},
  { quarter: "Q4 2026", items: [
    { title: "Public API", status: "Planned" as const },
    { title: "Browser extension", status: "Planned" as const },
    { title: "Offline support", status: "Planned" as const },
  ]},
  { quarter: "2027", items: [
    { title: "Premium plans for API access", status: "Planned" as const },
    { title: "Team workspaces", status: "Planned" as const },
    { title: "AI-powered tool suggestions", status: "Planned" as const },
  ]},
];

const statusColors = {
  "In Progress": "success",
  "Planned": "default",
} as const;

export default function RoadmapPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          Roadmap
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          What we&apos;re building next
        </p>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Our public roadmap shows the features and improvements planned for DevStackIO. Priorities are
          driven by community feedback, developer needs, and our commitment to privacy-first, browser-based
          tooling. Want to influence what ships next? Submit a{" "}
          <a href="/feature-request" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">feature request</a>{" "}
          or{" "}
          <a href="/suggest" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">suggest a new tool</a>{" "}
          and it will be considered for a future quarter.
        </p>

        <div className="mt-8 space-y-8">
          {roadmapItems.map((quarter) => (
            <div key={quarter.quarter}>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                {quarter.quarter}
              </h2>
              <div className="mt-4 space-y-3">
                {quarter.items.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white p-4 border-[var(--color-border)] bg-[var(--color-surface)]"
                  >
                    <span className="font-medium text-[var(--color-text)]">{item.title}</span>
                    <Badge variant={statusColors[item.status]}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
