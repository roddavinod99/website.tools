import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Security Policy",
  description: "DevStackIO Security Policy. How we protect user data, report vulnerabilities, and maintain platform security.",
  alternates: { canonical: `${siteConfig.url}/security` },
  openGraph: {
    title: "Security Policy | DevStackIO",
    description: "Learn how DevStackIO protects user data and how to report security vulnerabilities.",
    url: `${siteConfig.url}/security`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Security Policy" }],
  },
};

export default function SecurityPage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.security || "2026-07-20";
  const effectiveDate = "2026-07-20";

  return (
    <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-surface-500 dark:text-dark-muted">
            Last updated: {lastUpdated} | Effective: {effectiveDate}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Security Policy
          </h1>
          <p className="mt-2 text-lg text-surface-600 dark:text-dark-muted">
            DevStackIO is a privacy-first, browser-based tools platform. This policy describes how we protect user
            data, our security architecture, and how to report a vulnerability.
          </p>
        </div>

        <div className="space-y-8 text-surface-600 dark:text-dark-muted">
          <section>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Supported Versions</h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-surface-200 dark:border-dark-border">
              <table className="table-base">
                <thead>
                  <tr className="bg-surface-50 dark:bg-dark-surface">
                    <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Version</th>
                    <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Supported</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-surface-200 dark:border-dark-border">
                    <td className="table-cell text-surface-900 dark:text-dark-text">0.1.x</td>
                    <td className="table-cell text-surface-900 dark:text-dark-text">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Reporting a Vulnerability</h2>
            <p className="mt-2">
              We take security seriously. If you discover a security vulnerability, please report it privately:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border space-y-2">
              <p><strong>Email:</strong> <a href="mailto:security@devstackio.com" className="text-brand-500 underline hover:text-brand-600">security@devstackio.com</a></p>
              <p><strong>GitHub Security Advisories:</strong>{" "}
                <a href="https://github.com/roddavinod99/tools/security/advisories/new" className="text-brand-500 underline hover:text-brand-600">Report a security advisory</a>
              </p>
            </div>
            <p className="mt-4">
              Please do <strong>not</strong> report security vulnerabilities through public GitHub issues.
            </p>

            <div className="mt-6">
              <h3 className="font-semibold text-surface-900 dark:text-dark-text">What to Include</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Type of vulnerability</li>
                <li>Steps to reproduce</li>
                <li>Affected versions</li>
                <li>Potential impact</li>
                <li>Suggested fix (if any)</li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-surface-900 dark:text-dark-text">Response Timeline</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><strong>24 hours:</strong> Initial acknowledgment</li>
                <li><strong>7 days:</strong> Assessment and severity determination</li>
                <li><strong>30 days:</strong> Fix deployed (for critical issues)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Security Architecture</h2>

            <div className="mt-4">
              <h3 className="font-semibold text-surface-900 dark:text-dark-text">Defense in Depth</h3>
              <div className="mt-3 space-y-4">
                <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                  <h4 className="font-mono text-sm font-semibold text-surface-900 dark:text-dark-text">Layer 1: Nginx Reverse Proxy</h4>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                    <li>TLS 1.2/1.3</li>
                    <li>Rate limiting (3 zones)</li>
                    <li>Bad user-agent blocking</li>
                    <li>Path traversal blocking</li>
                    <li>Attack path blocking (.php, wp-admin, .env, .git)</li>
                    <li>Security headers (CSP, HSTS, etc.)</li>
                    <li>Request size limits (10 MB)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                  <h4 className="font-mono text-sm font-semibold text-surface-900 dark:text-dark-text">Layer 2: Next.js Middleware (proxy.ts)</h4>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                    <li>Application rate limiting</li>
                    <li>Security headers</li>
                    <li>Request validation</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                  <h4 className="font-mono text-sm font-semibold text-surface-900 dark:text-dark-text">Layer 3: API Routes</h4>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                    <li>Input sanitization</li>
                    <li>Content-Type enforcement</li>
                    <li>Origin/Referer validation</li>
                    <li>Body size limits</li>
                    <li>IP redaction in storage</li>
                    <li>Structured logging (no secrets)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                  <h4 className="font-mono text-sm font-semibold text-surface-900 dark:text-dark-text">Layer 4: Client-Side</h4>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-sm">
                    <li>DOMPurify HTML/SVG sanitization</li>
                    <li>Content Security Policy enforcement</li>
                    <li>Web Worker isolation</li>
                    <li>Service Worker (cache-first for assets)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-surface-900 dark:text-dark-text">Security Headers</h3>
              <div className="mt-3 overflow-x-auto rounded-lg border border-surface-200 dark:border-dark-border">
                <table className="table-base">
                  <thead>
                    <tr className="bg-surface-50 dark:bg-dark-surface">
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Header</th>
                      <th className="table-header text-left text-surface-600 dark:text-dark-muted font-medium">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Strict-Transport-Security", "Enforce HTTPS"],
                      ["Content-Security-Policy", "XSS prevention"],
                      ["X-Content-Type-Options", "MIME sniffing prevention"],
                      ["X-Frame-Options", "Clickjacking prevention"],
                      ["Referrer-Policy", "Referrer leakage prevention"],
                      ["Permissions-Policy", "Feature restriction"],
                      ["Cross-Origin-Opener-Policy", "Cross-origin isolation"],
                      ["Cross-Origin-Resource-Policy", "Resource isolation"],
                    ].map(([header, purpose]) => (
                      <tr key={header} className="border-t border-surface-200 dark:border-dark-border">
                        <td className="table-cell font-mono text-surface-900 dark:text-dark-text">{header}</td>
                        <td className="table-cell text-surface-900 dark:text-dark-text">{purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-surface-900 dark:text-dark-text">Data Protection</h3>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li><strong>No user data stored</strong> — All tool processing is client-side</li>
                <li><strong>IP addresses</strong> — SHA-256 hashed before storage</li>
                <li><strong>Form submissions</strong> — Redacted IPs, auto-purged at 500 entries</li>
                <li><strong>File uploads</strong> — Processed in memory only, never persisted</li>
                <li><strong>Logs</strong> — No secrets, no PII, no file contents</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Security Checklist</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Environment variables use production values (not defaults)",
                ".env files are NOT in git tracking",
                "SSL certificates are valid and auto-renewing",
                "Rate limiting is enabled (unless behind Cloudflare)",
                "CSP does not use unsafe-inline where avoidable",
                "All API inputs are validated and size-limited",
                "File upload limits are enforced at all layers",
                "Error messages don't leak internal details",
                "Dependencies are up to date (npm audit)",
                "Service worker uses HTTPS",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-surface-300 text-xs text-brand-500 dark:border-dark-border dark:text-brand-400">
                    ✓
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Related Documents</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-sm text-surface-600 dark:text-dark-muted">
            <li><a href="/terms" className="text-brand-500 underline hover:text-brand-600">Terms of Service</a></li>
            <li><a href="/privacy" className="text-brand-500 underline hover:text-brand-600">Privacy Policy</a></li>
            <li><a href="/acceptable-use" className="text-brand-500 underline hover:text-brand-600">Acceptable Use Policy</a></li>
            <li><a href="/dpa" className="text-brand-500 underline hover:text-brand-600">Data Processing Addendum (DPA)</a></li>
            <li><a href="/dmca" className="text-brand-500 underline hover:text-brand-600">DMCA / Copyright Policy</a></li>
          </ul>
        </div>

        <div className="mt-8 p-6 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Contact</h2>
          <p className="mt-2 text-surface-600 dark:text-dark-muted">
            Questions about this Security Policy? Contact us at
            <a href="mailto:security@devstackio.com" className="text-brand-500 underline hover:text-brand-600">security@devstackio.com</a>.
          </p>
        </div>
      </article>
    </div>
  );
}