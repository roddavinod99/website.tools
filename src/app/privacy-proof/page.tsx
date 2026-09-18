import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, EyeOff, Activity, Server, Lock, ExternalLink, ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Proof — Your Data Stays Local",
  description:
    "Verify DevStackIO privacy in 10 seconds: open Network tab, use any tool, see 0 requests with your data. Methodology, third-party disclosure, and live proof.",
  alternates: { canonical: `${siteConfig.url}/privacy-proof` },
  openGraph: {
    title: "Privacy Proof — Your Data Stays Local | DevStackIO",
    description: "Network-tab proof that tool inputs never leave your browser. Verify in 10 seconds.",
    url: `${siteConfig.url}/privacy-proof`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Privacy Proof" }],
  },
};

export default function PrivacyProofPage() {
  return (
    <div className="container py-12 md:py-16">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[var(--color-text)]">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-[var(--color-text)]">Privacy Proof</span>
      </nav>

      <article className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" aria-hidden="true" />
            Auditable in browser
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">Your data stays local — prove it in 10 seconds</h1>
          <p className="text-lg text-[var(--color-text-muted)]">
            All 172 tools run 100% client-side. No uploads, no server storage, no third-party transmission of your inputs. The proof is in your Network tab.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 font-medium"><EyeOff className="h-3.5 w-3.5" /> No upload</span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 font-medium"><Server className="h-3.5 w-3.5" /> No storage</span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 font-medium"><Activity className="h-3.5 w-3.5" /> 0 requests with data</span>
          </div>
        </header>

        <section className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]"><Activity className="h-5 w-5 text-blue-700 dark:text-blue-400" /> 10-second verification</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-[var(--color-text-muted)]">
            <li>Open any tool (e.g. <Link href="/tools/json-formatter" className="text-blue-700 dark:text-blue-400 underline">JSON Formatter</Link>)</li>
            <li>Press <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-0.5 font-mono text-xs">F12</kbd> → <strong>Network</strong> tab → clear</li>
            <li>Paste data, click Format/Convert</li>
            <li>Check Network: <strong>0 requests</strong> carry your input. Only static assets, analytics (if consented), and ads (if consented) appear.</li>
          </ol>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">Tip: Filter Network by <code>Fetch/XHR</code> — you will see nothing with your payload. View source in GitHub proves it.</p>
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]"><Lock className="h-5 w-5 text-blue-700 dark:text-blue-400" /> Methodology</h2>
          <ul className="list-disc space-y-1 pl-6 text-sm text-[var(--color-text-muted)]">
            <li><strong>Browser APIs only:</strong> Web Workers, Streams, File/Blob, Clipboard, Compression Streams — no server round-trip.</li>
            <li><strong>Open source:</strong> Every tool at <a href={siteConfig.links.toolsRepo} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-400 underline">github.com/roddavinod99/website.tools</a> — audit the pipeline.</li>
            <li><strong>Deterministic:</strong> Same input → same output, reproducible offline (airplane mode works).</li>
            <li><strong>Ephemeral:</strong> Blob URLs revoked on leave, memory freed — no persistence.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Third-party disclosure</h2>
          <p className="text-sm text-[var(--color-text-muted)]">We use only consent-gated, non-tool services. None receives your tool inputs.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-text-muted)]"><th className="pb-2 pr-4">Service</th><th className="pb-2 pr-4">Purpose</th><th className="pb-2">Your data?</th></tr></thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                <tr><td className="py-2 pr-4 font-medium">Google Analytics 4</td><td className="py-2 pr-4">Aggregated usage (with consent)</td><td className="py-2">No inputs, pseudonymous, IP anonymized</td></tr>
                <tr><td className="py-2 pr-4 font-medium">Google AdSense</td><td className="py-2 pr-4">Ads (with consent)</td><td className="py-2">No inputs</td></tr>
                <tr><td className="py-2 pr-4 font-medium">Cloudflare</td><td className="py-2 pr-4">CDN/WAF</td><td className="py-2">IP/UA for security, no tool payload</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">Manage consent anytime via <Link href="/cookie-policy" className="text-blue-700 dark:text-blue-400 underline">Cookie Policy</Link>. Block = no analytics/ads, tools still work.</p>
        </section>

        <section className="flex flex-wrap gap-2">
          <Link href="/privacy" className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm font-medium hover:border-[var(--color-accent)]">Read Privacy Policy <ExternalLink className="h-3.5 w-3.5" /></Link>
          <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]">Try a tool</Link>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TechArticle",
              headline: "Privacy Proof — Your Data Stays Local",
              description: "Network-tab proof that DevStackIO tools never transmit your inputs.",
              author: { "@type": "Organization", name: "DevStackIO", url: siteConfig.url },
              publisher: { "@type": "Organization", name: "DevStackIO", url: siteConfig.url },
              url: `${siteConfig.url}/privacy-proof`,
              datePublished: "2026-09-18",
              dateModified: "2026-09-18",
            }).replace(/</g, "\\u003c"),
          }}
        />
      </article>
    </div>
  );
}
