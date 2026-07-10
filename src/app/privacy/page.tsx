import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "All tool processing happens entirely in your browser. Your data never leaves your device. We do not store, transmit, or process your data on our servers.",
  alternates: { canonical: `${siteConfig.url}/privacy` },
  openGraph: {
    title: "Privacy Policy | DevStackIO",
    description: "Your privacy is important to us. Learn how DevStackIO protects your data.",
    url: `${siteConfig.url}/privacy`,
  },
};

export default function PrivacyPage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.privacy || "2026-06-15";

  return (
    <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-surface-500 dark:text-dark-muted">Last updated: {lastUpdated}</p>
          <h1 className="mt-2 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Privacy Policy
          </h1>
        </div>

        <div className="space-y-6 text-surface-600 dark:text-dark-muted">
          <p>
            Your privacy is important to us. We designed DevStackIO to respect your privacy by default.
            This Privacy Policy explains how we collect, use, and protect your information when you
            visit our website.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Information We Collect</h2>
            <p className="mt-2">
              We minimize data collection. The following information may be collected:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li><strong>Usage data:</strong> Anonymous analytics about which pages and tools are visited (if you consent to analytics cookies).</li>
              <li><strong>Device information:</strong> Browser type, operating system, and screen size for performance optimization.</li>
              <li><strong>IP address:</strong> Temporarily processed for security and rate limiting (via Cloudflare).</li>
              <li><strong>Preferences:</strong> Theme preference (dark/light) stored locally on your device.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Data Processing</h2>
            <p className="mt-2">
              All tool processing happens entirely in your browser. Data you input into any tool
              never leaves your device. We do not store, transmit, or process your data on our
              servers. This means your code, text, files, and sensitive information remain private
              on your computer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Google Analytics</h2>
            <p className="mt-2">
              We use Google Analytics to understand how visitors use our website. This service is
              only activated after you give consent via our cookie consent banner. Google Analytics
              collects anonymous information such as pages visited, time spent, and interaction
              patterns. Google may process this data as described in their privacy policy. You can
              learn more about Google Analytics data processing at{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 underline">
                policies.google.com/privacy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Google AdSense</h2>
            <p className="mt-2">
              We may display advertisements through Google AdSense in the future. AdSense uses
              cookies to serve personalized ads based on your browsing history. Ads will only be
              shown after you provide consent for advertising cookies. You can manage your
              advertising preferences through our cookie consent settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Cloudflare</h2>
            <p className="mt-2">
              We use Cloudflare for content delivery, DDoS protection, and performance optimization.
              Cloudflare may process your IP address and request metadata as described in their
              privacy policy. Cloudflare is GDPR-compliant and participates in the EU-US Data
              Privacy Framework.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Server Logs</h2>
            <p className="mt-2">
              Our servers may automatically record information such as your IP address, browser
              type, referring URLs, and timestamps. This data is used for security monitoring,
              troubleshooting, and analytics. Log data is retained for a limited period and then
              deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Cookies</h2>
            <p className="mt-2">
              We use minimal cookies. Essential cookies for site functionality are always active.
              Analytics and advertising cookies require your explicit consent. For more details,
              see our{" "}
              <a href="/cookie-policy" className="text-brand-500 hover:text-brand-600 underline">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Your Rights</h2>
            <p className="mt-2">
              Under the GDPR and CCPA, you have the following rights:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li><strong>Right to know:</strong> What personal data we collect and how it is used.</li>
              <li><strong>Right to access:</strong> Request a copy of your data.</li>
              <li><strong>Right to delete:</strong> Request deletion of your personal data.</li>
              <li><strong>Right to opt out:</strong> Opt out of the sale of personal information (we do not sell data).</li>
              <li><strong>Right to withdraw consent:</strong> Withdraw cookie consent at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Data Security</h2>
            <p className="mt-2">
              We implement appropriate technical and organizational measures to protect your
              information, including HTTPS encryption, security headers, and regular security
              assessments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated &quot;Last updated&quot; date. We encourage you to review this
              policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">Contact</h2>
            <p className="mt-2">
              If you have questions about this Privacy Policy or wish to exercise your rights,
              please{" "}
              <a href="/contact" className="text-brand-500 hover:text-brand-600 underline">contact us</a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
