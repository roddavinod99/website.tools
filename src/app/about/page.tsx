import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about DevStackIO and our mission.",
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          About DevStackIO
        </h1>
        <div className="mt-8 space-y-6 text-surface-600 dark:text-dark-muted">
          <p>
            DevStackIO is building the internet&apos;s best collection of free online tools
            for developers. We believe that high-quality developer tools should be
            accessible to everyone, everywhere.
          </p>
          <p>
            Every tool on DevStackIO is free, works entirely in your browser, and
            requires no account or login. Your data never leaves your device.
          </p>
          <p>
            Our mission is to create a platform that combines utilities, educational
            content, and best practices — making every page not just a tool but a
            learning resource.
          </p>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">
            Our Principles
          </h2>
          <ul className="space-y-3">
            <li><strong>Privacy first</strong> — We never store or share your data.</li>
            <li><strong>Free forever</strong> — Core tools will always be free.</li>
            <li><strong>Quality over quantity</strong> — Every tool is thoughtfully designed.</li>
            <li><strong>Developer experience</strong> — Fast, keyboard-friendly, accessible.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
