/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "DevStackIO Acceptable Use Policy. Defines prohibited uses of our developer tools and platform.",
  alternates: { canonical: `${siteConfig.url}/acceptable-use` },
  openGraph: {
    title: "Acceptable Use Policy | DevStackIO",
    description: "Review the acceptable use policy for DevStackIO developer tools and platform.",
    url: `${siteConfig.url}/acceptable-use`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Acceptable Use Policy" }],
  },
};

export default function AcceptableUsePage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.acceptableUse || "2026-07-20";
  const effectiveDate = "2026-07-20";

  return (
    <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-surface-500 dark:text-dark-muted">
            Last updated: {lastUpdated} | Effective: {effectiveDate}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Acceptable Use Policy
          </h1>
          <p className="mt-2 text-lg text-surface-600 dark:text-dark-muted">
            This policy defines acceptable and prohibited uses of DevStackIO tools and services.
            By using DevStackIO, you agree to comply with this policy.
          </p>
        </div>

        <div className="mb-8 p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
          <p className="text-sm text-brand-700 dark:text-brand-300">
            <strong>Scope:</strong> This policy applies to all users of DevStackIO tools, website, API, and services.
            It supplements our{" "}
            <a href="/terms" className="underline hover:text-brand-600">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:text-brand-600">Privacy Policy</a>.
            Violations may result in suspension or termination of access.
          </p>
        </div>

        <nav className="mb-8 p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-dark-text mb-3">Table of Contents</h2>
          <ol className="list-decimal pl-6 space-y-1 text-sm text-surface-600 dark:text-dark-muted">
            <li><a href="#1-general-principles" className="text-brand-500 hover:underline">1. General Principles</a></li>
            <li><a href="#2-prohibited-activities" className="text-brand-500 hover:underline">2. Prohibited Activities</a></li>
            <li><a href="#3-tool-specific-restrictions" className="text-brand-500 hover:underline">3. Tool-Specific Restrictions</a></li>
            <li><a href="#4-api-usage" className="text-brand-500 hover:underline">4. API Usage (Current and Future)</a></li>
            <li><a href="#5-security-and-integrity" className="text-brand-500 hover:underline">5. Security and Integrity</a></li>
            <li><a href="#6-intellectual-property" className="text-brand-500 hover:underline">6. Intellectual Property</a></li>
            <li><a href="#7-user-conduct" className="text-brand-500 hover:underline">7. User Conduct</a></li>
            <li><a href="#8-enforcement" className="text-brand-500 hover:underline">8. Enforcement and Consequences</a></li>
            <li><a href="#9-reporting-violations" className="text-brand-500 hover:underline">9. Reporting Violations</a></li>
            <li><a href="#10-changes" className="text-brand-500 hover:underline">10. Changes to This Policy</a></li>
          </ol>
        </nav>

        <div className="space-y-8 text-surface-600 dark:text-dark-muted">
          <section id="1-general-principles">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">1. General Principles</h2>
            <div className="mt-4 space-y-4">
              <p>
                DevStackIO provides free, browser-based developer tools for formatting, converting, generating, and
                analyzing data. Our tools process data entirely in your browser — nothing is uploaded to our servers.
                This architecture reflects our commitment to privacy and security.
              </p>
              <p>
                By using DevStackIO, you agree to use our tools responsibly, ethically, and in compliance with all
                applicable laws and this policy.
              </p>
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-2">Core Principles</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Lawful Use:</strong> Use tools only for lawful purposes.</li>
                  <li><strong>Respect Privacy:</strong> Do not process others' private data without consent.</li>
                  <li><strong>No Harm:</strong> Do not use tools to create, facilitate, or distribute harmful content.</li>
                  <li><strong>Respect Resources:</strong> Do not abuse, overload, or attempt to circumvent our infrastructure.</li>
                  <li><strong>Attribution:</strong> Respect intellectual property rights and licensing requirements.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="2-prohibited-activities">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">2. Prohibited Activities</h2>
            <p className="mt-2">The following activities are strictly prohibited:</p>
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">2.1 Illegal Activities</h3>
                <ul className="mt-2 list-disc pl-6 space-y-2">
                  <li>Processing, generating, or facilitating illegal content, activities, or instructions</li>
                  <li>Generating code, configs, or data for malware, exploits, ransomware, or cyberattacks</li>
                  <li>Creating tools for unauthorized access, privilege escalation, or data exfiltration</li>
                  <li>Generating content for fraud, identity theft, phishing, or social engineering</li>
                  <li>Processing data for sanctions evasion, money laundering, or terrorist financing</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">2.2 Harmful Content</h3>
                <ul className="mt-2 list-disc pl-6 space-y-2">
                  <li>Generating content that promotes violence, self-harm, or terrorism</li>
                  <li>Creating content that exploits minors or vulnerable populations</li>
                  <li>Generating hate speech, harassment, or discriminatory content</li>
                  <li>Creating deepfakes, impersonation content, or non-consensual intimate imagery</li>
                  <li>Producing disinformation, election interference, or manipulation campaigns</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">2.3 Security Violations</h3>
                <ul className="mt-2 list-disc pl-6 space-y-2">
                  <li>Attempting to reverse-engineer, decompile, or extract source code from our tools</li>
                  <li>Probing, scanning, or testing our infrastructure for vulnerabilities without authorization</li>
                  <li>Attempting to bypass rate limits, quotas, or access controls</li>
                  <li>Injecting malicious code, scripts, or payloads into tool inputs</li>
                  <li>Attempting to extract, exfiltrate, or access other users' data (architecturally impossible but prohibited)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">2.4 Abuse and Overload</h3>
                <ul className="mt-2 list-disc pl-6 space-y-2">
                  <li>Automated scraping, crawling, or bulk API calls without explicit permission</li>
                  <li>Running tools in automated loops, bots, or scripts that degrade performance</li>
                  <li>Distributed or coordinated usage to circumvent limits</li>
                  <li>Using tools for cryptocurrency mining, password cracking, or resource-intensive brute forcing</li>
                  <li>Intentional generation of malformed inputs to crash or freeze tools</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">2.5 Intellectual Property Violations</h3>
                <ul className="mt-2 list-disc pl-6 space-y-2">
                  <li>Using tools to remove copyright notices, watermarks, or attribution</li>
                  <li>Generating content that infringes patents, trademarks, trade secrets, or copyrights</li>
                  <li>Removing license headers, copyright notices, or SPDX identifiers from generated code</li>
                  <li>Using tools to circumvent DRM, license checks, or copy protection</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">2.6 Privacy Violations</h3>
                <ul className="mt-2 list-disc pl-6 space-y-2">
                  <li>Processing personal data without lawful basis or consent (GDPR Art. 6)</li>
                  <li>Inputting others' private data (PII, credentials, keys, tokens) into tools</li>
                  <li>Using tools to de-anonymize, re-identify, or link anonymous data</li>
                  <li>Generating synthetic PII that resembles real individuals</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="3-tool-specific-restrictions">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">3. Tool-Specific Restrictions</h2>
            <p className="mt-2">Certain tool categories have additional restrictions:</p>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Security & Cryptography Tools</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Do not use for generating production secrets without proper entropy review</li>
                  <li>Do not use generated keys/certs in production without independent validation</li>
                  <li>JWT tools: Do not use for token forging, privilege escalation, or bypassing auth</li>
                  <li>Hash tools: Do not use for password cracking, rainbow tables, or credential stuffing</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Network & Infrastructure Tools</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>DNS/IP tools: Do not use for reconnaissance, enumeration, or attack planning</li>
                  <li>Certificate tools: Do not use for MITM, spoofing, or impersonation</li>
                  <li>Subnet/IP tools: Do not use for network scanning or unauthorized access planning</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Encoding/Decoding & Data Tools</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Base64/URL/HTML tools: Do not use for obfuscating malicious payloads</li>
                  <li>Data converters: Do not use for data exfiltration formatting</li>
                  <li>Binary/hex tools: Do not use for shellcode generation or exploit development</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Generators (UUID, Password, QR, etc.)</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Do not generate credentials for unauthorized access</li>
                  <li>QR codes: Do not encode malicious URLs, phishing links, or exploit payloads</li>
                  <li>Password generator: Use for legitimate account security only</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Formatters & Validators</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Do not use for formatting obfuscated malware code</li>
                  <li>SQL formatter: Do not use for SQL injection payload formatting</li>
                  <li>Regex tester: Do not use for ReDoS pattern development</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="4-api-usage">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">4. API Usage (Current and Future)</h2>
            <p className="mt-2">
              DevStackIO currently provides a web interface. If/when a public API is released, the following
              will apply in addition to this policy:
            </p>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Rate Limits</h3>
                <p className="mt-2 text-sm">Respect published rate limits. Do not circumvent via multiple keys, IPs, or accounts.</p>
              </div>
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Authentication</h3>
                <p className="mt-2 text-sm">Use only your own API keys. Do not share, sell, or transfer keys.</p>
              </div>
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Data Handling</h3>
                <p className="mt-2 text-sm">Do not submit PII, secrets, or confidential data via API unless explicitly supported.</p>
              </div>
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Attribution</h3>
                <p className="mt-2 text-sm">Display "Powered by DevStackIO" or equivalent attribution in API-driven applications.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-surface-500 dark:text-dark-muted">
              A separate API Terms of Service will govern API access upon release.
            </p>
          </section>

          <section id="5-security-and-integrity">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">5. Security and Integrity</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">5.1 Vulnerability Disclosure</h3>
                <p className="mt-2">
                  We encourage responsible security research. If you discover a vulnerability, please report it via:
                </p>
                <div className="mt-2 p-3 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                  <p><strong>Email:</strong> <a href="mailto:security@devstackio.com" className="text-brand-500 hover:underline">security@devstackio.com</a></p>
                  <p><strong>PGP:</strong> Available on request</p>
                </div>
                <p className="mt-2 text-sm">
                  We commit to acknowledging reports within 48 hours and providing a timeline for remediation.
                  Do not publicly disclose vulnerabilities before a fix is deployed.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">5.2 No Warranty on Security</h3>
                <p className="mt-2">
                  While we implement strong security measures (CSP, HSTS, SRI, client-side architecture),
                  no system is completely secure. You use tools at your own risk. Verify outputs independently
                  for security-critical applications.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">5.3 Client-Side Architecture</h3>
                <p className="mt-2">
                  Our tools run entirely in your browser. This means:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>Your data never leaves your device (except for optional analytics with consent)</li>
                  <li>We cannot access, monitor, or control your tool usage</li>
                  <li>Security of your browser environment is your responsibility</li>
                  <li>Keep your browser, OS, and extensions updated</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="6-intellectual-property">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">6. Intellectual Property</h2>
            <div className="mt-4 space-y-4">
              <p>
                DevStackIO name, logo, brand, website design, and tool implementations are our intellectual property.
                You retain all rights to your input data and tool outputs.
              </p>
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Permitted Uses</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Personal and commercial use of tools and outputs</li>
                  <li>Incorporation of tool outputs into your projects, products, or services</li>
                  <li>Sharing tool outputs with colleagues, clients, or in documentation</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Restricted Uses</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                  <li>Redistributing, reselling, or rebranding the DevStackIO tools themselves</li>
                  <li>Creating derivative works of our tool implementations (not outputs)</li>
                  <li>Using our brand, logo, or name to imply endorsement without permission</li>
                  <li>Reverse engineering, decompiling, or extracting our source code</li>
                </ul>
              </div>
              <p className="text-sm text-surface-500 dark:text-dark-muted">
                Open source components within our tools remain under their respective licenses (MIT, Apache-2.0, etc.).
                See individual tool credits for details.
              </p>
            </div>
          </section>

          <section id="7-user-conduct">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">7. User Conduct</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">7.1 Account-Free Usage</h3>
                <p className="mt-2">
                  DevStackIO requires no account. This means we cannot enforce per-user bans. Instead, we may:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>Block abusive IP ranges or ASNs</li>
                  <li>Implement CAPTCHA or proof-of-work challenges</li>
                  <li>Rate limit by fingerprint or behavioral patterns</li>
                  <li>Restrict access to specific tools or features</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">7.2 Shared Responsibility</h3>
                <p className="mt-2">
                  If you share access to DevStackIO (e.g., in a team, classroom, or organization), you are responsible
                  for all use under your session. Ensure all users comply with this policy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">7.3 Educational and Research Use</h3>
                <p className="mt-2">
                  Academic, educational, and security research use is permitted and encouraged. When using tools
                  for vulnerability research, malware analysis, or security education:
                </p>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>Clearly label research outputs</li>
                  <li>Do not test on production systems without authorization</li>
                  <li>Follow responsible disclosure practices</li>
                  <li>Cite DevStackIO as the tool source in publications</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="8-enforcement">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">8. Enforcement and Consequences</h2>
            <div className="mt-4 space-y-4">
              <p>
                We enforce this policy through technical measures and, where necessary, legal action:
              </p>
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Progressive Enforcement</h3>
                <ol className="mt-2 list-decimal pl-6 space-y-2 text-sm">
                  <li><strong>Warning:</strong> Automated notice for first minor violation</li>
                  <li><strong>Temporary Restriction:</strong> Rate limiting, CAPTCHA, or feature limits (24h-7d)</li>
                  <li><strong>Extended Restriction:</strong> IP/ASN blocking, feature suspension (7d-90d)</li>
                  <li><strong>Permanent Block:</strong> Persistent or severe violations</li>
                  <li><strong>Legal Action:</strong> For criminal activity, IP theft, or significant harm</li>
                </ol>
              </div>
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Appeals</h3>
                <p className="mt-2 text-sm">
                  To appeal a restriction, contact <a href="mailto:appeals@devstackio.com" className="text-brand-500 hover:underline">appeals@devstackio.com</a>
                  with your IP, the restriction details, and explanation. We review appeals within 5 business days.
                </p>
              </div>
            </div>
          </section>

          <section id="9-reporting-violations">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">9. Reporting Violations</h2>
            <div className="mt-4 space-y-4">
              <p>
                Help us keep DevStackIO safe. Report violations to:
              </p>
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border space-y-2">
                <p><strong>Abuse/Security:</strong> <a href="mailto:abuse@devstackio.com" className="text-brand-500 hover:underline">abuse@devstackio.com</a></p>
                <p><strong>Copyright/DMCA:</strong> <a href="mailto:copyright@devstackio.com" className="text-brand-500 hover:underline">copyright@devstackio.com</a> (see <a href="/dmca" className="underline">DMCA Policy</a>)</p>
                <p><strong>General Policy:</strong> <a href="mailto:policy@devstackio.com" className="text-brand-500 hover:underline">policy@devstackio.com</a></p>
                <p><strong>Security Issues:</strong> <a href="mailto:security@devstackio.com" className="text-brand-500 hover:underline">security@devstackio.com</a> (see <a href="/security" className="underline">Security Policy</a>)</p>
              </div>
              <p className="text-sm text-surface-500 dark:text-dark-muted">
                Include: Description of violation, URL/tool involved, screenshots if applicable, and your contact info.
                Anonymous reports accepted but may limit follow-up.
              </p>
            </div>
          </section>

          <section id="10-changes">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">10. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Acceptable Use Policy from time to time. Changes will be posted on this page with
              an updated "Last updated" date. Material changes will be announced via:
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>Website banner or notice</li>
              <li>Blog post or changelog entry</li>
              <li>Email to registered API users (when applicable)</li>
            </ul>
            <p className="mt-4">
              Continued use of DevStackIO after changes constitutes acceptance. If you disagree with changes,
              you must cease using our services.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Related Documents</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-sm text-surface-600 dark:text-dark-muted">
            <li><a href="/terms" className="text-brand-500 hover:underline">Terms of Service</a></li>
            <li><a href="/privacy" className="text-brand-500 hover:underline">Privacy Policy</a></li>
            <li><a href="/cookie-policy" className="text-brand-500 hover:underline">Cookie Policy</a></li>
            <li><a href="/dmca" className="text-brand-500 hover:underline">DMCA / Copyright Policy</a></li>
            <li><a href="/dpa" className="text-brand-500 hover:underline">Data Processing Addendum (DPA)</a></li>
            <li><a href="/security" className="text-brand-500 hover:underline">Security Policy</a></li>
          </ul>
        </div>

        <div className="mt-8 p-6 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Contact</h2>
          <p className="mt-2 text-surface-600 dark:text-dark-muted">
            Questions about this Acceptable Use Policy? Contact us at
            <a href="mailto:policy@devstackio.com" className="text-brand-500 hover:underline">policy@devstackio.com</a>
            or use our <a href="/contact" className="text-brand-500 hover:underline">contact form</a>.
          </p>
        </div>
      </article>
    </div>
  );
}