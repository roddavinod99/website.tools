import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";
import { ContactForm } from "@/components/legal/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with DevStackIO. Send us your questions, feedback, or suggestions. We typically respond within 24-48 hours.",
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: "Contact Us | DevStackIO",
    description: "Have questions or feedback? We'd love to hear from you.",
    url: `${siteConfig.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-3 text-surface-600 dark:text-dark-muted">
            Have questions, suggestions, or feedback? We&apos;d love to hear from you.
            We typically respond within 24&ndash;48 hours.
          </p>
          <p className="mt-4 text-surface-600 dark:text-dark-muted">
            Whether you need help with a specific tool, want to report an issue, discuss a partnership, or
            share ideas for the future of DevStackIO, this is the place. For a focused report, you can also
            use our{" "}
            <a href="/report-bug" className="text-brand-500 underline hover:text-brand-600">bug report</a>{" "}
            or{" "}
            <a href="/feature-request" className="text-brand-500 underline hover:text-brand-600">feature request</a>{" "}
            forms. We welcome questions from developers and visitors alike.
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-surface-200 bg-surface-50 p-4 text-sm text-surface-600 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">
          <strong>Business inquiries:</strong>{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="text-brand-500 hover:text-brand-600 underline">
            {siteConfig.contactEmail}
          </a>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
