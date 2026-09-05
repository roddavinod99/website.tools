import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Message Sent",
  description: "Your message has been sent successfully. We will get back to you within 24-48 hours.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${siteConfig.url}/contact/success` },
};

export default function ContactSuccessPage() {
  return (
    <div className="container py-20 text-center">
      <div className="mx-auto max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-[var(--color-text)]">
          Message Sent!
        </h1>
        <p className="mt-3 text-[var(--color-text-muted)]">
          Thank you for reaching out. We have received your message and will respond
          within 24&ndash;48 hours.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Browse Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
