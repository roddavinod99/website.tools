import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "DevStackIO Accessibility Statement. Our commitment to WCAG 2.2 AA compliance, keyboard navigation, screen reader support, and inclusive design.",
  alternates: { canonical: `${siteConfig.url}/accessibility` },
  openGraph: {
    title: "Accessibility Statement | DevStackIO",
    description: "DevStackIO is committed to making all tools accessible per WCAG 2.2 AA. Keyboard navigation, screen reader support, and inclusive design.",
    url: `${siteConfig.url}/accessibility`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO Accessibility Statement" }],
  },
};

export default function AccessibilityPage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.accessibility || "2026-08-20";
  const effectiveDate = "2026-08-20";

  return (
    <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm text-surface-500 dark:text-dark-muted">
            Last updated: {lastUpdated} | Effective: {effectiveDate}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Accessibility Statement
          </h1>
          <p className="mt-2 text-lg text-surface-600 dark:text-dark-muted">
            DevStackIO is committed to making its website and every developer tool accessible to all people,
            regardless of ability or assistive technology.
          </p>
        </div>

        <div className="mb-8 p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
          <p className="text-sm text-brand-700 dark:text-brand-300">
            <strong>Our Commitment:</strong> We aim to conform to the Web Content Accessibility Guidelines
            (WCAG) 2.2 Level AA. Accessibility is treated as a design requirement for every new tool, not
            as an afterthought.
          </p>
        </div>

        <nav className="mb-8 p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-dark-text mb-3">Table of Contents</h2>
          <ol className="list-decimal pl-6 space-y-1 text-sm text-surface-600 dark:text-dark-muted">
            <li><a href="#1-conformance" className="text-brand-500 underline hover:text-brand-600">1. Conformance Status</a></li>
            <li><a href="#2-keyboard" className="text-brand-500 underline hover:text-brand-600">2. Keyboard Accessibility</a></li>
            <li><a href="#3-screen-readers" className="text-brand-500 underline hover:text-brand-600">3. Screen Reader Support</a></li>
            <li><a href="#4-visual" className="text-brand-500 underline hover:text-brand-600">4. Visual Design & Contrast</a></li>
            <li><a href="#5-content" className="text-brand-500 underline hover:text-brand-600">5. Content & Media</a></li>
            <li><a href="#6-limitations" className="text-brand-500 underline hover:text-brand-600">6. Known Limitations</a></li>
            <li><a href="#7-feedback" className="text-brand-500 underline hover:text-brand-600">7. Feedback & Contact</a></li>
          </ol>
        </nav>

        <div className="space-y-8 text-surface-600 dark:text-dark-muted">
          <section id="1-conformance">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">1. Conformance Status</h2>
            <p className="mt-2">
              The DevStackIO tools website is designed to conform to <strong>WCAG 2.2 Level AA</strong>. We
              build, review, and audit each tool against the success criteria before release, and we run
              automated accessibility checks as part of our testing pipeline.
            </p>
            <p className="mt-2">
              Where automated testing cannot verify a criterion, we rely on manual testing with keyboard-only
              navigation and screen readers.
            </p>
          </section>

          <section id="2-keyboard">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">2. Keyboard Accessibility</h2>
            <p className="mt-2">Every tool and page on this site is fully operable from the keyboard:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>All interactive elements — buttons, inputs, menus, and links — are reachable with the <kbd className="rounded border border-surface-300 px-1.5 py-0.5 text-xs dark:border-dark-border">Tab</kbd> key.</li>
              <li>Visible focus indicators are provided on every focusable element.</li>
              <li>Menus and dropdowns can be opened, navigated, and closed with the keyboard.</li>
              <li>A global keyboard shortcuts modal is available (press <kbd className="rounded border border-surface-300 px-1.5 py-0.5 text-xs dark:border-dark-border">?</kbd> or the shortcuts button in the header).</li>
              <li>No keyboard trap: focus can always be moved away from any component.</li>
            </ul>
          </section>

          <section id="3-screen-readers">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">3. Screen Reader Support</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Semantic HTML (landmarks, headings, lists, tables) is used throughout.</li>
              <li>Form fields have descriptive, programmatically associated labels.</li>
              <li>Decorative icons are hidden from assistive technology; meaningful icons include <code className="font-mono text-sm">aria-label</code> or accessible text.</li>
              <li>Status and error messages are announced to screen readers.</li>
              <li>Color is never the only means of conveying information.</li>
            </ul>
          </section>

          <section id="4-visual">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">4. Visual Design & Contrast</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Text and UI components meet the WCAG 2.2 AA contrast ratio requirements in both light and dark themes.</li>
              <li>Full dark mode support with system-preference detection.</li>
              <li>Responsive layout adapts to small screens and large zoom levels without loss of content or function.</li>
              <li>Text remains readable up to 200% zoom without horizontal scrolling.</li>
            </ul>
          </section>

          <section id="5-content">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">5. Content & Media</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Images used for content carry descriptive alternative text.</li>
              <li>All content is delivered as text or accessible SVG — no content-critical information is locked in images.</li>
              <li>Links have meaningful, self-descriptive text.</li>
            </ul>
          </section>

          <section id="6-limitations">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">6. Known Limitations</h2>
            <p className="mt-2">
              While we aim for full conformance, some third-party content or complex visual tools may have
              limitations. Known areas we continue to improve:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Some generated previews (e.g. QR codes, images) are inherently visual; we provide textual equivalents where practical.</li>
              <li>Advertisements served by third parties are outside our direct markup control.</li>
            </ul>
          </section>

          <section id="7-feedback">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">7. Feedback & Contact</h2>
            <p className="mt-2">
              We welcome your feedback on the accessibility of DevStackIO. If you encounter an accessibility
              barrier, please let us know so we can address it:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border space-y-2">
              <p><strong>Email:</strong> <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a></p>
              <p><strong>Contact page:</strong> <a href="/contact" className="text-brand-500 underline hover:text-brand-600">Contact DevStackIO</a></p>
            </div>
            <p className="mt-4">
              Please include the page or tool you were using and the assistive technology involved. We
              typically respond within 3 business days.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Related Documents</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-sm text-surface-600 dark:text-dark-muted">
            <li><a href="/security" className="text-brand-500 underline hover:text-brand-600">Security Policy</a></li>
            <li><a href="/privacy" className="text-brand-500 underline hover:text-brand-600">Privacy Policy</a></li>
            <li><a href="/terms" className="text-brand-500 underline hover:text-brand-600">Terms of Service</a></li>
          </ul>
        </div>
      </article>
    </div>
  );
}
