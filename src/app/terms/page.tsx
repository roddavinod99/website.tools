import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "All tools are provided free of charge for personal and commercial use. By using DevStackIO, you agree to these terms and conditions.",
  alternates: { canonical: `${siteConfig.url}/terms` },
  openGraph: {
    title: "Terms and Conditions | DevStackIO",
    description: "Review the terms and conditions for using DevStackIO tools and services.",
    url: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.terms || "2026-06-15";

  return (
    <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Last updated: {lastUpdated}</p>
          <h1 className="mt-2 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Terms and Conditions
          </h1>
        </div>

        <div className="space-y-6 text-surface-600 dark:text-dark-muted">
          <p>
            By accessing or using DevStackIO, you agree to be bound by these Terms and Conditions.
            If you do not agree with any part of these terms, you may not use our services.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Use of Service</h2>
            <p className="mt-2">
              All tools are provided free of charge for personal and commercial use. You may use
              any tool without creating an account or providing personal information. You agree to:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Use the tools for lawful purposes only.</li>
              <li>Not attempt to reverse-engineer, decompile, or abuse the platform.</li>
              <li>Not use automated scripts or bots to scrape or overload our servers.</li>
              <li>Not use the tools for illegal activities or to generate harmful content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Intellectual Property</h2>
            <p className="mt-2">
              The DevStackIO name, logo, and website design are our intellectual property. The tools
              themselves and their outputs are provided for your use. You retain all rights to your
              input data and tool outputs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">No Warranty</h2>
            <p className="mt-2">
              Tools are provided &quot;as is&quot; without warranty of any kind, either express or
              implied. While we strive for accuracy, you should verify critical outputs independently.
              We do not guarantee that the tools will meet your requirements or be uninterrupted,
              timely, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Limitation of Liability</h2>
            <p className="mt-2">
              DevStackIO shall not be liable for any direct, indirect, incidental, special,
              consequential, or exemplary damages resulting from your use of the tools or inability
              to use the tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Third-Party Services</h2>
            <p className="mt-2">
              Our website may use third-party services (e.g., analytics, CDN, advertising). These
              services have their own terms and privacy policies. We are not responsible for the
              practices of third-party providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Termination</h2>
            <p className="mt-2">
              We reserve the right to suspend or terminate access to our services for violations
              of these terms, at our sole discretion and without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Governing Law</h2>
            <p className="mt-2">
              These terms shall be governed by and construed in accordance with the applicable laws,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Changes</h2>
            <p className="mt-2">
              We reserve the right to update these terms at any time. Continued use of DevStackIO
              after changes constitutes acceptance of the new terms. We will notify users of
              material changes via a notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Contact</h2>
            <p className="mt-2">
              If you have questions about these terms, please{" "}
              <a href="/contact" className="text-brand-500 hover:text-brand-600 underline">contact us</a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
