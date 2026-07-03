import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "All tools are provided free of charge for personal and commercial use. By using DevStackIO, you agree to these terms.",
  alternates: { canonical: `${siteConfig.url}/terms` },
};

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          Terms of Service
        </h1>
        <div className="mt-8 space-y-6 text-surface-600 dark:text-dark-muted">
          <p>
            By using DevStackIO, you agree to these terms.
          </p>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Usage
          </h2>
          <p>
            All tools are provided free of charge for personal and commercial use.
            You may not abuse the platform, attempt to reverse-engineer tools,
            or use them for illegal purposes.
          </p>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            No Warranty
          </h2>
          <p>
            Tools are provided &quot;as is&quot; without warranty of any kind. While we
            strive for accuracy, you should verify critical outputs independently.
          </p>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Changes
          </h2>
          <p>
            We reserve the right to update these terms. Continued use after changes
            constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
}
