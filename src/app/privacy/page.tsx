/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "DevStackIO Privacy Policy - Full GDPR/CCPA compliance. Client-side processing, no server-side data storage. Learn how we protect your privacy.",
  alternates: { canonical: `${siteConfig.url}/privacy` },
  openGraph: {
    title: "Privacy Policy | DevStackIO",
    description: "Your privacy is our priority. Client-side processing, no server-side data storage, full GDPR/CCPA compliance.",
    url: `${siteConfig.url}/privacy`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Privacy Policy" }],
  },
};

export default function PrivacyPage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.privacy || "2026-07-20";
  const effectiveDate = "2026-07-20";

  return (
    <div className="container py-12 md:py-16">
      <article className="prose mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm text-[var(--color-text-muted)]">
            Last updated: {lastUpdated} | Effective: {effectiveDate}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-muted)]">
            DevStackIO is built on a privacy-first architecture. All tool processing occurs client-side in your browser.
            We do not store, transmit, or process your data on our servers.
          </p>
        </div>

        <div className="mb-8 p-4 rounded-lg bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30">
          <p className="text-sm text-[var(--color-accent)]">
            <strong>Key Promise:</strong> Your code, files, and data never leave your browser. We implement
            client-side processing by design — not as a feature, but as our foundational architecture.
          </p>
        </div>

        <nav className="mb-8 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-3">Table of Contents</h2>
          <ol className="list-decimal pl-6 space-y-1 text-sm text-[var(--color-text-muted)]">
            <li><a href="#1-controller" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">1. Controller & Contact</a></li>
            <li><a href="#2-lawful-basis" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">2. Lawful Basis for Processing (GDPR Art. 6)</a></li>
            <li><a href="#3-data-categories" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">3. Categories of Personal Data Processed</a></li>
            <li><a href="#4-purpose" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">4. Purposes of Processing</a></li>
            <li><a href="#5-recipients" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">5. Recipients & Subprocessors</a></li>
            <li><a href="#6-international-transfers" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">6. International Data Transfers</a></li>
            <li><a href="#7-retention" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">7. Data Retention Periods</a></li>
            <li><a href="#8-your-rights" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">8. Your Rights (GDPR Arts. 15-22, CCPA)</a></li>
            <li><a href="#9-security" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">9. Data Security Measures</a></li>
            <li><a href="#10-automated-decision" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">10. Automated Decision-Making & Profiling</a></li>
            <li><a href="#11-cookies" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">11. Cookies & Similar Technologies</a></li>
            <li><a href="#12-children" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">12. Children's Privacy</a></li>
            <li><a href="#13-changes" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">13. Changes to This Policy</a></li>
            <li><a href="#14-contact" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">14. Contact & DPO</a></li>
          </ol>
        </nav>

        <div className="space-y-8 text-[var(--color-text-muted)]">
          <section id="1-controller">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">1. Controller & Contact</h2>
            <p className="mt-2">
              Pursuant to Article 4(7) GDPR, the data controller is:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
              <p><strong>DevStackIO</strong></p>
              <p>Email: <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a></p>
              <p>Privacy Inquiries: <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a></p>
              <p>Data Protection Officer: <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a></p>
              <p>Postal: DevStackIO, 123 Developer Way, San Francisco, CA 94102, USA</p>
              <p>EU Representative (Art. 27 GDPR): Available upon request at <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a></p>
            </div>
          </section>

          <section id="2-lawful-basis">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">2. Lawful Basis for Processing (GDPR Art. 6)</h2>
            <p className="mt-2">
              We process personal data only where we have a valid lawful basis under Article 6 GDPR:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Processing Activity</th>
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Lawful Basis (Art. 6)</th>
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">Server logs (IP, UA, timestamps)</td>
                    <td className="py-2 pr-4">Art. 6(1)(f) — Legitimate Interest</td>
                    <td className="py-2 pr-4">Security, fraud prevention, DDoS protection, platform stability</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">Analytics (GA4)</td>
                    <td className="py-2 pr-4">Art. 6(1)(a) — Consent</td>
                    <td className="py-2 pr-4">Only with explicit opt-in via cookie banner; anonymized IP</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">Cookie preferences</td>
                    <td className="py-2 pr-4">Art. 6(1)(c) — Legal Obligation / Art. 6(1)(f)</td>
                    <td className="py-2 pr-4">Required for ePrivacy compliance; legitimate interest for essential cookies</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">Theme/preferences (localStorage)</td>
                    <td className="py-2 pr-4">Art. 6(1)(f) — Legitimate Interest</td>
                    <td className="py-2 pr-4">Strictly client-side; no server transmission; essential for UX</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">Contact form submissions</td>
                    <td className="py-2 pr-4">Art. 6(1)(b) — Contract / Art. 6(1)(f)</td>
                    <td className="py-2 pr-4">Responding to inquiries; legitimate interest in business communication</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">Advertising (AdSense)</td>
                    <td className="py-2 pr-4">Art. 6(1)(a) — Consent</td>
                    <td className="py-2 pr-4">Only with explicit opt-in; personalized ads disabled by default</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">Security scanning (Cloudflare WAF)</td>
                    <td className="py-2 pr-4">Art. 6(1)(f) — Legitimate Interest</td>
                    <td className="py-2 pr-4">Protection against attacks, bot mitigation, platform integrity</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              <strong>No "Contract" basis for tool usage:</strong> Since all tool processing occurs client-side and we do not
              process your tool inputs on our servers, Article 6(1)(b) does not apply to the core tool functionality.
              You are the controller of your data; we are not a processor for your tool inputs.
            </p>
          </section>

          <section id="3-data-categories">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">3. Categories of Personal Data Processed</h2>
            <p className="mt-2">We minimize data collection. The following categories may be processed:</p>
            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">A. Technical Data (Automatically Collected)</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>IP address (temporarily via Cloudflare for security/rate limiting)</li>
                  <li>Browser type, version, language, operating system</li>
                  <li>Screen resolution, viewport size, color depth</li>
                  <li>Referring URL, pages visited, timestamps</li>
                  <li>Request headers, response codes, latency metrics</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">B. Analytics Data (Consent-Based)</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Pseudonymous user ID (GA4 client_id)</li>
                  <li>Page views, scroll depth, tool interactions</li>
                  <li>Session duration, bounce events</li>
                  <li>Geolocation (country-level only, IP anonymized)</li>
                  <li>Device category (desktop/mobile/tablet)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">C. Cookie & Preference Data</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Cookie consent choices (necessary/analytics/advertising/functional)</li>
                  <li>Theme preference (dark/light) — stored locally, not transmitted</li>
                  <li>Tool-specific settings (indentation, encoding preferences) — client-side only</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">D. Contact Form Data (Voluntary)</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Name, email address, subject, message content</li>
                  <li>Optional: organization, phone number</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-200">NOT Processed by Us (Client-Side Only)</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Tool inputs: code, text, files, JSON, SQL, regex patterns, etc.</li>
                  <li>Tool outputs: formatted, encoded, converted, or generated data</li>
                  <li>Generated secrets: passwords, JWTs, UUIDs, keys, certificates</li>
                  <li>Any data processed entirely within your browser</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="4-purpose">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">4. Purposes of Processing</h2>
            <p className="mt-2">We process personal data only for the following specific, explicit, and legitimate purposes:</p>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">1. Service Delivery & Security (Art. 6(1)(f))</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Deliver static assets via CDN (Cloudflare)</li>
                  <li>DDoS protection, WAF, bot mitigation</li>
                  <li>Rate limiting, abuse prevention, fraud detection</li>
                  <li>Platform stability and uptime monitoring</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">2. Analytics & Improvement (Art. 6(1)(a) — Consent)</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Understand tool popularity and usage patterns</li>
                  <li>Identify errors, performance bottlenecks, UX issues</li>
                  <li>Prioritize feature development and bug fixes</li>
                  <li>No profiling, no automated decision-making</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">3. Advertising (Art. 6(1)(a) — Consent)</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Display relevant ads via Google AdSense</li>
                  <li>Measure ad performance and prevent fraud</li>
                  <li>Only with explicit consent; non-personalized by default</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">4. Communication (Art. 6(1)(b)/(f))</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Respond to contact form inquiries</li>
                  <li>Send critical service notifications (security, legal)</li>
                  <li>No marketing emails without separate opt-in</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">5. Legal Compliance (Art. 6(1)(c))</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Comply with valid legal requests, court orders</li>
                  <li>DMCA/copyright takedown processing</li>
                  <li>Regulatory reporting obligations</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="5-recipients">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">5. Recipients & Subprocessors</h2>
            <p className="mt-2">
              We share personal data only with the following categories of recipients, each bound by contractual
              data protection obligations (Art. 28 GDPR):
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Recipient</th>
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Purpose</th>
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Legal Basis</th>
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Location</th>
                    <th className="py-2 text-left font-semibold text-[var(--color-text)]">DPA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr>
                    <td className="py-2 pr-4 font-mono">Cloudflare, Inc.</td>
                    <td className="py-2 pr-4">CDN, DNS, WAF, DDoS, Analytics</td>
                    <td className="py-2 pr-4">Legitimate Interest / DPA</td>
                    <td className="py-2 pr-4">Global (US HQ)</td>
                    <td className="py-2 pr-4">Executed (SCCs + DPF)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">Google LLC (GA4)</td>
                    <td className="py-2 pr-4">Analytics (with consent)</td>
                    <td className="py-2 pr-4">Consent (Art. 6(1)(a))</td>
                    <td className="py-2 pr-4">Global (US HQ)</td>
                    <td className="py-2 pr-4">Executed (SCCs + DPF)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">Google LLC (AdSense)</td>
                    <td className="py-2 pr-4">Advertising (with consent)</td>
                    <td className="py-2 pr-4">Consent (Art. 6(1)(a))</td>
                    <td className="py-2 pr-4">Global (US HQ)</td>
                    <td className="py-2 pr-4">Executed (SCCs + DPF)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">Vercel / Hosting Provider</td>
                    <td className="py-2 pr-4">Static hosting, edge functions</td>
                    <td className="py-2 pr-4">Legitimate Interest / DPA</td>
                    <td className="py-2 pr-4">Global (US HQ)</td>
                    <td className="py-2 pr-4">Executed (SCCs + DPF)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">Email Provider (Transactional)</td>
                    <td className="py-2 pr-4">Contact form delivery</td>
                    <td className="py-2 pr-4">Contract (Art. 6(1)(b))</td>
                    <td className="py-2 pr-4">Global</td>
                    <td className="py-2 pr-4">Executed</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              A full subprocessor list is available on request.
              All subprocessors execute Data Processing Agreements with SCCs and adhere to EU-US Data Privacy Framework where applicable.
            </p>
          </section>

          <section id="6-international-transfers">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">6. International Data Transfers</h2>
            <p className="mt-2">
              Some subprocessors are located outside the EEA/UK. We ensure adequate safeguards under Chapter V GDPR:
            </p>
            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Standard Contractual Clauses (SCCs)</h3>
                <p className="mt-1 text-sm">
                  All subprocessors outside EEA/UK/CH execute EU Commission-approved SCCs (2021/914) as Controller-to-Processor
                  or Processor-to-Processor modules, supplemented by UK Addendum where applicable.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">EU-US Data Privacy Framework</h3>
                <p className="mt-1 text-sm">
                  US-based subprocessors (Cloudflare, Google, Vercel) self-certify under the EU-US DPF (2023 adequacy decision).
                  UK Extension applies for UK data flows.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Transfer Impact Assessments (TIAs)</h3>
                <p className="mt-1 text-sm">
                  We conduct TIAs for all third-country transfers, evaluating: local surveillance laws, government access
                  mechanisms, data subject rights enforceability, and supplementary measures (encryption, pseudonymization).
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">No Transfer of Your Tool Data</h3>
                <p className="mt-1 text-sm">
                  Critically, <strong>your tool inputs and outputs never leave your browser</strong>. No international transfer
                  occurs for your code, files, or generated outputs.
                </p>
              </div>
            </div>
          </section>

          <section id="7-retention">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">7. Data Retention Periods</h2>
            <p className="mt-2">
              We retain personal data only as long as necessary for the purposes outlined above, or as required by law:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Data Category</th>
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Retention Period</th>
                    <th className="py-2 text-left font-semibold text-[var(--color-text)]">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr><td className="py-2 pr-4 font-mono text-xs">Server access logs (IP, UA, timestamps)</td><td className="py-2 pr-4">30 days (rolling)</td><td className="py-2 pr-4">Security, Art. 6(1)(f)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">Cloudflare analytics (aggregated)</td><td className="py-2 pr-4">13 months</td><td className="py-2 pr-4">Analytics, Art. 6(1)(f)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">GA4 client_id, events (with consent)</td><td className="py-2 pr-4">14 months (GA4 default)</td><td className="py-2 pr-4">Consent, Art. 6(1)(a)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">Cookie consent record</td><td className="py-2 pr-4">12 months from last update</td><td className="py-2 pr-4">ePrivacy, Art. 6(1)(c)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">Theme/preferences (localStorage)</td><td className="py-2 pr-4">Until cleared by user</td><td className="py-2 pr-4">Legitimate interest, client-side</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">Contact form submissions</td><td className="py-2 pr-4">12 months after resolution</td><td className="py-2 pr-4">Contract/Legitimate interest</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">DMCA/copyright records</td><td className="py-2 pr-4">3 years</td><td className="py-2 pr-4">Legal obligation (17 USC 512)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">Security incident logs</td><td className="py-2 pr-4">2 years</td><td className="py-2 pr-4">Legal obligation, Art. 6(1)(c)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">Tool inputs/outputs (client-side)</td><td className="py-2 pr-4">Never (never on our servers)</td><td className="py-2 pr-4">N/A — client-side only</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              After retention periods expire, data is securely deleted or irreversibly anonymized. Backups are purged
              within 30 days of primary deletion.
            </p>
          </section>

          <section id="8-your-rights">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">8. Your Rights (GDPR Arts. 15-22, CCPA)</h2>
            <p className="mt-2">
              You have the following rights regarding your personal data. We honor all applicable rights:
            </p>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Right of Access (Art. 15 GDPR, §1798.100 CCPA)</h3>
                <p className="mt-1 text-sm">Request confirmation of processing and a copy of your personal data.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Right to Rectification (Art. 16 GDPR)</h3>
                <p className="mt-1 text-sm">Request correction of inaccurate or incomplete personal data.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Right to Erasure / "Right to Be Forgotten" (Art. 17 GDPR, §1798.105 CCPA)</h3>
                <p className="mt-1 text-sm">Request deletion where data is no longer necessary, consent withdrawn, or processing unlawful.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Right to Restriction (Art. 18 GDPR)</h3>
                <p className="mt-1 text-sm">Request limitation of processing pending verification or objection.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Right to Data Portability (Art. 20 GDPR)</h3>
                <p className="mt-1 text-sm">Receive your data in a structured, commonly used, machine-readable format.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Right to Object (Art. 21 GDPR)</h3>
                <p className="mt-1 text-sm">Object to processing based on legitimate interest (Art. 6(1)(f)) or direct marketing.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Rights re: Automated Decision-Making (Art. 22 GDPR)</h3>
                <p className="mt-1 text-sm">Not applicable — we do not engage in automated decision-making or profiling with legal effects.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Right to Withdraw Consent (Art. 7(3) GDPR)</h3>
                <p className="mt-1 text-sm">Withdraw cookie/analytics consent anytime via <a href="/cookie-policy" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">Cookie Preferences</a> in footer.</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">CCPA Rights (§1798.100-1798.199)</h3>
                <p className="mt-1 text-sm">Know, access, delete, opt-out of sale (we don't sell), non-discrimination for exercising rights.</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30">
              <h3 className="font-semibold text-[var(--color-accent)]">How to Exercise Your Rights</h3>
              <p className="mt-2 text-sm">
                Email <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a>
                or use our <a href="/contact" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact form</a>.
                We verify identity and respond within 30 days (extendable to 60 days for complex requests).
                No fee for standard requests.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text)]">Supervisory Authority Complaint</h3>
              <p className="mt-1 text-sm">
                You have the right to lodge a complaint with a supervisory authority, e.g.:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                <li><strong>EU:</strong> <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">Your national DPA</a></li>
                <li><strong>UK:</strong> <a href="https://ico.org.uk/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">ICO</a></li>
                <li><strong>CA:</strong> <a href="https://www.priv.gc.ca/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">OPC</a></li>
              </ul>
            </div>
          </section>

          <section id="9-security">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">9. Data Security Measures (Art. 32 GDPR)</h2>
            <p className="mt-2">
              We implement appropriate technical and organizational measures to ensure a level of security appropriate
              to the risk, including:
            </p>
            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Encryption & Transport</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>TLS 1.2+ for all traffic (HSTS with preload)</li>
                  <li>Certificate Transparency monitoring</li>
                  <li>No server-side storage of user content = no encryption-at-rest needed for tool data</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Application Security</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Strict per-route hash-based CSP served at edge; no nonces</li>
                  <li>Subresource Integrity (SRI) for all third-party resources</li>
                  <li>Permissions-Policy restricting browser features</li>
                  <li>Referrer-Policy: strict-origin-when-cross-origin</li>
                  <li>X-Content-Type-Options: nosniff; X-Frame-Options: DENY</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Infrastructure & Resilience</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Global CDN with DDoS protection (Cloudflare)</li>
                  <li>WAF with OWASP Top 10 rules</li>
                  <li>Static hosting on edge network (99.9%+ uptime SLA)</li>
                  <li>Service Worker for offline-capable tool access</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Organizational Measures</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Privacy by design: client-side architecture eliminates server-side data risk</li>
                  <li>Minimal data collection principle</li>
                  <li>No employee access to user tool data (architecturally impossible)</li>
                  <li>Regular dependency scanning (Dependabot, Snyk)</li>
                  <li>Incident response plan with 24-hour notification target</li>
                  <li>Annual security review and penetration testing</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Testing & Monitoring</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Automated security scanning in CI/CD pipeline</li>
                  <li>CSP violation reporting and monitoring</li>
                  <li>Dependabot alerts for vulnerable dependencies</li>
                  <li>Regular third-party penetration testing</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="10-automated-decision">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">10. Automated Decision-Making & Profiling</h2>
            <p className="mt-2">
              We do <strong>not</strong> engage in automated decision-making or profiling that produces legal effects
              or similarly significantly affects you (Art. 22 GDPR).
            </p>
            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-200">No Automated Decisions</h3>
                <p className="mt-1 text-sm">
                  No algorithmic decision-making affects your legal status, rights, or access to services.
                  Tool outputs are deterministic transformations of your input — you remain in full control.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">No Profiling</h3>
                <p className="mt-1 text-sm">
                  We do not build profiles of your behavior, preferences, or characteristics for automated decisions.
                  Analytics data is aggregated and pseudonymized; no individual profiling occurs.
                </p>
              </div>
            </div>
          </section>

          <section id="11-cookies">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">11. Cookies & Similar Technologies</h2>
            <p className="mt-2">
              We use cookies and localStorage for essential functionality and optional analytics/advertising.
              See our <a href="/cookie-policy" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">Cookie Policy</a> for full details.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Category</th>
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Cookies / Storage</th>
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Purpose</th>
                    <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text)]">Duration</th>
                    <th className="py-2 text-left font-semibold text-[var(--color-text)]">Consent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr><td className="py-2 pr-4 font-semibold">Necessary</td><td className="py-2 pr-4 font-mono text-xs">cookie-consent, theme</td><td className="py-2 pr-4">Consent record, theme preference</td><td className="py-2 pr-4">1 year / persistent</td><td className="py-2 pr-4">No (Art. 6(1)(c)/(f))</td></tr>
                  <tr><td className="py-2 pr-4 font-semibold">Functional</td><td className="py-2 pr-4 font-mono text-xs">tool-settings-* (localStorage)</td><td className="py-2 pr-4">Tool preferences (indent, encoding, etc.)</td><td className="py-2 pr-4">Until cleared</td><td className="py-2 pr-4">Yes (Art. 6(1)(a))</td></tr>
                  <tr><td className="py-2 pr-4 font-semibold">Analytics</td><td className="py-2 pr-4 font-mono text-xs">_ga, _ga_*, _gid</td><td className="py-2 pr-4">GA4 usage analytics</td><td className="py-2 pr-4">2 years / 24h</td><td className="py-2 pr-4">Yes (Art. 6(1)(a))</td></tr>
                  <tr><td className="py-2 pr-4 font-semibold">Advertising</td><td className="py-2 pr-4 font-mono text-xs">Google AdSense cookies</td><td className="py-2 pr-4">Personalized ads, fraud prevention</td><td className="py-2 pr-4">Varies (Google)</td><td className="py-2 pr-4">Yes (Art. 6(1)(a))</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm">
              Manage preferences anytime: <a href="/cookie-policy" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">Cookie Preferences</a> (footer link).
              You can also delete cookies via browser settings.
            </p>
          </section>

          <section id="12-children">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">12. Children's Privacy (COPPA, GDPR Art. 8)</h2>
            <p className="mt-2">
              DevStackIO is a developer tools platform intended for professionals, students, and hobbyists.
              We do not knowingly collect personal data from children under 13 (US) or under the age of
              digital consent in their jurisdiction (13-16 per GDPR Art. 8).
            </p>
            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">If You Are a Parent/Guardian</h3>
                <p className="mt-1 text-sm">
                  If you believe your child has provided personal data, contact us at
                  <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a>.
                  We will verify and delete promptly.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)]">Age Verification</h3>
                <p className="mt-1 text-sm">
                  We do not implement age gates as our tools do not target children. Contact form includes
                  "I am 13+" checkbox. Analytics consent requires affirmative action (no pre-checked boxes).
                </p>
              </div>
            </div>
          </section>

          <section id="13-changes">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">13. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy to reflect legal changes, new features, or operational improvements.
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>Material changes: Posted on this page with updated "Last updated" date; website banner notification; email to registered API users (if applicable).</li>
              <li>Effective date: 30 days after posting (or immediately for legal compliance).</li>
              <li>Version history maintained at bottom of this page.</li>
              <li>Continued use after effective date constitutes acceptance.</li>
            </ul>
            <div className="mt-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text)]">Version History</h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex flex-col sm:flex-row gap-2">
                  <dt className="font-semibold text-[var(--color-text)]">2026-07-20 (v2.0)</dt>
                  <dd className="text-[var(--color-text-muted)]">Full GDPR Art. 13/14 compliance; DPA reference; lawful basis table; international transfers; retention schedule; children's privacy.</dd>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <dt className="font-semibold text-[var(--color-text)]">2026-06-15 (v1.0)</dt>
                  <dd className="text-[var(--color-text-muted)]">Initial version.</dd>
                </div>
              </dl>
            </div>
          </section>

          <section id="14-contact">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">14. Contact & Data Protection Officer</h2>
            <div className="mt-4 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
              <p><strong>General Privacy Inquiries:</strong> <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a></p>
              <p><strong>Data Protection Officer (DPO):</strong> <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a></p>
              <p><strong>Data Subject Requests:</strong> <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a></p>
              <p><strong>Security Vulnerabilities:</strong> <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a></p>
              <p><strong>EU Representative (Art. 27 GDPR):</strong> <a href="mailto:contact@devstackio.com" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">contact@devstackio.com</a></p>
              <p><strong>Postal:</strong> DevStackIO, Privacy Team, 123 Developer Way, San Francisco, CA 94102, USA</p>
            </div>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              We respond to all legitimate requests within 30 days (extendable to 60 days for complex requests).
              No fee for standard requests. Identity verification may be required.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Related Documents</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-sm text-[var(--color-text-muted)]">
            <li><a href="/terms" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">Terms of Service</a></li>
            <li><a href="/cookie-policy" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">Cookie Policy</a></li>
            <li><a href="/dpa" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">Data Processing Addendum (DPA)</a></li>
            <li><a href="/acceptable-use" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">Acceptable Use Policy</a></li>
            <li><a href="/dmca" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">DMCA / Copyright Policy</a></li>
            <li><a href="/security" className="text-[var(--color-accent)] underline hover:text-[var(--color-accent-hover)]">Security Policy</a></li>
          </ul>
        </div>
      </article>
    </div>
  );
}
