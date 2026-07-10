import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "DevStackIO provides tools and content for informational and educational purposes. Review our disclaimer regarding warranties, accuracy, and liability.",
  alternates: { canonical: `${siteConfig.url}/disclaimer` },
  openGraph: {
    title: "Disclaimer | DevStackIO",
    description: "Review our disclaimer regarding warranties, accuracy, and liability.",
    url: `${siteConfig.url}/disclaimer`,
  },
};

export default function DisclaimerPage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.disclaimer || "2026-06-15";

  return (
    <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Last updated: {lastUpdated}</p>
          <h1 className="mt-2 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Disclaimer
          </h1>
        </div>

        <div className="space-y-6 text-surface-600 dark:text-dark-muted">
          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">No Warranties</h2>
            <p className="mt-2">
              All tools and content on DevStackIO are provided &quot;as is&quot; and &quot;as available&quot;
              without any warranty of any kind, either express or implied. We do not guarantee that
              the tools will be accurate, reliable, uninterrupted, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Educational Purposes</h2>
            <p className="mt-2">
              The tools and content on this website are offered for educational and informational
              purposes only. They are not intended to be a substitute for professional advice,
              including but not limited to legal, financial, or security advice. You should always
              consult qualified professionals for specific advice tailored to your situation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Tool Accuracy Disclaimer</h2>
            <p className="mt-2">
              While we strive to ensure the accuracy of our tools, they may produce incorrect results
              due to bugs, edge cases, or limitations in implementation. You are responsible for
              verifying any critical output independently. Do not rely solely on our tools for
              decisions that could result in financial loss, security vulnerabilities, or legal
              consequences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">AI-Generated Content Disclaimer</h2>
            <p className="mt-2">
              Some tools may utilize AI or machine learning models to generate content, suggestions,
              or analyses. AI-generated outputs may contain errors, inaccuracies, or biases. You
              should review and verify all AI-generated content before use. We make no guarantees
              about the accuracy, completeness, or appropriateness of AI-generated outputs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">External Links Disclaimer</h2>
            <p className="mt-2">
              DevStackIO may contain links to external websites or services that are not owned or
              controlled by us. We have no control over, and assume no responsibility for, the
              content, privacy policies, or practices of any third-party websites. You acknowledge
              and agree that we shall not be liable for any damage or loss caused by the use of
              such external resources.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Limitation of Liability</h2>
            <p className="mt-2">
              In no event shall DevStackIO, its owners, contributors, or affiliates be liable for
              any indirect, incidental, special, consequential, or punitive damages, including
              without limitation, loss of profits, data, use, or goodwill, arising out of or in
              connection with your use of this website or its tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Changes to This Disclaimer</h2>
            <p className="mt-2">
              We reserve the right to update or change this disclaimer at any time. Changes will
              be posted on this page with an updated &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Contact</h2>
            <p className="mt-2">
              If you have questions about this disclaimer, please{" "}
              <a href="/contact" className="text-brand-500 hover:text-brand-600 underline">contact us</a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
