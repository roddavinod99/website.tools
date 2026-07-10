import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn about how DevStackIO uses cookies and similar technologies. Understand your choices and how to manage cookie preferences.",
  alternates: { canonical: `${siteConfig.url}/cookie-policy` },
  openGraph: {
    title: "Cookie Policy | DevStackIO",
    description: "Learn about how DevStackIO uses cookies and similar technologies.",
    url: `${siteConfig.url}/cookie-policy`,
  },
};

export default function CookiePolicyPage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.cookie || "2026-06-15";

  return (
    <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Last updated: {lastUpdated}</p>
          <h1 className="mt-2 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Cookie Policy
          </h1>
        </div>

        <div className="prose prose-surface dark:prose-invert max-w-none space-y-6 text-surface-600 dark:text-dark-muted">
          <p>
            This Cookie Policy explains how DevStackIO uses cookies and similar tracking technologies
            on our website. By using DevStackIO, you consent to the use of cookies as described in
            this policy.
          </p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help
            websites remember your preferences, understand how you use the site, and improve your
            experience. Cookies can be &quot;persistent&quot; (remaining on your device) or
            &quot;session&quot; (deleted when you close your browser).
          </p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Necessary:</strong> Essential for the website to function properly, including dark mode preference storage and security features.</li>
            <li><strong>Functional:</strong> Remember your preferences (e.g., theme selection, tool settings) to enhance your experience.</li>
            <li><strong>Analytics:</strong> Help us understand which tools and pages are most popular, so we can improve our platform. We use privacy-respecting analytics that anonymize IP addresses.</li>
            <li><strong>Advertising:</strong> If enabled, these cookies help deliver relevant advertisements and measure ad performance. We do not currently serve ads but prepare for future use.</li>
          </ul>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Cookies We Use</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-200 dark:border-dark-border">
                  <th className="py-2 pr-4 text-left font-semibold text-surface-900 dark:text-dark-text">Cookie</th>
                  <th className="py-2 pr-4 text-left font-semibold text-surface-900 dark:text-dark-text">Type</th>
                  <th className="py-2 pr-4 text-left font-semibold text-surface-900 dark:text-dark-text">Purpose</th>
                  <th className="py-2 text-left font-semibold text-surface-900 dark:text-dark-text">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-dark-border">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">cookie-consent</td>
                  <td className="py-2 pr-4">Necessary</td>
                  <td className="py-2 pr-4">Stores your cookie consent preferences</td>
                  <td className="py-2">1 year</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">theme</td>
                  <td className="py-2 pr-4">Functional</td>
                  <td className="py-2 pr-4">Remembers your dark/light mode preference</td>
                  <td className="py-2">1 year</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                  <td className="py-2 pr-4">Analytics</td>
                  <td className="py-2 pr-4">Google Analytics - distinguishes users (only after consent)</td>
                  <td className="py-2">2 years</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">_gid</td>
                  <td className="py-2 pr-4">Analytics</td>
                  <td className="py-2 pr-4">Google Analytics - distinguishes users (only after consent)</td>
                  <td className="py-2">24 hours</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Third-Party Cookies</h2>
          <p>
            We may use third-party services that set their own cookies. These include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Google Analytics:</strong> For anonymous usage analytics (requires consent).</li>
            <li><strong>Google AdSense:</strong> For advertising (requires consent, if enabled).</li>
            <li><strong>Cloudflare:</strong> For security and performance optimization.</li>
          </ul>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Managing Cookies</h2>
          <p>
            You can manage your cookie preferences at any time by clicking the &quot;Cookie Preferences&quot;
            link in the footer. You can also configure cookies through your browser settings:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Chrome: Settings &rarr; Privacy and Security &rarr; Cookies and other site data</li>
            <li>Firefox: Options &rarr; Privacy & Security &rarr; Cookies and Site Data</li>
            <li>Safari: Preferences &rarr; Privacy &rarr; Cookies and website data</li>
            <li>Edge: Settings &rarr; Cookies and site permissions &rarr; Cookies and site data</li>
          </ul>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Your Rights</h2>
          <p>
            Under GDPR, you have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Withdraw consent at any time</li>
            <li>Request information about what data we process</li>
            <li>Request deletion of your data</li>
          </ul>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. Changes will be posted on this page
            with an updated &quot;Last updated&quot; date.
          </p>

          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Contact</h2>
          <p>
            If you have questions about this Cookie Policy, please{" "}
            <a href="/contact" className="text-brand-500 hover:text-brand-600 underline">contact us</a>.
          </p>
        </div>
      </article>
    </div>
  );
}
