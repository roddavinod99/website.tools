import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/constants";

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
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          Roadmap
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          What we&apos;re building next
        </p>

        <div className="mt-8 space-y-8">
          {roadmapItems.map((quarter) => (
            <div key={quarter.quarter}>
              <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
                {quarter.quarter}
              </h2>
              <div className="mt-4 space-y-3">
                {quarter.items.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-xl border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface"
                  >
                    <span className="font-medium text-surface-900 dark:text-dark-text">{item.title}</span>
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
