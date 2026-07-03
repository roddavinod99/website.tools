import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "System Status",
  description: "DevStackIO system status and uptime.",
  alternates: { canonical: `${siteConfig.url}/status` },
};

const services = [
  { name: "Website", status: "operational" as const },
  { name: "Tools", status: "operational" as const },
  { name: "API", status: "under-development" as const },
  { name: "Search", status: "operational" as const },
];

export default function StatusPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          System Status
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Current status of DevStackIO services
        </p>

        <div className="mt-8 space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-xl border border-surface-200 bg-white p-4 dark:border-dark-border dark:bg-dark-surface"
            >
              <span className="font-medium text-surface-900 dark:text-dark-text">{service.name}</span>
              <span className={`flex items-center gap-1.5 text-sm ${
                service.status === "operational"
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}>
                <CircleCheck className="h-4 w-4" />
                {service.status === "operational" ? "Operational" : "Under Development"}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-surface-400 dark:text-dark-muted text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
