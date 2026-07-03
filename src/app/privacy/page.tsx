import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "All tool processing happens entirely in your browser. Your data never leaves your device. We do not store, transmit, or process your data on our servers.",
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          Privacy Policy
        </h1>
        <div className="mt-8 space-y-6 text-surface-600 dark:text-dark-muted">
          <p>
            Your privacy is important to us. We designed DevStackIO to respect your
            privacy by default.
          </p>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Data Processing
          </h2>
          <p>
            All tool processing happens entirely in your browser. Data you input into
            any tool never leaves your device. We do not store, transmit, or process
            your data on our servers.
          </p>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Analytics
          </h2>
          <p>
            We use minimal, privacy-respecting analytics to understand which tools are
            most popular and improve the platform. No personal information is collected.
          </p>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Cookies
          </h2>
          <p>
            We only use essential cookies for site functionality (e.g., dark mode preference).
            No tracking or advertising cookies are used.
          </p>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Contact
          </h2>
          <p>
            If you have questions about this policy, please contact us through our support page.
          </p>
        </div>
      </div>
    </div>
  );
}
